import { ODataComplexType, ODataEntitySet, ODataServiceConfig } from "odata-query-shared";
import { QueryBuilder } from "./queryBuilder.js";
import { serialize } from "./valueSerializer.js";


export type ODataResult<T> = {

    "@odata.context"?: string
    value: T[]
}

export type Dictionary<T> = { [key: string]: T }

export type ODataUriParts = {
    uriRoot: string,
    entityNamespace: string | null,
    entityName: string,
    entitySetNamespace: string | null;
    entitySetName: string;
    relativePath: string,
    query: Dictionary<string>
}

// TODO: document: 1. Add code comments, 2. Add article
// TODO: test all of these
export type RequestTools<T> = {
    fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>
    uriRoot: string
    uriBuilder?: (uri: ODataUriParts) => string
    requestInterceptor?: (uri: string, reqValues: RequestInit) => RequestInit
    responseParser?: (input: Response, uri: string, reqValues: RequestInit, defaultParser: (input: Response) => Promise<ODataResult<T>>) => Promise<ODataResult<T>>
}

function addLeadingSlash(path: string) {
    return path && `/${path}`
}

function removeTrailingSlash(path: string) {
    return path && path.replace(/\/$/, "")
}

function uriBuilder(uri: ODataUriParts) {
    let queryPart = Object
        .keys(uri.query)
        .map(x => `${x}=${uri.query[x]}`)
        .join("&");

    const uriRoot = removeTrailingSlash(uri.uriRoot)
    const entityName = addLeadingSlash(removeTrailingSlash(uri.relativePath))
    queryPart = queryPart && `?${queryPart}`

    return `${uriRoot}${entityName}${queryPart}`
}


function processResponse<TEntity>(response: Response, uri: any, reqValues: any, defaultProcessor: any): Promise<ODataResult<TEntity>> {
    // TODO: error handling
    if (!response.ok) {
        return new Promise<any>((_, rej) => rej(response));
    }

    return response.json();
}

type EntityQueryState<TKey, TQuery> = Partial<{
    key: TKey
    cast: string
    queryBuilder: (q: QueryBuilder<TQuery>) => QueryBuilder<TQuery>
}>

function firstNonNull<T>(defaultVal: T, ...items: (T | null | undefined)[]): T {
    for (let i = 0; i < items.length; i++) {
        if (items[i] != null) return items[i] as T;
    }

    return defaultVal;
}

// TODO: test something that does not have a key
export interface IEntityQueryWithoutId<TEntity, TQuery> {

    cast<TChild extends TEntity, TQueryChild extends TQuery>(fullyQualifiedName: string): IEntityQueryWithoutId<TChild, TQueryChild>;

    withQuery(queryBuilder: (q: QueryBuilder<TQuery>) => QueryBuilder<TQuery>): IEntityQueryWithoutId<TEntity, TQuery>;

    get(overrideRequestTools?: Partial<RequestTools<TEntity>>): Promise<ODataResult<TEntity>>;

    count(overrideRequestTools?: Partial<RequestTools<TEntity>>): Promise<ODataResult<TEntity>>;
}

export class EntityQuery<TEntity, TKey, TQuery> implements IEntityQueryWithoutId<TEntity, TQuery> {

    state: EntityQueryState<TKey, TQuery>

    constructor(
        private requestTools: RequestTools<TEntity>,
        private type: ODataComplexType,
        private entitySet: ODataEntitySet,
        private root: ODataServiceConfig,
        state: EntityQueryState<TKey, TQuery> | undefined = undefined) {

        this.state = state || {};
    }

    withKey(key: TKey) {
        if (key === undefined) {
            throw new Error("Cannot set key to undefined. Try setting to null instead");
        }

        return new EntityQuery<TEntity, TKey, TQuery>(
            this.requestTools,
            this.type,
            this.entitySet,
            this.root,
            { ...this.state, key });
    }

    cast<TChild extends TEntity, TQueryChild extends TQuery>(fullyQualifiedName: string): EntityQuery<TChild, TKey, TQueryChild> {
        const dot = fullyQualifiedName.lastIndexOf(".")
        const namespace = dot === -1 ? "" : fullyQualifiedName.substring(0, dot);
        const name = dot === -1 ? fullyQualifiedName : fullyQualifiedName.substring(dot + 1);

        // TODO: tests for child entites with no namespace
        const type = this.root.types[namespace] && this.root.types[namespace][name];
        if (!type) {
            throw new Error(`Unknown Entity type ${fullyQualifiedName}`);
        }

        return new EntityQuery<TChild, TKey, TQueryChild>(
            // TODO: cast as any
            this.requestTools as any,
            this.type,
            this.entitySet,
            this.root,
            // TODO: cast as any
            { ...this.state, cast: fullyQualifiedName } as any);
    }

    withQuery(queryBuilder: (q: QueryBuilder<TQuery>) => QueryBuilder<TQuery>) {

        return new EntityQuery<TEntity, TKey, TQuery>(
            this.requestTools,
            this.type,
            this.entitySet,
            this.root,
            { ...this.state, queryBuilder });
    }

    get(overrideRequestTools?: Partial<RequestTools<TEntity>>) {
        const query = this._getQueryParts(this.state.queryBuilder)
        return this.fetch(this._entitySetName(), query, overrideRequestTools)
    }

    count(overrideRequestTools?: Partial<RequestTools<TEntity>>): Promise<ODataResult<TEntity>> {
        const query = this._getQueryParts(this.state.queryBuilder)
        return this.fetch(`${this._entitySetName()}/$count`, query, overrideRequestTools);
    }

    _entitySetName() {
        let uri = this.entitySet.name;
        if (this.state.key !== undefined) {

            // TODO: composite_keys (search whole proj for composite_keys)
            const keyType = this.type.keyProp && this.type.properties[this.type.keyProp]?.type
            if (!keyType) {
                const ns = this.type.namespace && `${this.type.namespace}.`
                throw new Error(`Type ${ns}${this.type.name} does not have a key property`);
            }

            const k = this.state.key === null ? "null" : this.state.key;
            uri = `${uri}(${serialize(k, keyType)})`
        }

        if (this.state.cast) {
            return `${uri}/${this.state.cast}`
        }

        return uri;
    }

    private _getQueryParts(query: ((q: QueryBuilder<TQuery>) => QueryBuilder<TQuery>) | null | undefined) {
        return query
            ? query(new QueryBuilder<TQuery>(this.type, this.root.types)).toQueryParts()
            : {};
    }

    private fetch(relativePath: string, query: Dictionary<string>, overrideRequestTools: Partial<RequestTools<TEntity>> | undefined) {
        const uriB = firstNonNull(uriBuilder, overrideRequestTools?.uriBuilder, this.requestTools.uriBuilder);
        const uri = uriB({
            uriRoot: firstNonNull(this.requestTools.uriRoot, overrideRequestTools?.uriRoot),
            // if namespace === "", give null instead
            entityNamespace: this.type.namespace || null,
            entityName: this.type.name,
            // if namespace === "", give null instead
            entitySetNamespace: this.entitySet.namespace || null,
            entitySetName: this.entitySet.name,
            relativePath: relativePath,
            query: query
        });

        let init: RequestInit = firstNonNull(
            (_, x) => x,
            overrideRequestTools?.requestInterceptor,
            this.requestTools.requestInterceptor)(uri, {
                headers: {
                    "Content-Type": "application/json; charset=utf-8",
                    "Accept": "application/json"
                }
            })

        const responseParser = firstNonNull(
            processResponse, this.requestTools.responseParser, overrideRequestTools?.responseParser);

        return this.requestTools
            .fetch(uri, init)
            .then(x => responseParser(x, uri, init, x => processResponse(x, null, null, null)));
    }
}
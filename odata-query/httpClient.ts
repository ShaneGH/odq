import { ODataComplexType, ODataEntitySet, ODataPropertyType, ODataServiceConfig } from "odata-query-shared";
import { IQueryBulder, QueryBuilder } from "./queryBuilder.js";
import { QueryComplexObject } from "./typeRefBuilder.js";
import { serialize } from "./valueSerializer.js";


export type ODataResultMetadata = Partial<{

    "@odata.context": string
}>

export type ODataMultiResult<T> = ODataResultMetadata & {

    value: T[]
}

export type ODataSingleResult<T> = ODataResultMetadata & T

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
export type RequestTools = {
    /* 
     * A basic http client. Set this to a browser fetch, node18 fetch or a client from the the node-fetch npm module
     */
    fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>

    /* 
     * The root URI of all collections. Something like: https://my.service.com/my-odata-collections",
     */
    uriRoot: string

    /* 
     * Interceptor for uri building
     * Optional
     */
    uriInterceptor?: (uri: ODataUriParts) => string

    /* 
     * Interceptor for http requests. Use this to add custom http headers
     */
    requestInterceptor?: (uri: string, reqValues: RequestInit) => RequestInit

    /* 
     * Interceptor for http responses. Use this to add custom error handling or deserialization
     */
    responseInterceptor?: (input: Response, uri: string, reqValues: RequestInit, defaultInterceptor: (input: Response) => Promise<any>) => Promise<any>
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


function processResponse<TEntity>(response: Response, uri: any, reqValues: any, defaultProcessor: any): Promise<ODataMultiResult<TEntity>> {
    // TODO: error handling
    if (!response.ok) {
        return new Promise<any>((_, rej) => rej(response));
    }

    return response.json();
}

type Dict<T> = { [key: string]: T }

type EntityQueryState = Partial<{
    path: string[]
    query: Dict<string>
}>

function firstNonNull<T>(defaultVal: T, ...items: (T | null | undefined)[]): T {
    for (let i = 0; i < items.length; i++) {
        if (items[i] != null) return items[i] as T;
    }

    return defaultVal;
}

export type CastSelection<TNewEntityQuery> = {
    type: ODataComplexType
}

// TODO: composite_keys (search whole proj for composite_keys)
function tryFindKeyType(
    type: ODataComplexType,
    root: ODataServiceConfig): ODataPropertyType | null {

    if (!type.keyProp) {
        if (!type.baseType) {
            return null;
        }

        const parent = root.types[type.baseType.namespace] && root.types[type.baseType.namespace][type.baseType.name];
        if (!parent) {
            throw new Error(`Could not find parent type: ${fullTypeName(type.baseType.namespace, type.baseType.name)}`);
        }

        return tryFindKeyType(parent, root);
    }

    const keyType = type.properties[type.keyProp]?.type
    if (!keyType) {
        throw new Error(`Type ${fullTypeName(type.namespace, type.name)} does not have a key property`);
    }

    return keyType;

    function fullTypeName(namespace: string, name: string) {
        const ns = namespace && `${namespace}.`
        return `${ns}${type.name}`;

    }
}

// TODO: deconstruct into different functions/files
// TODO: do not return instances from any methods. Return interfaces instead
// TODO: not a great name: EntityQuery
// TODO: method documentation
export class EntityQuery<TEntity, TKey, TQuery, TCaster> {

    state: EntityQueryState

    constructor(
        private requestTools: RequestTools,
        private type: ODataComplexType,
        private entitySet: ODataEntitySet,
        private root: ODataServiceConfig,
        state: EntityQueryState | undefined = undefined) {

        this.state = state || {
            path: [entitySet.name]
        };
    }

    withKey(key: TKey) {
        if (this.state.query) {
            throw new Error("You cannot add query components before doing a key lookup");
        }

        if (key === undefined) {
            throw new Error("Cannot set key to undefined. Try setting to null instead");
        }

        if (!this.state.path?.length) {
            throw new Error("Invalid path");
        }


        // TODO: composite_keys (search whole proj for composite_keys)
        const keyType = tryFindKeyType(this.type, this.root);
        if (!keyType) {
            const ns = this.type.namespace && `${this.type.namespace}.`
            throw new Error(`Type ${ns}${this.type.name} does not have a key property`);
        }

        const k = key === null ? "null" : serialize(key, keyType);
        const path = [
            `${this.state.path[0]}(${k})`,
            ...this.state.path.slice(1)
        ]

        return new EntityQuery<TEntity, never, TQuery, TCaster>(
            this.requestTools,
            this.type,
            this.entitySet,
            this.root,
            { ...this.state, path });
    }

    cast<TNewEntityQuery>(
        cast: (caster: TCaster) => CastSelection<TNewEntityQuery>): TNewEntityQuery {

        if (this.state.query) {
            throw new Error("You cannot add query components before casting");
        }

        const newT = cast(this.buildCaster());
        const fullyQualifiedName = newT.type.namespace ? `${newT.type.namespace}.${newT.type.name}` : newT.type.name;
        const path = this.state.path?.length ? [...this.state.path, fullyQualifiedName] : [fullyQualifiedName];

        // TODO: Are these anys harmful, can they be removed?
        return new EntityQuery<any, any, any, any>(
            this.requestTools,
            newT.type,
            this.entitySet,
            this.root,
            { ...this.state, path }) as TNewEntityQuery;
    }

    // TODO: this allows the user to do illegal queries on singletons:
    //  The query specified in the URI is not valid. The requested resource is not a collection. Query options $filter, $orderby, $count, $skip, and $top can be applied only on collections
    withQuery(queryBuilder: (q: QueryBuilder<TQuery>) => QueryBuilder<TQuery>) {

        if (this.state.query) {
            throw new Error("This request already has a query");
        }

        const query = queryBuilder(new QueryBuilder<TQuery>(this.type, this.root.types)).toQueryParts(true)
        return new EntityQuery<TEntity, TKey, TQuery, TCaster>(
            this.requestTools,
            this.type,
            this.entitySet,
            this.root,
            { ...this.state, query });
    }

    get(overrideRequestTools?: Partial<RequestTools>): Promise<ODataMultiResult<TEntity>> {
        return this.fetch(this._entitySetName(), overrideRequestTools)
    }

    // TODO: better way???
    getSingle(overrideRequestTools?: Partial<RequestTools>): Promise<ODataSingleResult<TEntity>> {
        return this.fetch(this._entitySetName(), overrideRequestTools)
    }

    count(overrideRequestTools?: Partial<RequestTools>): Promise<ODataMultiResult<TEntity>> {
        return this.fetch(`${this._entitySetName()}/$count`, overrideRequestTools);
    }

    _entitySetName() {

        return (this.state.path || []).join("/");
    }

    private fetch(relativePath: string, overrideRequestTools: Partial<RequestTools> | undefined): Promise<any> {
        const uriB = firstNonNull(uriBuilder, overrideRequestTools?.uriInterceptor, this.requestTools.uriInterceptor);
        const uri = uriB({
            uriRoot: firstNonNull(this.requestTools.uriRoot, overrideRequestTools?.uriRoot),
            // if namespace === "", give null instead
            entityNamespace: this.type.namespace || null,
            entityName: this.type.name,
            // if namespace === "", give null instead
            entitySetNamespace: this.entitySet.namespace || null,
            entitySetName: this.entitySet.name,
            relativePath: relativePath,
            query: this.state.query || {}
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

        const responseInterceptor = firstNonNull(
            processResponse, this.requestTools.responseInterceptor, overrideRequestTools?.responseInterceptor);

        return this.requestTools
            .fetch(uri, init)
            .then(x => responseInterceptor(x, uri, init, x => processResponse(x, null, null, null)));
    }

    // TODO: duplicate_logic_key: caster
    private buildCaster(): TCaster {
        const inherits = Object
            .keys(this.root.types)
            .map(ns => Object
                .keys(this.root.types[ns])
                .map(t => this.root.types[ns][t]))
            .reduce((s, x) => [...s, ...x], [])
            .filter(x => x.baseType
                && x.baseType.namespace === this.type.namespace
                && x.baseType.name === this.type.name);

        const distinctNames = Object.keys(inherits
            .reduce((s, x) => ({ ...s, [x.name]: true }), {} as { [key: string]: boolean }))

        const name = inherits.length === distinctNames.length
            ? (x: ODataComplexType) => x.name
            // TODO: test
            // TODO: this logic will be duplicated in the code gen project. Possible to merge?
            : (x: ODataComplexType) => `${x.namespace}.${x.name}`.replace(/[^\w]/g, "_")

        return inherits
            .reduce((s, type) => ({
                ...s,
                // TODO: any
                [name(type)]: function (): CastSelection<any> {
                    return {
                        type
                    }
                }
                // TODO: any
            }), {} as any);
    }
}
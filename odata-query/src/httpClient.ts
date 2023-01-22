import { ODataComplexType, ODataEntitySet, ODataTypeRef, ODataServiceConfig, ODataTypeName, ODataSingleTypeRef, ODataServiceTypes } from "odata-query-shared";
import { IQueryBulder, PrimitiveQueryBuilder, QueryBuilder, QueryStringBuilder } from "./queryBuilder.js";
import { QueryComplexObject } from "./typeRefBuilder.js";
import { serialize } from "./valueSerializer.js";


export type ODataResultMetadata = Partial<{

    "@odata.context": string
}>

// TODO: rename ODataCollectionResult
export type ODataMultiResult<T> = ODataResultMetadata & {

    value: T[]
}

export type ODataSingleResult<T> = ODataResultMetadata & T

export type Dictionary<T> = { [key: string]: T }

export type ODataUriParts = {
    uriRoot: string,
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

type Dict<T> = { [key: string]: T }

type EntityQueryState = {
    path: string[]
    query?: Dict<string>
}

export type CastSelection<TNewEntityQuery> = {
    type: ODataTypeRef
}

export type SubPathSelection<TNewEntityQuery> = {
    propertyName: string
}

type ComplexLookupResult = {
    isComplex: true
    result: ODataComplexType
}

type PrimitiveLookupResult = {
    isComplex: false
    result: ODataTypeName
}

type LookupResult = ComplexLookupResult | PrimitiveLookupResult

function lookup(
    type: ODataTypeName,
    root: ODataServiceTypes): LookupResult {

    if (type.namespace === "Edm") {
        return { isComplex: false, result: type }
    }

    const result = root[type.namespace] && root[type.namespace][type.name];
    if (!result) {
        throw new Error(`Could not find type ${type.namespace && `${type.namespace}.`}${type.name}`)
    }

    return { isComplex: true, result };
}

function lookupComplex(
    type: ODataTypeName,
    root: ODataServiceTypes) {

    const result = lookup(type, root);
    if (!result.isComplex) {
        throw new Error(`Could not find complex type ${type.namespace && `${type.namespace}.`}${type.name}`)
    }

    return result.result;
}

function tryFindKeyName(
    type: ODataTypeName,
    root: ODataServiceTypes): string | null {

    const t = lookupComplex(type, root);
    if (t.keyProp) return t.keyProp;

    const parent = tryFindBaseType(t, root);
    return (parent && tryFindKeyName(parent, root)) || null
}

// TODO: composite_keys (search whole proj for composite_keys)
function tryFindKeyType(
    type: ODataTypeName,
    root: ODataServiceTypes): ODataTypeRef | null {

    const t = lookupComplex(type, root);
    const key = tryFindKeyName(t, root);
    return (key && tryFindPropertyType(t, key, root)) || null;
}

function tryFindBaseType(
    type: ODataComplexType,
    root: ODataServiceTypes) {

    if (!type.baseType) {
        return null;
    }

    return (root[type.baseType.namespace] && root[type.baseType.namespace][type.baseType.name])
        || err(type.baseType);

    function err(type: ODataTypeName): null {
        const ns = type.namespace && `${type.namespace}.`
        throw new Error(`Base type ${ns}${type.name} does not exist`);
    }
}

function tryFindPropertyType(
    type: ODataTypeName,
    propertyName: string,
    root: ODataServiceTypes): ODataTypeRef | null {

    const t = lookupComplex(type, root);
    if (t.properties[propertyName]) return t.properties[propertyName].type;

    const parent = tryFindBaseType(t, root);
    return (parent && tryFindPropertyType(parent, propertyName, root)) || null;
}

// might return duplicates if and child property names clash
function listAllProperties(
    type: ODataComplexType,
    root: ODataServiceTypes,
    includeParent = true): string[] {

    const parent = includeParent
        ? tryFindBaseType(type, root)
        : null;

    return Object
        .keys(type.properties)
        .concat(parent
            ? listAllProperties(parent, root, true)
            : []);
}

// unwraps an ODataTypeRef to 0 or 1 levels of collections or throws an error
function getCastingTypeRef(type: ODataTypeRef) {

    if (!type.isCollection) {
        return {
            name: type.name,
            namespace: type.namespace,
            isCollection: false
        }
    }

    if (!type.collectionType.isCollection) {
        return {
            name: type.collectionType.name,
            namespace: type.collectionType.namespace,
            isCollection: true
        }
    }

    throw new Error("Casting collections of collections is not yet supported");
}

// TODO: test
export enum WithKeyType {
    /*
     * Specifies that a key should be embedded added as a function call
     * e.g. ~/Users(1)
     */
    FunctionCall = "FunctionCall",

    /*
     * Specifies that a key should be embedded added as a path segment
     * e.g. ~/Users/1
     */
    PathSegment = "PathSegment"
}

const defaultRequestTools: Partial<RequestTools> = {
    uriInterceptor: (uri: ODataUriParts) => {

        let queryPart = Object
            .keys(uri.query)
            .map(x => `${x}=${uri.query[x]}`)
            .join("&");

        const uriRoot = removeTrailingSlash(uri.uriRoot)
        const entityName = addLeadingSlash(removeTrailingSlash(uri.relativePath))
        queryPart = queryPart && `?${queryPart}`

        return `${uriRoot}${entityName}${queryPart}`
    },

    requestInterceptor: (_, x) => x,

    // NOTE: defaultProcessor will always be null
    responseInterceptor: <TEntity>(response: Response, uri: any, reqValues: any, defaultProcessor: any): Promise<ODataMultiResult<TEntity>> => {
        // TODO: error handling
        if (!response.ok) {
            return new Promise<any>((_, rej) => rej(response));
        }

        return response.json();
    }
}


// TODO: deconstruct into different functions/files
// TODO: do not return instances from any methods. Return interfaces instead
// TODO: not a great name: EntityQuery
// TODO: method documentation

// NOTE: these generic type names are copy pasted into code gen project \src\codeGen\utils.ts
// NOTE: make sure that they stay in sync
export class EntityQuery<TEntity, TKey, TQueryBuilder, TCaster, TSingleCaster, TSubPath, TSingleSubPath, TResult> {

    state: EntityQueryState

    constructor(
        private requestTools: RequestTools,
        private type: ODataTypeRef,
        private entitySet: ODataEntitySet,
        private root: ODataServiceConfig,
        state: EntityQueryState | undefined = undefined) {

        this.state = state || {
            path: [entitySet.name]
        };
    }

    withKey(key: TKey, keyEmbedType = WithKeyType.FunctionCall) {
        if (this.state.query) {
            throw new Error("You cannot add query components before doing a key lookup");
        }

        if (key === undefined) {
            throw new Error("Cannot set key to undefined. Try setting to null instead");
        }

        if (!this.state.path.length) {
            throw new Error("Invalid path");
        }

        if (!this.type.isCollection) {
            throw new Error("Cannot search for a single type by key. You must search a collection instead");
        }

        if (this.type.collectionType.isCollection) {
            throw new Error("Cannot search a collection of collections by key. You must search a collection instead");
        }

        // if (this.type.category !== QueryTypeCategory.ComplexType) {
        //     throw new Error("Primitive types do not have keys");
        // }

        // TODO: composite_keys (search whole proj for composite_keys)
        const keyType = tryFindKeyType(this.type.collectionType, this.root.types);
        if (!keyType) {
            const ns = this.type.collectionType.namespace && `${this.type.collectionType.namespace}.`
            throw new Error(`Type ${ns}${this.type.collectionType.name} does not have a key property`);
        }

        const k = key === null ? "null" : serialize(key, keyType);
        const path = keyEmbedType === WithKeyType.FunctionCall
            ? [
                ...this.state.path.slice(0, this.state.path.length - 1),
                `${this.state.path[this.state.path.length - 1]}(${k})`,
            ]
            // TODO: test
            : keyEmbedType === WithKeyType.PathSegment
                ? [
                    ...this.state.path,
                    k,
                ]
                : null;

        if (!path) {
            throw new Error(`Invalid WithKeyType: ${keyEmbedType}`);
        }

        return new EntityQuery<TEntity, never, TQueryBuilder, TSingleCaster, TSingleCaster, TSingleSubPath, never, ODataSingleResult<TEntity>>(
            this.requestTools,
            this.type.collectionType,
            this.entitySet,
            this.root,
            { ...this.state, path });
    }

    cast<TNewEntityQuery>(
        cast: (caster: TCaster) => CastSelection<TNewEntityQuery>): TNewEntityQuery {

        if (this.state.query) {
            throw new Error("You cannot add query components before casting");
        }

        // // TODO
        // if (this.type.category !== QueryTypeCategory.ComplexType) {
        //     throw new Error("Primitive types cannot be casted");
        // }

        const newT = cast(this.buildCaster());
        const { namespace, name } = getCastingTypeRef(newT.type);

        const fullyQualifiedName = namespace ? `${namespace}.${name}` : name;
        const path = this.state.path?.length ? [...this.state.path, fullyQualifiedName] : [fullyQualifiedName];

        // TODO: Are these anys harmful, can they be removed?
        return new EntityQuery<any, any, any, any, any, any, any, any>(
            this.requestTools,
            newT.type,
            this.entitySet,
            this.root,
            { ...this.state, path }) as TNewEntityQuery;
    }

    subPath<TNewEntityQuery>(
        subPath: (caster: TSubPath) => SubPathSelection<TNewEntityQuery>): TNewEntityQuery {

        if (this.state.query) {
            throw new Error("You cannot add query components before navigating a sub path");
        }

        if (this.type.isCollection) {
            throw new Error("You cannot navigate the subpath of a collection. Try to filter by key first");
        }

        // // TODO
        // if (this.type.category !== QueryTypeCategory.ComplexType) {
        //     throw new Error("Primitive types do not have sub paths");
        // }

        // console.log("##### 1", this.buildSubPath())
        // console.log("##### 2", subPath.toString())
        // console.log("##### 3", subPath(this.buildSubPath()))

        const newT = subPath(this.buildSubPath(this.type));
        const prop = tryFindPropertyType(this.type, newT.propertyName, this.root.types);
        if (!prop) {
            throw new Error(`Invalid property ${newT.propertyName}`);
        }

        const path = this.state.path?.length ? [...this.state.path, newT.propertyName] : [newT.propertyName];

        // TODO: Are these anys harmful, can they be removed?
        return new EntityQuery<any, any, any, any, any, any, any, any>(
            this.requestTools,
            prop,
            this.entitySet,
            this.root,
            { ...this.state, path }) as TNewEntityQuery;
    }

    // TODO: this allows the user to do illegal queries on singletons:
    //  The query specified in the URI is not valid. The requested resource is not a collection. Query options $filter, $orderby, $count, $skip, and $top can be applied only on collections
    withQuery(queryBuilder: (q: TQueryBuilder) => TQueryBuilder, urlEncode = true) {

        if (this.state.query) {
            throw new Error("This request already has a query");
        }

        // TODO: this is a temp hack
        const { name, namespace } = getCastingTypeRef(this.type);

        const t = lookup({ name, namespace }, this.root.types)
        const queryObjBuilder = t.isComplex
            ? this.executeComplexQueryBuilder(t, queryBuilder as any)
            : this.executePrimitiveQueryBuilder(queryBuilder as any);

        return new EntityQuery<TEntity, TKey, TQueryBuilder, TCaster, TSingleCaster, TSubPath, TSingleSubPath, TResult>(
            this.requestTools,
            this.type,
            this.entitySet,
            this.root,
            { ...this.state, query: queryObjBuilder.toQueryParts(urlEncode) });
    }

    private executePrimitiveQueryBuilder(
        queryBuilder: (q: PrimitiveQueryBuilder<TEntity>) => PrimitiveQueryBuilder<TEntity>): QueryStringBuilder {

        return queryBuilder(new PrimitiveQueryBuilder<TEntity>());
    }

    private executeComplexQueryBuilder(
        type: ComplexLookupResult,
        queryBuilder: (q: QueryBuilder<TEntity>) => QueryBuilder<TEntity>): QueryStringBuilder {

        return queryBuilder(new QueryBuilder<TEntity>(type.result, this.root.types));
    }

    get(overrideRequestTools?: Partial<RequestTools>): Promise<TResult> {
        return this.getAs<TResult>(overrideRequestTools)
    }

    getAs<TOverrideResultType>(overrideRequestTools?: Partial<RequestTools>): Promise<TOverrideResultType> {
        return this.fetch(this.path(), overrideRequestTools)
    }

    // TODO: test
    // TODO: is response type correct?
    count(overrideRequestTools?: Partial<RequestTools>): Promise<TResult> {
        return this.fetch(this.path("$count"), overrideRequestTools);
    }

    private path(append?: string[] | string | undefined) {

        let path = this.state.path;
        if (typeof append === "string") {
            path = [...path, append]
        } else if (Array.isArray(append)) {
            path = [...path, ...append]
        }

        return path.join("/");
    }

    private fetch(relativePath: string, overrideRequestTools: Partial<RequestTools> | undefined): Promise<any> {

        const tools = {
            ...defaultRequestTools,
            ...this.requestTools,
            ...(overrideRequestTools || {})
        };

        const uri = tools.uriInterceptor!({
            uriRoot: tools.uriRoot,
            // if namespace === "", give null instead
            entitySetNamespace: this.entitySet.namespace || null,
            entitySetName: this.entitySet.name,
            relativePath: relativePath,
            query: this.state.query || {}
        });

        let init: RequestInit = tools.requestInterceptor!(uri, {
            headers: {
                "Content-Type": "application/json; charset=utf-8",
                "Accept": "application/json"
            }
        });

        return tools
            .fetch(uri, init)
            .then(x => tools.responseInterceptor!(x, uri, init, x => defaultRequestTools.responseInterceptor!(x, uri, init, null as any)));
    }

    // TODO: duplicate_logic_key: caster
    private buildCaster(): TCaster {

        const { namespace, name, isCollection } = getCastingTypeRef(this.type);

        const inherits = Object
            .keys(this.root.types)
            .map(ns => Object
                .keys(this.root.types[ns])
                .map(t => this.root.types[ns][t]))
            .reduce((s, x) => [...s, ...x], [])
            .filter(x => x.baseType
                && x.baseType.namespace === namespace
                && x.baseType.name === name)
            .map(x => {
                const o: ODataSingleTypeRef = { isCollection: false, name: x.name, namespace: x.namespace }
                return o
            });

        const distinctNames = Object.keys(inherits
            .reduce((s, x) => ({ ...s, [x.name]: true }), {} as { [key: string]: boolean }))

        const getName = inherits.length === distinctNames.length
            ? (x: ODataSingleTypeRef) => x.name
            // TODO: test
            // TODO: this logic will be duplicated in the code gen project. Possible to merge?
            // TODO: change "_" character in config file
            : (x: ODataSingleTypeRef) => `${x.namespace}.${x.name}`.replace(/[^\w]/g, "_")

        const reAddCollection = (t: ODataSingleTypeRef): ODataTypeRef => isCollection
            ? { isCollection: true, collectionType: t }
            : t;

        return inherits
            .reduce((s, type) => ({
                ...s,
                // TODO: any
                [getName(type)]: function (): CastSelection<any> {
                    return {
                        type: reAddCollection(type)
                    }
                }
                // TODO: any
            }), {} as any);
    }

    private buildSubPath(type: ODataTypeName): TSubPath {

        return listAllProperties(lookupComplex(type, this.root.types), this.root.types, true)
            // TODO: any
            .reduce((s, x) => ({ ...s, [x]: { propertyName: x } }), {} as any);
    }
}
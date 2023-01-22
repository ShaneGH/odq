import { ODataComplexType, ODataEntitySet, ODataTypeRef, ODataServiceConfig, ODataTypeName, ODataSingleTypeRef } from "odata-query-shared";
import { IQueryBulder, QueryBuilder } from "./queryBuilder.js";
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

type EntityQueryState = {
    path: string[]
    query?: Dict<string>
}

function firstNonNull<T>(defaultVal: T, ...items: (T | null | undefined)[]): T {
    for (let i = 0; i < items.length; i++) {
        if (items[i] != null) return items[i] as T;
    }

    return defaultVal;
}

export type CastSelection<TNewEntityQuery> = {
    type: ODataComplexType
}

export type SubPathSelection<TNewEntityQuery> = {
    propertyName: string
}

function tryFindKeyName(
    type: ODataComplexType,
    root: ODataServiceConfig): string | null {

    if (type.keyProp) return type.keyProp;

    const parent = tryFindBaseType(type, root);
    return (parent && tryFindKeyName(parent, root)) || null
}

// TODO: composite_keys (search whole proj for composite_keys)
function tryFindKeyType(
    type: ODataComplexType,
    root: ODataServiceConfig): ODataTypeRef | null {

    const key = tryFindKeyName(type, root);
    return (key && tryFindPropertyType(type, key, root)) || null;
}

function tryFindBaseType(
    type: ODataComplexType,
    root: ODataServiceConfig) {

    if (!type.baseType) {
        return null;
    }

    return (root.types[type.baseType.namespace] && root.types[type.baseType.namespace][type.baseType.name])
        || err(type.baseType);

    function err(type: ODataTypeName): null {
        const ns = type.namespace && `${type.namespace}.`
        throw new Error(`Base type ${ns}${type.name} does not exist`);
    }
}

function tryFindPropertyType(
    type: ODataComplexType,
    propertyName: string,
    root: ODataServiceConfig): ODataTypeRef | null {

    if (type.properties[propertyName]) return type.properties[propertyName].type;

    const parent = tryFindBaseType(type, root);
    return (parent && tryFindPropertyType(parent, propertyName, root)) || null;
}

// might return duplicates if and child property names clash
function listAllProperties(
    type: ODataComplexType,
    root: ODataServiceConfig,
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

// TODO: duplicate_logic_key: subPath (begin)
enum ObjectType {
    ComplexType = "ComplexType",
    PrimitiveType = "PrimitiveType"
}

type IsObjectDescription<T extends ObjectType> = {
    objectType: T
}

type IsComplexType = IsObjectDescription<ObjectType.ComplexType> & {
    complexType: ODataComplexType
}

type IsPrimitiveType = IsObjectDescription<ObjectType.PrimitiveType> & {
    primitiveType: ODataSingleTypeRef
}

type EntityTypeInfo = {
    // the number of collection in this type info. e.g. MyType[][][] === 3
    collectionDepth: number
    // if null, this is a primitive object
    type: IsComplexType | IsPrimitiveType
}

function getEntityTypeInfo(
    propertyType: ODataTypeRef,
    root: ODataServiceConfig): EntityTypeInfo {

    if (propertyType.isCollection) {
        const innerResult = getEntityTypeInfo(propertyType.collectionType, root)
        return {
            ...innerResult,
            collectionDepth: innerResult.collectionDepth + 1
        }
    }

    if (propertyType.namespace === "Edm") {
        return {
            collectionDepth: 0,
            type: {
                objectType: ObjectType.PrimitiveType,
                primitiveType: propertyType
            }
        };
    }

    const type = root.types[propertyType.namespace] && root.types[propertyType.namespace][propertyType.name]
    if (!type) {
        const ns = propertyType.namespace && `${propertyType.namespace}.`
        throw new Error(`Could not find key for type ${ns}${propertyType.name}`);
    }

    return {
        collectionDepth: 0,
        type: {
            objectType: ObjectType.ComplexType,
            complexType: type
        }
    };
}
// TODO: duplicate_logic_key: subPath (end)

// TODO: test
export enum WithKeyType {
    /*
     * Specifies that a key should be embedded added as a function call
     * e.g. ~/Users(1)
     */
    FunctionCall = "PathSegment",

    /*
     * Specifies that a key should be embedded added as a path segment
     * e.g. ~/Users/1
     */
    PathSegment = "PathSegment"
}

// export enum QueryTypeCategory {
//     ComplexType = "ComplexType",
//     PrimitiveType = "PrimitiveType"
// }

// export type ComplexCategory = {
//     category: QueryTypeCategory.ComplexType
//     type: ODataComplexType
// }

// export type PrimitiveCategory = {
//     category: QueryTypeCategory.PrimitiveType
//     type: string
// }

// TODO: deconstruct into different functions/files
// TODO: do not return instances from any methods. Return interfaces instead
// TODO: not a great name: EntityQuery
// TODO: method documentation
export class EntityQuery<TEntity, TKey, TQuery, TCaster, TSingleCaster, TSubPath, TSingleSubPath, TResult> {

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

        // if (this.type.category !== QueryTypeCategory.ComplexType) {
        //     throw new Error("Primitive types do not have keys");
        // }

        // TODO: composite_keys (search whole proj for composite_keys)
        const keyType = tryFindKeyType(this.type, this.root);
        if (!keyType) {
            const ns = this.type.namespace && `${this.type.namespace}.`
            throw new Error(`Type ${ns}${this.type.name} does not have a key property`);
        }

        const k = key === null ? "null" : serialize(key, keyType);
        const path = keyEmbedType === WithKeyType.FunctionCall
            ? [
                ...this.state.path.slice(0, this.state.path.length - 1),
                `${this.state.path[this.state.path.length - 1]}(${k})`,
            ]
            : keyEmbedType === WithKeyType.FunctionCall
                ? [
                    ...this.state.path,
                    k,
                ]
                : null;

        if (!path) {
            throw new Error(`Invalid WithKeyType: ${keyEmbedType}`);
        }

        return new EntityQuery<TEntity, never, TQuery, TSingleCaster, TSingleCaster, TSingleSubPath, never, ODataSingleResult<TEntity>>(
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

        // // TODO
        // if (this.type.category !== QueryTypeCategory.ComplexType) {
        //     throw new Error("Primitive types cannot be casted");
        // }

        const newT = cast(this.buildCaster());
        const fullyQualifiedName = newT.type.namespace ? `${newT.type.namespace}.${newT.type.name}` : newT.type.name;
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

        // // TODO
        // if (this.type.category !== QueryTypeCategory.ComplexType) {
        //     throw new Error("Primitive types do not have sub paths");
        // }

        // console.log("##### 1", this.buildSubPath())
        // console.log("##### 2", subPath.toString())
        // console.log("##### 3", subPath(this.buildSubPath()))

        const newT = subPath(this.buildSubPath());
        const prop = tryFindPropertyType(this.type, newT.propertyName, this.root);
        if (!prop) {
            throw new Error(`Invalid property ${newT.propertyName}`);
        }

        const typeInfo = getEntityTypeInfo(prop, this.root)
        if (typeInfo.collectionDepth > 1) {
            throw new Error("TODO");
        }

        if (typeInfo.type.objectType === ObjectType.PrimitiveType) {
            throw new Error("TODO");
        }

        const path = this.state.path?.length ? [...this.state.path, newT.propertyName] : [newT.propertyName];

        // TODO: Are these anys harmful, can they be removed?
        return new EntityQuery<any, any, any, any, any, any, any, any>(
            this.requestTools,
            typeInfo.type.complexType,
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
        return new EntityQuery<TEntity, TKey, TQuery, TCaster, TSingleCaster, TSubPath, TSingleSubPath, TResult>(
            this.requestTools,
            this.type,
            this.entitySet,
            this.root,
            { ...this.state, query });
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

    private buildSubPath(): TSubPath {

        return listAllProperties(this.type, this.root, true)
            // TODO: any
            .reduce((s, x) => ({ ...s, [x]: { propertyName: x } }), {} as any);
    }
}
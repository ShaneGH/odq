import { ODataComplexType, ODataTypeRef, ODataServiceTypes, ODataSingleTypeRef, ODataTypeName, ODataEnum, ODataServiceConfig } from "odata-ts-client-shared";

type Dict<T> = { [key: string]: T }

export enum QueryObjectType {
    QueryObject = "QueryObject",
    QueryArray = "QueryArray",  // TODO: rename collection
    QueryPrimitive = "QueryPrimitive",
    QueryEnum = "QueryEnum"
    // TODO: add Filter
}

export type PathSegment = {
    path: string
    navigationProperty: boolean
}

export type QueryObjectMetadata = {
    typeRef: ODataTypeRef
    root: ODataServiceTypes
    path: PathSegment[]
}

// T is not used, but adds strong typing to FilterUtils
export type QueryPrimitive<T> = {
    $$oDataQueryObjectType: QueryObjectType.QueryPrimitive
    $$oDataQueryMetadata: QueryObjectMetadata
}

// T is not used, but adds strong typing to FilterUtils
export type QueryEnum<T> = {
    $$oDataQueryObjectType: QueryObjectType.QueryEnum
    $$oDataQueryMetadata: QueryObjectMetadata
    $$oDataEnumType: ODataEnum
}

// TODO: rename to Collection
// type def is recursive for this type: "TQueryObj extends QueryObject<...". Cannot be a "type"
export interface QueryArray<TQueryObj extends QueryObject<TArrayType>, TArrayType> {
    $$oDataQueryObjectType: QueryObjectType.QueryArray
    $$oDataQueryMetadata: QueryObjectMetadata
    childObjConfig: TQueryObj
    childObjAlias: string
}

export type QueryComplexObjectBase = {
    $$oDataQueryObjectType: QueryObjectType.QueryObject
    $$oDataQueryMetadata: QueryObjectMetadata
}

export type HasODataQueryMetadata = {
    $$oDataQueryMetadata: QueryObjectMetadata
}

export type QueryComplexObject<T> = T & QueryComplexObjectBase

export type QueryObject<T> = QueryPrimitive<T> | QueryArray<QueryObject<T>, T> | QueryComplexObject<T> | QueryEnum<T>

function buildAlias(forName: string) {

    const parts = [];

    // create acronym from camelCase, PascalCase and 
    // snake_case or a combination of all 3
    const rx = /(^[a-zA-Z])|([A-Z])|((?<=_)[a-z])/g;    // TODO: test
    let result: RegExpExecArray | null;
    while (parts.length < 5 && (result = rx.exec(forName || ""))) {
        parts.push(result[0]);
    }

    return parts.length
        ? parts.join("").toLowerCase()
        : "x";
}

function addAlias(aliasFor: string, aliases: Dict<boolean>) {

    const aliasCandidate = buildAlias(aliasFor);
    let newAlias = aliasCandidate;
    for (let i = 1; aliases[newAlias]; i++) {
        newAlias = `${aliasCandidate}${i}`;
    }

    return {
        newAlias,
        aliases: {
            ...aliases,
            [newAlias]: true
        }
    };
}

function buildPropertyTypeRef<T>(type: ODataTypeRef, root: ODataServiceTypes, path: PathSegment[], usedAliases: Dict<boolean>): QueryObject<T> {

    if (type.isCollection) {
        if (!path.length) {
            throw new Error("The top level object cannot be a collection");
        }

        const newAliases = addAlias(path[path.length - 1].path, usedAliases);
        const newRootPath = {
            path: newAliases.newAlias,

            // TODO: I am not sure of the consequences of true/false. Need to test/investigate
            navigationProperty: false
        }

        return {
            $$oDataQueryObjectType: QueryObjectType.QueryArray,
            $$oDataQueryMetadata: {
                path: path,
                root,
                typeRef: type
            },
            childObjConfig: buildPropertyTypeRef<T>(type.collectionType, root, [newRootPath], newAliases.aliases),
            childObjAlias: newAliases.newAlias
        };
    }

    // TODO: custom primitive type (e.g. My.Namespace.EmployeeId = typeof(string))
    if (type.namespace === "Edm") {
        return {
            $$oDataQueryObjectType: QueryObjectType.QueryPrimitive,
            $$oDataQueryMetadata: {
                path: path,
                root,
                typeRef: type
            }
        };
    }

    const tLookup = root[type.namespace || ""] && root[type.namespace || ""][type.name];
    if (!tLookup) {
        const ns = type.namespace ? `${type.namespace}.` : "";
        throw new Error(`Could not find type ${ns}${type.name}`);
    }

    if (tLookup.containerType === "Enum") {
        return {
            $$oDataEnumType: tLookup.type,
            $$oDataQueryObjectType: QueryObjectType.QueryEnum,
            $$oDataQueryMetadata: {
                path: path,
                root,
                typeRef: type
            }
        };
    }

    const complexType = tLookup.type
    const base: QueryComplexObjectBase = {
        $$oDataQueryObjectType: QueryObjectType.QueryObject,
        $$oDataQueryMetadata: {
            path: path,
            root,
            typeRef: type
        }
    }

    const bLookup = complexType.baseType
        && root[complexType.baseType.namespace]
        && root[complexType.baseType.namespace][complexType.baseType.name];

    if (complexType.baseType && !bLookup) {
        const ns = complexType.baseType.namespace && `${complexType.baseType.namespace}.`
        throw new Error(`Could not find base type ${ns}${complexType.baseType.name}`);
    }

    if (bLookup && bLookup.containerType !== "ComplexType") {
        const ns = bLookup.type.namespace && `${bLookup.type.namespace}.`
        throw new Error(`Base type ${ns}${bLookup.type.name} is an enum. Expecting a complex type`);
    }

    // This is a bit hacky. 
    //   1. I can't get the type system to behave correctly here (Mixin between regular obj and dictionary)
    //   2. Spread won't work on getters. Need to mutate objects
    const baseType = bLookup?.type;
    return Object
        .keys(baseType?.properties || {})
        .map(key => ({ key, value: baseType!.properties[key] }))
        .concat(Object
            .keys(complexType.properties)
            .map(key => ({ key, value: complexType.properties[key] })))
        .reduce((s, x) => {
            if (x.key === "$$oDataQueryObjectType" || x.key === "$$oDataQueryMetadata") {
                throw new Error(`Property ${x.key} is reserved`);
            }

            let propertyCache: any = null;
            Object.defineProperty(
                s,
                x.key,
                {
                    get() {
                        if (propertyCache !== null) {
                            return propertyCache;
                        }

                        const propPath = [
                            ...path,
                            {
                                path: x.key,
                                navigationProperty: x.value.navigationProperty
                            }];

                        return propertyCache = buildPropertyTypeRef(x.value.type, root, propPath, usedAliases);
                    }
                });

            return s;
        }, base) as QueryComplexObject<T>;
}

export function buildComplexTypeRef<T>(type: ODataComplexType, root: ODataServiceTypes): QueryComplexObject<T> {

    const typeRef = buildPropertyTypeRef<T>({
        name: type.name,
        namespace: type.namespace,
        isCollection: false
    }, root, [], {});

    if (typeRef.$$oDataQueryObjectType !== QueryObjectType.QueryObject) {
        throw new Error("TODO: try to simulate this error");
    }

    return typeRef;
}
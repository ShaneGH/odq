
export {
    ODataServiceConfig,
    ODataComplexType,
    ODataTypeRef,
} from "odata-query-shared"

export {
    QueryBuilder,
    PrimitiveQueryBuilder,
    ICollectionQueryBulder,
    ISingletonQueryBulder
} from "./src/queryBuilder.js"

export * as ExpandUtils from "./src/expandUtils.js"

export * as FilterUtils from "./src/filterUtils.js"

export {
    RequestTools,
    ODataMultiResult,
    ODataSingleResult,
    EntityQuery,
    ODataUriParts,
    CastSelection,
    SubPathSelection
} from "./src/httpClient.js"

export {
    QueryObjectType,
    QueryPrimitive,
    QueryArray,
    QueryComplexObject,
    QueryObject
} from "./src/typeRefBuilder.js"

/*
 * It is not possible to select an item by key more than once
 * If you encounter this type, it is a sign that you are doing somethnig incorrect
 * 
 * This is a type designed not to be used
 */
export type SingleItemsCannotBeQueriedByKey = never

/*
 * It is not possible to traverse or select a property of an item inside a collection
 * You must first apply a key to the collection, and then you can traverse the item
 * 
 * This is a type designed not to be used
 */
export type CollectionsCannotBeTraversed = never

/*
 * It is not possible to traverse or select a property of a primitive type, e.g. a string or an Int32
 * 
 * This is a type designed not to be used
 */
export type PrimitiveTypesCannotBeTraversed = never
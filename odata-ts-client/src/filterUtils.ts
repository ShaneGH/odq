import { Filter } from "./queryBuilder.js";
import { HasQueryObjectMetadata, PathSegment, QueryArray, QueryComplexObject, QueryEnum, QueryObject, QueryObjectType, QueryPrimitive } from "./typeRefBuilder.js";
import { enumMemberName, serialize } from "./valueSerializer.js";

export enum IntegerTypes {
    Int16 = "Int16",
    Int32 = "Int32",
    Int64 = "Int64"
}

export const utils = {
    /**
     * Do a custom filter operation
     *
     * @param obj - The root object of this filter operation. 
     * The root object can be any object available to the query. 
     * It does not have to be the query root object
     * 
     * @param filter - A function to build the filter as a string. 
     * The input is a reference to the root object param
     * The filter should return an unencoded filter string
     * 
     * @example - op(my.property, p => `${p} eq 'hello'`)
     */
    op: (obj: HasQueryObjectMetadata<QueryObjectType>, filter: (path: string) => string): Filter => {
        return { filter: filter(obj.$$oDataQueryMetadata.path.join("/")) }
    },

    /**
     * Do a custom filter operation with a given operator
     *
     * @param lhs - The left operand
     * 
     * @param operator - The operation
     * 
     * @param rhs - The right operand
     * 
     * @example - infixOp(my.property, "eq", "hello")
     */
    infixOp: <T>(lhs: HasQueryObjectMetadata<QueryObjectType>, operator: string, rhs: T, mapper?: (x: T) => string): Filter => {
        const path = lhs.$$oDataQueryMetadata.path
        if (!path.length) {
            throw new Error("Primitive objects are not supported as root values");
        }

        // TODO: T is array type
        mapper = mapper || ((x: T) => serialize(x, lhs.$$oDataQueryMetadata.typeRef, lhs.$$oDataQueryMetadata.root));
        return {
            filter: `${path.map(x => x.path).join("/")} ${operator} ${mapper(rhs)}`
        }
    },

    /**
     * An OData "==" operation
     *
     * @param lhs - The left operand
     * 
     * @param rhs - The right operand
     * 
     * @example - eq(my.property, "hello")
     */
    eq: <T>(obj: QueryPrimitive<T> | QueryEnum<T>, value: T, mapper?: (x: T) => string): Filter => {
        return utils.infixOp(obj, "eq", value, mapper);
    },

    /**
     * An OData "!=" operation
     *
     * @param lhs - The left operand
     * 
     * @param rhs - The right operand
     * 
     * @example - ne(my.property, "hello")
     */
    ne: <T>(obj: QueryPrimitive<T> | QueryEnum<T>, value: T, mapper?: (x: T) => string): Filter => {
        return obj.$$oDataQueryObjectType === QueryObjectType.QueryPrimitive || mapper || typeof value !== "number"
            ? utils.infixOp(obj, "ne", value, mapper)
            : utils.infixOp(obj, "ne", enumMemberName(obj.$$oDataEnumType, value));
    },

    /**
     * An OData "<" operation
     *
     * @param lhs - The left operand
     * 
     * @param rhs - The right operand
     * 
     * @example - lt(my.property, 4)
     */
    lt: <T>(obj: QueryPrimitive<T> | QueryEnum<T>, value: T, mapper?: (x: T) => string): Filter => {
        return utils.infixOp(obj, "lt", value, mapper);
    },

    /**
     * An OData "<=" operation
     *
     * @param lhs - The left operand
     * 
     * @param rhs - The right operand
     * 
     * @example - le(my.property, 4)
     */
    le: <T>(obj: QueryPrimitive<T> | QueryEnum<T>, value: T, mapper?: (x: T) => string): Filter => {
        return utils.infixOp(obj, "le", value, mapper);
    },

    /**
     * An OData ">" operation
     *
     * @param lhs - The left operand
     * 
     * @param rhs - The right operand
     * 
     * @example - gt(my.property, 4)
     */
    gt: <T>(obj: QueryPrimitive<T> | QueryEnum<T>, value: T, mapper?: (x: T) => string): Filter => {
        return utils.infixOp(obj, "gt", value, mapper);
    },

    /**
     * An OData ">=" operation
     *
     * @param lhs - The left operand
     * 
     * @param rhs - The right operand
     * 
     * @example - ge(my.property, 4)
     */
    ge: <T>(obj: QueryPrimitive<T> | QueryEnum<T>, value: T, mapper?: (x: T) => string): Filter => {
        return utils.infixOp(obj, "ge", value, mapper);
    },

    /**
     * An OData "not(...)" operation
     *
     * @param condition - The value from a previous filter
     * 
     * @param group - If true, will surround the not in (...)
     * 
     * @example - not(eq(my.property, 4))
     */
    not: (condition: Filter, group = false): Filter => {

        // TODO: not on primitive value
        return {
            filter: `not${group ? `(${condition.filter})` : ` ${condition.filter}`}`
        }
    },

    /**
     * Surrounds a filter value in (...)
     *
     * @param condition - The value from a previous filter
     * 
     * @example - and( group(eq(my.property1, 4)), group(eq(my.property2, 4)) )
     */
    group: (condition: Filter): Filter => {

        // TODO: not on primitive value
        return {
            filter: `(${condition.filter})`
        }
    },

    /**
     * An OData "and" operation
     *
     * @param conditions - The values from a previous filter
     * 
     * @example - and( eq(my.property1, 4), eq(my.property2, 4) )
     */
    and: (...conditions: Filter[]): Filter => {
        if (conditions.length === 0) {
            throw new Error("You must include at least 1 condition");
        }

        return {
            filter: conditions.map(x => x.filter).join(" and ")
        }
    },

    /**
     * An OData "or" operation
     *
     * @param conditions - The values from a previous filter
     * 
     * @example - or( eq(my.property1, 4), eq(my.property2, 4) )
     */
    or: (...conditions: Filter[]): Filter => {
        if (conditions.length === 0) {
            throw new Error("You must include at least 1 condition");
        }

        return {
            filter: conditions.map(x => x.filter).join(" or ")
        }
    },

    /**
     * Do an operation on the elelments of a collection
     *
     * @param collection - The collection
     * 
     * @param operator - The operator used to expand the collection (e.g. any, all)
     * 
     * @param collectionItemOperation - The operation on individual collection items
     * 
     * @example - collection(my.items, "any", item => eq(item, 4))
     */
    collection: <TQueryObj extends QueryObject<TArrayType>, TArrayType>(
        collection: QueryArray<TQueryObj, TArrayType>,
        operator: string,
        collectionItemOperation: ((t: TQueryObj) => Filter)): Filter => {

        const ancestorsStr = collection.$$oDataQueryMetadata.path.map(x => x.path).join("/");
        const filter = collectionItemOperation(collection.childObjConfig)?.filter;
        if (!filter) {
            throw new Error("Invalid prop filter for any method");
        }

        return {
            filter: `${ancestorsStr}/${operator}(${collection.childObjAlias}:${filter})`
        }
    },

    /**
     * Call a function on a collection
     * 
     * @param functionName - The function to call (e.g. hassubset)
     *
     * @param collection - The collection
     * 
     * @param values - The second arg to pass into the function
     * 
     * @param mapper - A custom mapper to seialize individual values
     * 
     * @example - collectionFunction("hassubset", my.items, [1, 2, 3])
     */
    collectionFunction: <TQueryObj extends QueryObject<TArrayType>, TArrayType>(
        functionName: string,
        collection: QueryArray<TQueryObj, TArrayType>,
        values: TArrayType[],
        mapper?: (x: TArrayType) => string): Filter => {

        if (!collection.$$oDataQueryMetadata.path.length) {
            throw new Error("Collection objects are not supported as root values");
        }

        mapper =
            mapper
                || values.length
                ? ((x: TArrayType) => serialize(x, collection.childObjConfig.$$oDataQueryMetadata.typeRef, collection.$$oDataQueryMetadata.root))
                : toString;

        return {
            filter: `${functionName}(${collection.$$oDataQueryMetadata.path.map(x => x.path).join("/")},[${values.map(mapper).join(",")}])`
        }
    },

    /**
     * Do an OData "any" operation on a collection
     *
     * @param collection - The collection
     * 
     * @param collectionItemOperation - The operation on individual collection items
     * 
     * @example - any(my.items, item => eq(item, 4))
     */
    any: <TQueryObj extends QueryObject<TArrayType>, TArrayType>(
        collection: QueryArray<TQueryObj, TArrayType>,
        collectionItemOperation: ((t: TQueryObj) => Filter)): Filter => {

        return utils.collection(collection, "any", collectionItemOperation);
    },

    /**
     * Do an OData "all" operation on a collection
     *
     * @param collection - The collection
     * 
     * @param collectionItemOperation - The operation on individual collection items
     * 
     * @example - all(my.items, item => eq(item, 4))
     */
    all: <TQueryObj extends QueryObject<TArrayType>, TArrayType>(
        collection: QueryArray<TQueryObj, TArrayType>,
        collectionItemOperation: ((t: TQueryObj) => Filter)): Filter => {

        return utils.collection(collection, "all", collectionItemOperation);
    },

    /**
     * Do an OData "$count" operation on a collection
     *
     * @param collection - The collection
     * 
     * @example - count(my.items)
     */
    count: (collection: QueryArray<any, any>, countUnit = IntegerTypes.Int32): QueryPrimitive<Number> => {

        return {
            $$oDataQueryObjectType: QueryObjectType.QueryPrimitive,
            $$oDataQueryMetadata: {
                type: QueryObjectType.QueryPrimitive,
                root: collection.$$oDataQueryMetadata.root,
                typeRef: {
                    isCollection: false,
                    namespace: "Edm",
                    name: countUnit
                },
                path: [
                    ...collection.$$oDataQueryMetadata.path,
                    {
                        path: "$count",
                        navigationProperty: false
                    }
                ]
            }
        }
    },

    /**
     * Call the "hassubset" function on a collection
     *
     * @param collection - The collection
     * 
     * @param values - The second arg to pass into the function
     * 
     * @param mapper - A custom mapper to seialize individual values
     * 
     * @example - hassubset(my.items, [1, 2, 3])
     */
    hassubset: <TArrayType>(
        collection: QueryArray<QueryPrimitive<TArrayType>, TArrayType>,
        values: TArrayType[],
        mapper?: (x: TArrayType) => string): Filter => {

        return utils.collectionFunction("hassubset", collection, values, mapper);
    }
}

// function toString(x: any) { return x.toString() };
// function addRoundBrackets(x: any) { return `(${x})`; };


// export function infixFunction<T>(path: PathSegment[], value: T, operator: string, mapper?: (x: T) => string): Filter {
//     if (!path.length) {
//         throw new Error("Primitive objects are not supported as root values");
//     }

//     mapper = mapper || defaultMapper(value);
//     return {
//         filter: `${path.map(x => x.path).join("/")} ${operator} ${mapper(value)}`
//     }
// }

// export function has<T>(obj: QueryPrimitive<T>, value: T, mapper?: (x: T) => string): Filter {
//     return infixFunction<T>(obj.$$oDataQueryMetadata.path, value, "has", mapper);
// }
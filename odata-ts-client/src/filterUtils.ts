import { Filter } from "./queryBuilder.js";
import { HasQueryObjectMetadata, QueryArray, QueryEnum, QueryObject, QueryObjectMetadata, QueryObjectType, QueryPrimitive } from "./typeRefBuilder.js";
import { enumMemberName, serialize } from "./valueSerializer.js";

export enum IntegerTypes {
    Int16 = "Int16",
    Int32 = "Int32",
    Int64 = "Int64"
}

function lhsToFilter<T extends QueryObjectType>(item: HasQueryObjectMetadata<T> | Filter): { filter: Filter, metadata: QueryObjectMetadata<T> | null } {
    if (typeof (item as any)?.$$filter === "string") {
        return {
            metadata: null,
            filter: item as Filter
        };
    }

    const itemMeta = item as HasQueryObjectMetadata<T>
    const path = (item as HasQueryObjectMetadata<T>).$$oDataQueryMetadata.path
    if (!path.length) {
        throw new Error("Primitive objects are not supported as root values");
    }

    return {
        metadata: itemMeta.$$oDataQueryMetadata,
        filter: {
            $$filter: path.map(x => x.path).join("/")
        }
    };
}

function rhsToFilter<T, TOp extends QueryObjectType>(
    item: T | Filter,
    lhsMetadata: null | QueryObjectMetadata<TOp>,
    mapper: undefined | ((x: T) => string)): Filter {

    if (typeof (item as any)?.$$filter === "string") {
        if (mapper) {
            throw new Error(`You cannot specify a mapper if the rhs is a Filter`);
        }

        return item as Filter;
    }

    // TODO: is there a way to remove this constraint
    if (!mapper) {
        if (!lhsMetadata) {
            throw new Error("Error processing complex filter. If the RHS of the expression is not a Filter, then the either:\n"
                + " * The mapper arg must be specified\n"
                + " * -OR- The LHS must not be a Filter");
        }

        mapper = (x: T) => serialize(x, lhsMetadata.typeRef, lhsMetadata.root);
    }

    return {
        $$filter: mapper(item as T)
    };
}

function asQueryObjectMetadata(item: Operable<any>) {

    const itemMeta = item as HasQueryObjectMetadata<any>
    return Array.isArray(itemMeta?.$$oDataQueryMetadata?.path)
        ? itemMeta
        : null;
}

function toFilterString<T>(item: Operable<T>, mapper: (x: T) => string, otherMetadata: QueryObjectMetadata<any> | null): string {

    const asFilter = item as Filter
    if (typeof asFilter?.$$filter === "string") {
        return asFilter.$$filter;
    }

    const itemMeta = item as HasQueryObjectMetadata<any>
    if (Array.isArray(itemMeta?.$$oDataQueryMetadata?.path)) {
        const path = itemMeta.$$oDataQueryMetadata.path
        if (!path.length) {
            throw new Error("Primitive objects are not supported as root values");
        }

        return path.map(x => x.path).join("/");
    }

    // TODO: is there a way to remove this constraint
    if (!mapper) {
        if (!otherMetadata) {
            throw new Error("Error processing complex filter: unable to read type info for serialization. "
                + "When adding a filter, one of the following must be true:\n"
                + " * The mapper arg must be specified\n"
                + " * -OR- At lesat one of the arguments must be a property of a query filter object");
        }

        mapper = (x: T) => serialize(x, otherMetadata.typeRef, otherMetadata.root);
    }

    return mapper(item as T);
}

function infixOp<T>(lhs: HasQueryObjectMetadata<QueryObjectType> | Filter, operator: string, rhs: T | Filter, mapper?: (x: T) => string): Filter {

    const { filter, metadata } = lhsToFilter(lhs);
    try {
        const rhsF = rhsToFilter(rhs, metadata, mapper);

        return {
            $$filter: `${filter.$$filter} ${operator} ${rhsF.$$filter}`
        }
    } catch (e) {
        throw new Error(`Error executing infix operation:\n  lhs: ${lhs}\n  operator: ${operator}\n  rhs: ${rhs}\n  mapper: ${mapper}\n${e}`);
    }
}

type Concatable<T> = QueryPrimitive<string> | Filter | string | QueryArray<QueryObject<T>, T>
type Operable<T> = HasQueryObjectMetadata<QueryObjectType> | Filter | T

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
        const path = obj.$$oDataQueryMetadata.path.map(x => x.path).join("/") || "$it"
        return { $$filter: filter(path) }
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
     * @param mapper - An optional mapper to map the rhs to a string. The mapper should return values unencoded
     * 
     * @example - infixOp(my.property, "eq", "hello")
     */
    infixOp: <T>(lhs: HasQueryObjectMetadata<QueryObjectType> | Filter, operator: string, rhs: T | Filter, mapper?: (x: T) => string): Filter => {
        return infixOp(lhs, operator, rhs, mapper);
    },

    /**
     * An OData "==" operation
     *
     * @param lhs - The left operand
     * 
     * @param rhs - The right operand
     * 
     * @param mapper - An optional mapper to map the rhs to a string. The mapper should return values unencoded
     * 
     * @example - eq(my.property, "hello")
     */
    eq: <T>(lhs: QueryPrimitive<T> | QueryEnum<T> | Filter, rhs: T | Filter, mapper?: (x: T) => string): Filter => {
        return infixOp(lhs, "eq", rhs, mapper);
    },

    /**
     * An OData "in" operation
     *
     * @param lhs - The left operand
     * 
     * @param rhs - The right operand
     * 
     * @param mapper - An optional mapper to map the rhs to a string. The mapper should return values unencoded
     * 
     * @example - in(my.property, [1, 3])
     */
    isIn: <T>(lhs: QueryPrimitive<T> | QueryEnum<T>, rhs: T[], mapper?: (x: T) => string): Filter => {

        // TODO: rhs as Filter or Filter[]

        const path = lhs.$$oDataQueryMetadata.path
        if (!path.length) {
            throw new Error("Primitive objects are not supported as root values");
        }

        mapper = mapper || ((x: T) => serialize(x, lhs.$$oDataQueryMetadata.typeRef, lhs.$$oDataQueryMetadata.root));
        return {
            $$filter: `${path.map(x => x.path).join("/")} in (${rhs.map(mapper).join(",")})`
        }
    },

    /**
     * An OData "!=" operation
     *
     * @param lhs - The left operand
     * 
     * @param rhs - The right operand
     * 
     * @param mapper - An optional mapper to map the rhs to a string. The mapper should return values unencoded
     * 
     * @example - ne(my.property, "hello")
     */
    ne: <T>(lhs: QueryPrimitive<T> | QueryEnum<T> | Filter, rhs: T | Filter, mapper?: (x: T) => string): Filter => {
        return infixOp(lhs, "ne", rhs, mapper);
    },

    /**
     * An OData "<" operation
     *
     * @param lhs - The left operand
     * 
     * @param rhs - The right operand
     * 
     * @param mapper - An optional mapper to map the rhs to a string. The mapper should return values unencoded
     * 
     * @example - lt(my.property, 4)
     */
    lt: <T>(lhs: QueryPrimitive<T> | QueryEnum<T> | Filter, rhs: T | Filter, mapper?: (x: T) => string): Filter => {
        return infixOp(lhs, "lt", rhs, mapper);
    },

    /**
     * An OData "<=" operation
     *
     * @param lhs - The left operand
     * 
     * @param rhs - The right operand
     * 
     * @param mapper - An optional mapper to map the rhs to a string. The mapper should return values unencoded
     * 
     * @example - le(my.property, 4)
     */
    le: <T>(lhs: QueryPrimitive<T> | QueryEnum<T> | Filter, rhs: T | Filter, mapper?: (x: T) => string): Filter => {
        return infixOp(lhs, "le", rhs, mapper);
    },

    /**
     * An OData ">" operation
     *
     * @param lhs - The left operand
     * 
     * @param rhs - The right operand
     * 
     * @param mapper - An optional mapper to map the rhs to a string. The mapper should return values unencoded
     * 
     * @example - gt(my.property, 4)
     */
    gt: <T>(lhs: QueryPrimitive<T> | QueryEnum<T> | Filter, rhs: T | Filter, mapper?: (x: T) => string): Filter => {
        return infixOp(lhs, "gt", rhs, mapper);
    },

    /**
     * An OData ">=" operation
     *
     * @param lhs - The left operand
     * 
     * @param rhs - The right operand
     * 
     * @param mapper - An optional mapper to map the rhs to a string. The mapper should return values unencoded
     * 
     * @example - ge(my.property, 4)
     */
    ge: <T>(lhs: QueryPrimitive<T> | QueryEnum<T> | Filter, rhs: T | Filter, mapper?: (x: T) => string): Filter => {
        return infixOp(lhs, "ge", rhs, mapper);
    },

    /**
     * An OData "not(...)" operation
     *
     * @param condition - The value from a previous filter
     * 
     * @param group - If true, will surround the condition in (...)
     * 
     * @example - not(eq(my.property, 4))
     */
    not: (condition: Filter, group = true): Filter => {

        // TODO: not on primitive value
        return {
            $$filter: `not${group ? `(${condition.$$filter})` : ` ${condition.$$filter}`}`
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
            $$filter: `(${condition.$$filter})`
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
            $$filter: conditions.map(x => x.$$filter).join(" and ")
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
            $$filter: conditions.map(x => x.$$filter).join(" or ")
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
        const filter = collectionItemOperation(collection.childObjConfig)?.$$filter;
        if (!filter) {
            throw new Error("Invalid prop filter for any method");
        }

        return {
            $$filter: `${ancestorsStr}/${operator}(${collection.childObjAlias}:${filter})`
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
            $$filter: `${functionName}(${collection.$$oDataQueryMetadata.path.map(x => x.path).join("/")},[${values.map(mapper).join(",")}])`
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
    },

    /**
     * An OData "+" operation
     *
     * @param lhs - The left operand
     * 
     * @param rhs - The right operand
     * 
     * @param mapper - An optional mapper to map the rhs to a string. The mapper should return values unencoded
     * 
     * @example - add(my.property, 4)
     */
    add: (lhs: QueryPrimitive<number> | Filter, rhs: number | Filter, mapper?: (x: number) => string): Filter => {
        return infixOp(lhs, "add", rhs, mapper);
    },

    /**
     * An OData "-" operation
     *
     * @param lhs - The left operand
     * 
     * @param rhs - The right operand
     * 
     * @param mapper - An optional mapper to map the rhs to a string. The mapper should return values unencoded
     * 
     * @example - sub(my.property, 4)
     */
    sub: (lhs: QueryPrimitive<number> | Filter, rhs: number | Filter, mapper?: (x: number) => string): Filter => {
        return infixOp(lhs, "sub", rhs, mapper);
    },

    /**
     * An OData "*" operation
     *
     * @param lhs - The left operand
     * 
     * @param rhs - The right operand
     * 
     * @param mapper - An optional mapper to map the rhs to a string. The mapper should return values unencoded
     * 
     * @example - mul(my.property, 4)
     */
    mul: (lhs: QueryPrimitive<number> | Filter, rhs: number | Filter, mapper?: (x: number) => string): Filter => {
        return infixOp(lhs, "mul", rhs, mapper);
    },

    /**
     * An OData "/" operation on integers
     *
     * @param lhs - The left operand
     * 
     * @param rhs - The right operand
     * 
     * @param mapper - An optional mapper to map the rhs to a string. The mapper should return values unencoded
     * 
     * @example - div(my.property, 4)
     */
    div: (lhs: QueryPrimitive<number> | Filter, rhs: number | Filter, mapper?: (x: number) => string): Filter => {
        return infixOp(lhs, "div", rhs, mapper);
    },

    /**
     * An OData "/" operation on decimals
     *
     * @param lhs - The left operand
     * 
     * @param rhs - The right operand
     * 
     * @param mapper - An optional mapper to map the rhs to a string. The mapper should return values unencoded
     * 
     * @example - divby(my.property, 4)
     */
    divby: (lhs: QueryPrimitive<number> | Filter, rhs: number | Filter, mapper?: (x: number) => string): Filter => {
        return infixOp(lhs, "divby", rhs, mapper);
    },

    /**
     * An OData "%" operation on decimals
     *
     * @param lhs - The left operand
     * 
     * @param rhs - The right operand
     * 
     * @param mapper - An optional mapper to map the rhs to a string. The mapper should return values unencoded
     * 
     * @example - mod(my.property, 4)
     */
    mod: (lhs: QueryPrimitive<number> | Filter, rhs: number | Filter, mapper?: (x: number) => string): Filter => {
        return infixOp(lhs, "mod", rhs, mapper);
    },

    /**
     * An OData "concat" operation
     *
     * @param lhs - The first value to concatenate
     * 
     * @param rhs - The second value to concatenate
     * 
     * @param mapper - An optional mapper to map any primitives to a string. The mapper should return values unencoded
     * 
     * @example - concat(my.property, "some string"); concat(-1, 2], my.property)
     */
    concat: <T>(lhs: Concatable<T>, rhs: Concatable<T>, mapper?: (x: T) => string): Filter => {
        throw new Error("NotImplemented");
        // return infixOp(lhs, "mod", rhs, mapper);
    }
}
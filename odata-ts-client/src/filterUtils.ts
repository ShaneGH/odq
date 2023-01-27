import { ODataServiceTypes } from "odata-ts-client-shared";
import { ODataTypeRef } from "../index.js";
import { HasQueryObjectMetadata, QueryArray, QueryEnum, QueryObject, QueryObjectMetadata, QueryObjectType, QueryPrimitive } from "./typeRefBuilder.js";
import { serialize } from "./valueSerializer.js";

export enum IntegerTypes {
    Int16 = "Int16",
    Int32 = "Int32",
    Int64 = "Int64"
}

export enum DecimalNumberTypes {
    Single = "Single",
    Double = "Double",
    Decimal = "Decimal"
}

export type RealNumberTypes = IntegerTypes | DecimalNumberTypes

export type Filter = {
    $$oDataQueryObjectType: "Filter"
    $$filter: string
    $$output: ODataTypeRef
    $$root: ODataServiceTypes
}

// function lhsToFilter<T extends QueryObjectType>(item: HasQueryObjectMetadata<T> | Filter): { filter: Filter, metadata: QueryObjectMetadata<T> | null } {
//     if (typeof (item as any)?.$$filter === "string") {
//         return {
//             metadata: null,
//             filter: item as Filter
//         };
//     }

//     const itemMeta = item as HasQueryObjectMetadata<T>
//     const path = (item as HasQueryObjectMetadata<T>).$$oDataQueryMetadata.path
//     if (!path.length) {
//         throw new Error("Primitive objects are not supported as root values");
//     }

//     return {
//         metadata: itemMeta.$$oDataQueryMetadata,
//         filter: {
//             $$filter: path.map(x => x.path).join("/")
//         }
//     };
// }

// function rhsToFilter<T, TOp extends QueryObjectType>(
//     item: T | Filter,
//     lhsMetadata: null | QueryObjectMetadata<TOp>,
//     mapper: undefined | ((x: T) => string)): Filter {

//     if (typeof (item as any)?.$$filter === "string") {
//         if (mapper) {
//             throw new Error(`You cannot specify a mapper if the rhs is a Filter`);
//         }

//         return item as Filter;
//     }

//     // TODO: is there a way to remove this constraint
//     if (!mapper) {
//         if (!lhsMetadata) {
//             throw new Error("Error processing complex filter. If the RHS of the expression is not a Filter, then the either:\n"
//                 + " * The mapper arg must be specified\n"
//                 + " * -OR- The LHS must not be a Filter");
//         }

//         mapper = (x: T) => serialize(x, lhsMetadata.typeRef, lhsMetadata.root);
//     }

//     return {
//         $$filter: mapper(item as T)
//     };
// }

// function asQueryObjectMetadata(item: Operable<any>) {

//     const itemMeta = item as HasQueryObjectMetadata<any>
//     return Array.isArray(itemMeta?.$$oDataQueryMetadata?.path)
//         ? itemMeta
//         : null;
// }

// function toFilterString<T>(item: Operable<T>, mapper: (x: T) => string, otherMetadata: QueryObjectMetadata<any> | null): string {

//     const asFilter = item as Filter
//     if (typeof asFilter?.$$filter === "string") {
//         return asFilter.$$filter;
//     }

//     const itemMeta = item as HasQueryObjectMetadata<any>
//     if (Array.isArray(itemMeta?.$$oDataQueryMetadata?.path)) {
//         const path = itemMeta.$$oDataQueryMetadata.path
//         if (!path.length) {
//             throw new Error("Primitive objects are not supported as root values");
//         }

//         return path.map(x => x.path).join("/");
//     }

//     // TODO: is there a way to remove this constraint
//     if (!mapper) {
//         if (!otherMetadata) {
//             throw new Error("Error processing complex filter: unable to read type info for serialization. "
//                 + "When adding a filter, one of the following must be true:\n"
//                 + " * The mapper arg must be specified\n"
//                 + " * -OR- At lesat one of the arguments must be a property of a query filter object");
//         }

//         mapper = (x: T) => serialize(x, otherMetadata.typeRef, otherMetadata.root);
//     }

//     return mapper(item as T);
// }

function op(filter: string): Filter;
function op(obj: QueryObject<any>, filter: (path: string) => string): Filter;
function op(arg1: string | QueryObject<any>, arg2?: (path: string) => string): Filter {

    if (typeof arg1 === "string") {
        if (arg2) {
            throw new Error("Invalid overload args");
        }

        return { $$filter: arg1 }
    }

    if (!arg2) {
        throw new Error("Invalid overload args");
    }

    const path = arg1.$$oDataQueryMetadata.path
    return { $$filter: arg2(path.map(x => x.path).join("/") || "$it") }
}

const bool: ODataTypeRef = {
    isCollection: false,
    namespace: "Edm",
    name: "Boolean"
}

type TypeLookup = { typeRef: ODataTypeRef, root: ODataServiceTypes }
type HasFilterMetadata = Filter
    | {
        $$oDataQueryObjectType: QueryObjectType.QueryArray
        $$oDataQueryMetadata: QueryObjectMetadata<QueryObjectType.QueryArray>
    }
    | {
        $$oDataQueryObjectType: QueryObjectType.QueryPrimitive
        $$oDataQueryMetadata: QueryObjectMetadata<QueryObjectType.QueryPrimitive>
    }
    | {
        $$oDataQueryObjectType: QueryObjectType.QueryEnum
        $$oDataQueryMetadata: QueryObjectMetadata<QueryObjectType.QueryEnum>
    }

function getTypeInfoX<T>(operable: Operable<T> | T): TypeLookup | null {

    const maybeOperable = operable as Operable<T>
    return typeof (operable as Operable<T>).$$oDataQueryObjectType === "string"
        ? getOperableTypeInfo(maybeOperable)
        : null;
}

function getOperableTypeInfo<T>(operable: HasFilterMetadata): TypeLookup {
    return operable.$$oDataQueryObjectType === "Filter"
        ? {
            typeRef: operable.$$output,
            root: operable.$$root
        }
        : {
            typeRef: operable.$$oDataQueryMetadata.typeRef,
            root: operable.$$oDataQueryMetadata.root
        };
}

// function asHasQueryObjectMetadata<T>(operable: Operable<T>) {
//     const cast = operable as HasQueryObjectMetadata<QueryObjectType>
//     return cast?.$$oDataQueryMetadata ? cast : null
// }

// function asFilter<T>(operable: Operable<T>) {
//     const cast = operable as Filter
//     return typeof cast?.$$filter === "string" ? cast : null
// }

function getFilterString<T>(
    operable: HasFilterMetadata | T,
    mapper: ((x: T) => string) | undefined,
    otherMetadata: Partial<TypeLookup> | null) {

    if (typeof (operable as any)?.$$oDataQueryObjectType === "string") {
        return getOperableFilterString(operable as Operable<T>);
    }

    return mapper
        ? mapper(operable as T)
        : serialize(operable as T, otherMetadata?.typeRef, otherMetadata?.root)
}

function getOperableFilterString(operable: HasFilterMetadata) {

    return operable.$$oDataQueryObjectType === "Filter"
        ? operable.$$filter
        : operable.$$oDataQueryMetadata.path.map(x => x.path).join("/")
}

// function _infixOp<TL, TR>(
//     lhs: Operable<TL> | OperableCollection<TL>,
//     operator: string,
//     rhs: TR | Operable<TR>, //| OperableCollection<TR>,
//     typesSerializeTheSame: boolean,
//     mapper: ((x: TR) => string) | undefined,
//     returnType: ODataTypeRef | undefined): Filter {

//     try {
//         const metadata = getOperableTypeInfo(lhs)
//         const lhsF = getOperableFilterString(lhs);
//         const rhsF = getFilterString(rhs, mapper, typesSerializeTheSame ? metadata : null);

//         return {
//             $$oDataQueryObjectType: "Filter",
//             $$output: returnType,
//             // the root is a global constant. Get it from anywhere we can
//             $$root: metadata.root,
//             $$filter: `${lhsF} ${operator} ${rhsF}`
//         }
//     } catch (e) {
//         throw new Error(`Error executing infix operation:\n  lhs: ${lhs}\n  operator: ${operator}\n  rhs: ${rhs}\n  mapper: ${mapper}\n${e}`);
//     }
// }

function queryStrings<T>(
    firstItem: HasFilterMetadata,
    subsequentItems: (T | HasFilterMetadata)[],
    mapper: ((x: T) => string) | undefined) {

    const metadata = getOperableTypeInfo(firstItem)
    return [
        getOperableFilterString(firstItem),
        ...subsequentItems.map(x =>
            getFilterString(x, mapper, metadata))
    ]
}

/** 
 * an operation with 2 inputs of the same type
 * which return a boolean
 */
function logicalInfixOp<T>(
    lhs: HasFilterMetadata,
    operator: string,
    rhs: T | HasFilterMetadata,
    mapper: ((x: T) => string) | undefined): Filter {

    try {
        const operands = queryStrings<T>(lhs, [rhs], mapper)
        const metadata = getOperableTypeInfo(lhs)

        return combineFilterStrings(operator, bool, metadata.root, ...operands)
    } catch (e) {
        throw new Error(`Error executing logical operation:\n  lhs: ${lhs}\n  operator: ${operator}\n  rhs: ${rhs}\n  mapper: ${mapper}\n${e}`);
    }
}

function combineFilterStrings(
    operator: string,
    output: ODataTypeRef,
    root: ODataServiceTypes,
    ...filters: string[]): Filter {

    const result = filters
        .join(operator);

    return {
        $$oDataQueryObjectType: "Filter",
        $$output: output,
        $$root: root,
        $$filter: result
    }
}

type Concatable<T> = QueryPrimitive<string> | Filter | string | QueryArray<QueryObject<T>, T>
type Operable<T> = QueryPrimitive<T> | QueryEnum<T> | Filter
type OperableCollection<T> = QueryArray<QueryObject<T>, T> | Filter

function eq<T>(lhs: Operable<T>, rhs: T | Operable<T>, mapper?: (x: T) => string): Filter {
    return logicalInfixOp(lhs, "eq", rhs, mapper);
}

function makeCollectionMapper<T>(mapper: ((x: T) => string) | undefined, metadata: TypeLookup) {

    return (mapper && ((xs: T[]) => xs?.map(mapper!).join(",")))
        || ((xs: T[]) => serialize(xs, { isCollection: true, collectionType: metadata.typeRef }, metadata.root))
}

function isIn<T>(lhs: Operable<T>, rhs: T[] | OperableCollection<T>, mapper?: (x: T) => string): Filter {

    const metadata = getOperableTypeInfo(lhs)
    const lhsS = getOperableFilterString(lhs);
    const rhsS = Array.isArray(rhs)
        ? getFilterString(rhs, makeCollectionMapper(mapper, metadata), null)
        : getOperableFilterString(rhs);

    return combineFilterStrings("in", bool, metadata.root, lhsS, rhsS)
}

function ne<T>(lhs: Operable<T>, rhs: T | Operable<T>, mapper?: (x: T) => string): Filter {
    return logicalInfixOp(lhs, "ne", rhs, mapper);
}

function lt<T>(lhs: Operable<T>, rhs: T | Operable<T>, mapper?: (x: T) => string): Filter {
    return logicalInfixOp(lhs, "lt", rhs, mapper);
}

function le<T>(lhs: Operable<T>, rhs: T | Operable<T>, mapper?: (x: T) => string): Filter {
    return logicalInfixOp(lhs, "le", rhs, mapper);
}

function gt<T>(lhs: Operable<T>, rhs: T | Operable<T>, mapper?: (x: T) => string): Filter {
    return logicalInfixOp(lhs, "gt", rhs, mapper);
}

function ge<T>(lhs: Operable<T>, rhs: T | Operable<T>, mapper?: (x: T) => string): Filter {
    return logicalInfixOp(lhs, "ge", rhs, mapper);
}

function not(condition: Filter, group = true): Filter {

    // TODO: not on primitive value
    return {
        ...condition,
        $$filter: `not${group ? `(${condition.$$filter})` : ` ${condition.$$filter}`}`
    }
}

function group(condition: Filter): Filter {

    // TODO: not on primitive value
    return {
        ...condition,
        $$filter: `(${condition.$$filter})`
    }
}

function and(...conditions: Filter[]): Filter {
    if (conditions.length === 0) {
        throw new Error("You must include at least 1 condition");
    }

    return combineFilterStrings(" and ", bool, conditions[0]?.$$root, ...conditions.map(x => x.$$filter))
}

function or(...conditions: Filter[]): Filter {
    if (conditions.length === 0) {
        throw new Error("You must include at least 1 condition");
    }

    return combineFilterStrings(" or ", bool, conditions[0]?.$$root, ...conditions.map(x => x.$$filter))
}

function collectionFilter<TQueryObj extends QueryObject<TArrayType>, TArrayType>(
    collection: QueryArray<TQueryObj, TArrayType>,
    operator: string,
    collectionItemOperation: ((t: TQueryObj) => Filter)): Filter {

    const ancestorsStr = collection.$$oDataQueryMetadata.path.map(x => x.path).join("/");
    let filter = collectionItemOperation(collection.childObjConfig)?.$$filter;
    if (!filter) {
        throw new Error("Invalid prop filter for any method");
    }

    filter = `(${collection.childObjAlias}:${filter})`
    return combineFilterStrings(`/${operator}`, bool, collection.$$oDataQueryMetadata.root, ancestorsStr, filter);
}

function collectionFunction<TArrayType>(
    functionName: string,
    collection: OperableCollection<TArrayType>,
    values: TArrayType[],
    mapper?: (x: TArrayType) => string): Filter {

    const metadata = getOperableTypeInfo(collection);
    throw new Error("TODO: is the next line correct?")
    // const singleTypeRef = metadata.typeRef.isCollection
    //     ? metadata.typeRef.collectionType
    //     : undefined;

    // const firstArg = getOperableFilterString(collection);

    // const secondArg = mapper
    //     ? values.map(mapper)
    //     : values.map(x => serialize(x, singleTypeRef, metadata.root))

    // return combineFilterStrings("", bool,
    //     metadata.root, `${functionName}(${firstArg},${secondArg.join(",")})`);
}

function any<TQueryObj extends QueryObject<TArrayType>, TArrayType>(
    collection: QueryArray<TQueryObj, TArrayType>,
    collectionItemOperation: ((t: TQueryObj) => Filter)): Filter {

    return collectionFilter(collection, "any", collectionItemOperation);
}

function all<TQueryObj extends QueryObject<TArrayType>, TArrayType>(
    collection: QueryArray<TQueryObj, TArrayType>,
    collectionItemOperation: ((t: TQueryObj) => Filter)): Filter {

    return collectionFilter(collection, "all", collectionItemOperation);
}

function count(collection: QueryArray<any, any>, countUnit = IntegerTypes.Int32): QueryPrimitive<Number> {

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
}

function hassubset<TArrayType>(
    collection: QueryArray<QueryPrimitive<TArrayType>, TArrayType>,
    values: TArrayType[],
    mapper?: (x: TArrayType) => string): Filter {

    return collectionFunction("hassubset", collection, values, mapper);
}

function add(lhs: Operable<number>, rhs: Operable<number> | number, result: RealNumberTypes | undefined): Filter {
    return infixOp(lhs, "add", rhs, mapper);
}

function sub(lhs: Operable<number>, rhs: Operable<number> | number, result: RealNumberTypes | undefined): Filter {
    return infixOp(lhs, "sub", rhs, mapper);
}

function mul(lhs: Operable<number>, rhs: Operable<number> | number, result: RealNumberTypes | undefined): Filter {
    return infixOp(lhs, "mul", rhs, mapper);
}

function div(lhs: Operable<number>, rhs: Operable<number> | number, result: RealNumberTypes | undefined): Filter {
    return infixOp(lhs, "div", rhs, mapper);
}

function divby(lhs: Operable<number>, rhs: Operable<number> | number, result: RealNumberTypes | undefined): Filter {
    return infixOp(lhs, "divby", rhs, mapper);
}

function mod(lhs: Operable<number>, rhs: Operable<number> | number, result: RealNumberTypes | undefined): Filter {
    return infixOp(lhs, "mod", rhs, mapper);
}

function concat<T>(lhs: Concatable<T>, rhs: Concatable<T>, mapper?: (x: T) => string): Filter {
    throw new Error("NotImplemented");
    // return infixOp(lhs, "mod", rhs, mapper);
}

export interface IFilterUtils {
    /**
     * Do a custom filter operation. If mixing this operation with other
     * filtering operations, it is best to include an output type so that values
     * can be serialized correctly
     * 
     * @param filter  A basic filter string
     * 
     * @param outputType  Add this parameter if you are using 
     * the output of this filter with some of the other built in filters:
     * e.g. eq(my.val1, op(my.val2, p => `${p} add 1`, OutputTypes.Int32)). 
     * This will help the filter utils to serialize data correctly.
     * 
     * @example op("property eq 'hello'")
     */
    op(filter: string, outputType: xxx): Filter;

    /**
     * Do a custom filter operation using the path of an item.
     *
     * @param obj  The root object of this filter operation. 
     * The root object can be any object available to the query. 
     * It does not have to be the query root object
     * 
     * @param filter  A function to build the filter as a string. 
     * The input is a reference to the root object param
     * The filter should return an unencoded filter string
     * 
     * @param outputType  Add this parameter if you are using 
     * the output of this filter with some of the other built in filters:
     * e.g. eq(my.val1, op(my.val2, p => `${p} add 1`, OutputTypes.Int32)). 
     * This will help the filter utils to serialize data correctly.
     * 
     * @example op(my.property, p => `${p} eq 'hello'`)
     */
    op(obj: QueryObject<any>, filter: (path: string) => string, outputType: xxx): Filter;

    /**
     * Do a custom filter operation with a given operator. The result of the operation should be a boolean
     *
     * @param lhs  The left operand
     * 
     * @param operator  The operation
     * 
     * @param rhs  The right operand
     * 
     * @param mapper  An optional mapper to map the rhs to a string. The mapper should return values unencoded
     * 
     * @example logicalOp(my.property, "eq", "hello")
     */
    logicalOp<T>(lhs: Operable<T>, operator: string, rhs: T | Operable<T>, mapper?: (x: T) => string): Filter;

    /**
     * An OData "==" operation
     *
     * @param lhs  The left operand
     * 
     * @param rhs  The right operand
     * 
     * @param mapper  An optional mapper to map the rhs to a string. The mapper should return values unencoded
     * 
     * @example eq(my.property, "hello")
     */
    eq<T>(lhs: Operable<T>, rhs: T | Operable<T>, mapper?: (x: T) => string): Filter;

    /**
     * An OData "in" operation
     *
     * @param lhs  The left operand
     * 
     * @param rhs  The right operand
     * 
     * @param mapper  An optional mapper to map the rhs to a string. The mapper should return values unencoded
     * 
     * @example isIn(my.property, [1, 3])
     */
    isIn<T>(lhs: Operable<T>, rhs: T[] | OperableCollection<T>, mapper?: (x: T) => string): Filter;

    /**
     * An OData "!=" operation
     *
     * @param lhs  The left operand
     * 
     * @param rhs  The right operand
     * 
     * @param mapper  An optional mapper to map the rhs to a string. The mapper should return values unencoded
     * 
     * @example ne(my.property, "hello")
     */
    ne<T>(lhs: Operable<T>, rhs: T | Operable<T>, mapper?: (x: T) => string): Filter;

    /**
     * An OData "<" operation
     *
     * @param lhs  The left operand
     * 
     * @param rhs  The right operand
     * 
     * @param mapper  An optional mapper to map the rhs to a string. The mapper should return values unencoded
     * 
     * @example lt(my.property, 4)
     */
    lt<T>(lhs: Operable<T>, rhs: T | Operable<T>, mapper?: (x: T) => string): Filter;

    /**
     * An OData "<=" operation
     *
     * @param lhs  The left operand
     * 
     * @param rhs  The right operand
     * 
     * @param mapper  An optional mapper to map the rhs to a string. The mapper should return values unencoded
     * 
     * @example le(my.property, 4)
     */
    le<T>(lhs: Operable<T>, rhs: T | Operable<T>, mapper?: (x: T) => string): Filter;

    /**
     * An OData ">" operation
     *
     * @param lhs  The left operand
     * 
     * @param rhs  The right operand
     * 
     * @param mapper  An optional mapper to map the rhs to a string. The mapper should return values unencoded
     * 
     * @example gt(my.property, 4)
     */
    gt<T>(lhs: Operable<T>, rhs: T | Operable<T>, mapper?: (x: T) => string): Filter;

    /**
     * An OData ">=" operation
     *
     * @param lhs  The left operand
     * 
     * @param rhs  The right operand
     * 
     * @param mapper  An optional mapper to map the rhs to a string. The mapper should return values unencoded
     * 
     * @example ge(my.property, 4)
     */
    ge<T>(lhs: Operable<T>, rhs: T | Operable<T>, mapper?: (x: T) => string): Filter;

    /**
     * An OData "not(...)" operation
     *
     * @param condition  The value from a previous filter
     * 
     * @param group - true If true, will surround the condition in (...).
     * 
     * @example not(eq(my.property, 4))
     */
    not(condition: Filter, group?: boolean): Filter;

    /**
     * Surrounds a filter value in (...)
     *
     * @param condition  The value from a previous filter
     * 
     * @example and( group(eq(my.property1, 4)), group(eq(my.property2, 4)) )
     */
    group(condition: Filter): Filter;

    /**
     * An OData "and" operation
     *
     * @param conditions  The values from a previous filter
     * 
     * @example and( eq(my.property1, 4), eq(my.property2, 4) )
     */
    and(...conditions: Filter[]): Filter;

    /**
     * An OData "or" operation
     *
     * @param conditions  The values from a previous filter
     * 
     * @example or( eq(my.property1, 4), eq(my.property2, 4) )
     */
    or(...conditions: Filter[]): Filter;

    /**
     * Do a filter operation on the elelments of a collection. The filter result should be a boolean
     *
     * @param collection  The collection
     * 
     * @param operator  The operator used to expand the collection (e.g. any, all)
     * 
     * @param collectionItemOperation  The operation on individual collection items
     * 
     * @example collectionFilter(my.items, "any", item => eq(item, 4))
     */
    collectionFilter<TQueryObj extends QueryObject<TArrayType>, TArrayType>(
        collection: QueryArray<TQueryObj, TArrayType>,
        operator: string,
        collectionItemOperation: ((t: TQueryObj) => Filter)): Filter;

    /**
     * Call a function on a collection. The result of this function should be a boolean
     * 
     * @param functionName  The function to call (e.g. hassubset)
     *
     * @param collection  The collection
     * 
     * @param values  The second arg to pass into the function
     * 
     * @param mapper  A custom mapper to seialize individual values
     * 
     * @example collectionFunction("hassubset", my.items, [1, 2, 3])
     */
    collectionFunction<TArrayType>(
        functionName: string,
        collection: OperableCollection<TArrayType>,
        values: TArrayType[],
        mapper?: (x: TArrayType) => string): Filter;

    /**
     * Do an OData "any" operation on a collection
     *
     * @param collection  The collection
     * 
     * @param collectionItemOperation  The operation on individual collection items
     * 
     * @example any(my.items, item => eq(item, 4))
     */
    any<TQueryObj extends QueryObject<TArrayType>, TArrayType>(
        collection: QueryArray<TQueryObj, TArrayType>,
        collectionItemOperation: ((t: TQueryObj) => Filter)): Filter;

    /**
     * Do an OData "all" operation on a collection
     *
     * @param collection  The collection
     * 
     * @param collectionItemOperation  The operation on individual collection items
     * 
     * @example all(my.items, item => eq(item, 4))
     */
    all<TQueryObj extends QueryObject<TArrayType>, TArrayType>(
        collection: QueryArray<TQueryObj, TArrayType>,
        collectionItemOperation: ((t: TQueryObj) => Filter)): Filter;

    /**
     * Do an OData "$count" operation on a collection
     *
     * @param collection  The collection
     * 
     * @param countUnit - IntegerTypes.Int32 The expected result of the type
     * 
     * @example count(my.items)
     */
    count(collection: QueryArray<any, any>, countUnit?: IntegerTypes): QueryPrimitive<Number>;

    /**
     * Call the "hassubset" function on a collection
     *
     * @param collection  The collection
     * 
     * @param values  The second arg to pass into the function
     * 
     * @param mapper  A custom mapper to seialize individual values
     * 
     * @example hassubset(my.items, [1, 2, 3])
     */
    hassubset<TArrayType>(
        collection: QueryArray<QueryPrimitive<TArrayType>, TArrayType>,
        values: TArrayType[],
        mapper?: (x: TArrayType) => string): Filter;

    /**
     * An OData "+" operation
     *
     * @param lhs  The left operand
     * 
     * @param rhs  The right operand
     * 
     * @param rhs  The expected type of the result. Default: choose the most appropriate type based on the input types
     * 
     * @example add(my.property, 4)
     */
    add(lhs: Operable<number>, rhs: Operable<number> | number, resultType: RealNumberTypes | undefined): Filter;

    /**
     * An OData "-" operation
     *
     * @param lhs  The left operand
     * 
     * @param rhs  The right operand
     * 
     * @param rhs  The expected type of the result. Default: choose the most appropriate type based on the input types
     * 
     * @example sub(my.property, 4)
     */
    sub(lhs: Operable<number>, rhs: Operable<number> | number, resultType: RealNumberTypes | undefined): Filter;

    /**
     * An OData "*" operation
     *
     * @param lhs  The left operand
     * 
     * @param rhs  The right operand
     * 
     * @param rhs  The expected type of the result. Default: choose the most appropriate type based on the input types
     * 
     * @example mul(my.property, 4)
     */
    mul(lhs: Operable<number>, rhs: Operable<number> | number, resultType: RealNumberTypes | undefined): Filter;

    /**
     * An OData "/" operation on integers
     *
     * @param lhs  The left operand
     * 
     * @param rhs  The right operand
     * 
     * @param rhs  The expected type of the result. Default: choose the most appropriate type based on the input types
     * 
     * @example div(my.property, 4)
     */
    div(lhs: Operable<number>, rhs: Operable<number> | number, resultType: RealNumberTypes | undefined): Filter;

    /**
     * An OData "/" operation on decimals
     *
     * @param lhs  The left operand
     * 
     * @param rhs  The right operand
     * 
     * @param rhs  The expected type of the result. Default: choose the most appropriate type based on the input types
     * 
     * @example divby(my.property, 4)
     */
    divby(lhs: Operable<number>, rhs: Operable<number> | number, resultType: RealNumberTypes | undefined): Filter;

    /**
     * An OData "%" operation on decimals
     *
     * @param lhs  The left operand
     * 
     * @param rhs  The right operand
     * 
     * @param rhs  The expected type of the result. Default: choose the most appropriate type based on the input types
     * 
     * @example mod(my.property, 4)
     */
    mod(lhs: Operable<number>, rhs: Operable<number> | number, resultType: RealNumberTypes | undefined): Filter;

    /**
     * An OData "concat" operation
     *
     * @param lhs  The first value to concatenate
     * 
     * @param rhs  The second value to concatenate
     * 
     * @param mapper  An optional mapper to map any primitives to a string. The mapper should return values unencoded
     * 
     * @example concat(my.property, "some string"); concat(-1, 2], my.property)
     */
    concat<T>(lhs: Concatable<T>, rhs: Concatable<T>, mapper?: (x: T) => string): Filter;
}

export function newUtils(): IFilterUtils {
    return {
        op,
        infixOp,
        eq,
        isIn,
        ne,
        lt,
        le,
        gt,
        ge,
        not,
        group,
        and,
        or,
        collection,
        collectionFunction,
        any,
        all,
        count,
        hassubset,
        add,
        sub,
        mul,
        div,
        divby,
        mod,
        concat
    }
}
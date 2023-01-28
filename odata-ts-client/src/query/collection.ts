import { QueryArray, QueryObject, QueryObjectType, QueryPrimitive } from "../typeRefBuilder.js";
import { serialize } from "../valueSerializer.js";
import { combineFilterStrings, Filter, getOperableFilterString, getOperableTypeInfo } from "./operable.js";
import { IntegerTypes, NonNumericTypes, resolveOutputType } from "./queryPrimitiveTypes.js";

export type OperableCollection<T> = QueryArray<QueryObject<T>, T> | Filter

const bool = resolveOutputType(NonNumericTypes.Boolean)

export function collectionFilter<TQueryObj extends QueryObject<TArrayType>, TArrayType>(
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

export function collectionFunction<TArrayType>(
    functionName: string,
    collection: OperableCollection<TArrayType>,
    values: TArrayType[],
    mapper?: (x: TArrayType) => string): Filter {

    const metadata = getOperableTypeInfo(collection);
    const singleTypeRef = metadata.typeRef && metadata.typeRef.isCollection
        ? metadata.typeRef.collectionType
        : undefined;

    const firstArg = getOperableFilterString(collection);

    const secondArg = mapper
        ? values.map(mapper)
        : values.map(x => serialize(x, singleTypeRef, metadata.root))

    return combineFilterStrings("", bool,
        metadata.root, `${functionName}(${firstArg},[${secondArg.join(",")}])`);
}

export function any<TQueryObj extends QueryObject<TArrayType>, TArrayType>(
    collection: QueryArray<TQueryObj, TArrayType>,
    collectionItemOperation: ((t: TQueryObj) => Filter)): Filter {

    return collectionFilter(collection, "any", collectionItemOperation);
}

export function all<TQueryObj extends QueryObject<TArrayType>, TArrayType>(
    collection: QueryArray<TQueryObj, TArrayType>,
    collectionItemOperation: ((t: TQueryObj) => Filter)): Filter {

    return collectionFilter(collection, "all", collectionItemOperation);
}

export function count(collection: QueryArray<any, any>, countUnit = IntegerTypes.Int32): QueryPrimitive<Number> {

    return {
        $$oDataQueryObjectType: QueryObjectType.QueryPrimitive,
        $$oDataQueryMetadata: {
            type: QueryObjectType.QueryPrimitive,
            root: collection.$$oDataQueryMetadata.root,
            typeRef: resolveOutputType(countUnit),
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

export function hassubset<TArrayType>(
    collection: QueryArray<QueryPrimitive<TArrayType>, TArrayType>,
    values: TArrayType[],
    mapper?: (x: TArrayType) => string): Filter {

    return collectionFunction("hassubset", collection, values, mapper);
}
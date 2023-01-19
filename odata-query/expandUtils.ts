import { QueryArray, QueryObject, QueryPath } from "./typeRefBuilder.js";

// TODO: rename to collection
export function array<TQueryObj extends QueryObject<TArrayType>, TArrayType, TCollectionItem>(array: QueryArray<TQueryObj, TArrayType>, prop: ((t: TQueryObj) => QueryObject<TCollectionItem>)): QueryPath {

    // TODO: audit all anys
    let innerPath = prop(array.childObjConfig)?.$$oDataQueryMetadata.path;
    if (!innerPath?.length) {
        throw new Error("Invalid array value expansion")
    }

    if (!array.$$oDataQueryMetadata.path.length) {
        throw new Error("Invalid array")
    }

    if (innerPath[0].path !== array.childObjAlias) {
        throw new Error(`Element ${innerPath} does not belong to array ${array.$$oDataQueryMetadata.path}`);
    }

    return {
        path: array.$$oDataQueryMetadata.path.concat(innerPath.slice(1))
    };
}

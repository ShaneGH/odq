import { ODataServiceTypes, ODataTypeRef } from "odata-ts-client-shared";
import { QueryEnum, QueryObjectMetadata, QueryObjectType, QueryPrimitive } from "../typeRefBuilder.js";
import { serialize } from "../valueSerializer.js";

export type Filter = {
    $$oDataQueryObjectType: "Filter"
    $$filter: string
    $$output?: ODataTypeRef
    $$root?: ODataServiceTypes
}

export type Operable<T> = QueryPrimitive<T> | QueryEnum<T> | Filter

export type HasFilterMetadata = Filter
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

export type TypeLookup = { typeRef?: ODataTypeRef, root?: ODataServiceTypes }

export function getOperableTypeInfo<T>(operable: HasFilterMetadata): TypeLookup {
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

export function getFilterString<T>(
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

export function getOperableFilterString(operable: HasFilterMetadata) {

    return operable.$$oDataQueryObjectType === "Filter"
        ? operable.$$filter
        : operable.$$oDataQueryMetadata.path.map(x => x.path).join("/")
}

export function combineFilterStrings(
    operator: string,
    output: ODataTypeRef,
    root: ODataServiceTypes | undefined,
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
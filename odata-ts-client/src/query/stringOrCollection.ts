import { QueryArray, QueryObject, QueryObjectType, QueryPrimitive } from "../typeRefBuilder.js";
import { serialize } from "../valueSerializer.js";
import { OperableCollection } from "./collection1.js";
import { combineFilterStrings, Filter, getOperableTypeInfo, Operable, TypeLookup } from "./operable0.js";
import { NonNumericTypes, resolveOutputType } from "./queryPrimitiveTypes0.js";

const stringT = resolveOutputType(NonNumericTypes.String)

export type Concatable<T> = Operable<string> | OperableCollection<T>

function filterString<T>(x: Concatable<T> | T[] | string, metadata: TypeLookup, mapper: undefined | ((x: T) => string)): string {
    if (typeof x === "string") {
        return serialize(x, stringT, metadata.root)
    }

    if (Array.isArray(x)) {
        const typeRef = metadata.typeRef?.isCollection
            ? metadata.typeRef.collectionType
            : metadata.typeRef;

        return `[${x.map(mapper || ser).join(",")}]`

        function ser(x: T) {
            return serialize(x, typeRef, metadata.root);
        }
    }

    if (x.$$oDataQueryObjectType === "Filter") {
        return x.$$filter
    }

    return x.$$oDataQueryMetadata.path.map(x => x.path).join("/");
}

type ConcatFreeForAll<T> = Concatable<T> | string | T[]

export function concat(lhs: Operable<string>, rhs: Operable<string> | string): Filter;
export function concat(lhs: Operable<string> | string, rhs: Operable<string>): Filter;
export function concat<T>(lhs: OperableCollection<T>, rhs: OperableCollection<T> | T[], mapper?: (x: T) => string): Filter;
export function concat<T>(lhs: OperableCollection<T> | T[], rhs: OperableCollection<T>, mapper?: (x: T) => string): Filter;
export function concat<T>(lhs: ConcatFreeForAll<T>, rhs: ConcatFreeForAll<T>, mapper?: (x: T) => string): Filter {

    if (typeof lhs === "string" || Array.isArray(lhs)) {
        if (typeof rhs === "string" || Array.isArray(rhs)) {
            throw new Error("Invalid method overload");
        }

        return _concat(rhs, lhs, mapper, true);
    }

    return _concat(lhs, rhs, mapper, false);
}

function _concat<T>(lhs: Concatable<T>, rhs: Concatable<T> | T[] | string, mapper: undefined | ((x: T) => string), swap: boolean): Filter {
    const metadata = getOperableTypeInfo(lhs)
    let lhsS = filterString(lhs, metadata, undefined)
    let rhsS = filterString(rhs, metadata, mapper)

    if (swap) {
        const x = lhsS
        lhsS = rhsS
        rhsS = x
    }

    return combineFilterStrings("", metadata.typeRef, metadata.root, `concat(${lhsS},${rhsS})`);
}

type CollectionFreeForAll<T> = Concatable<T> | string | T

// export function contains(lhs: Operable<string>, rhs: Operable<string> | string): Filter;
// export function contains<T>(lhs: OperableCollection<T>, rhs: QueryPrimitive<T> | T, mapper?: (x: T) => string): Filter;
// export function contains<T>(
//     lhs: Operable<string> | OperableCollection<T>,
//     rhs: CollectionFreeForAll<T>,
//     mapper?: (x: T) => string): Filter {

//     if (lhs.$$oDataQueryObjectType === QueryObjectType.QueryPrimitive) {
//         if (mapper) {
//             throw new Error("Invalid method overload");
//         }

//         return stringContains(lhs, rhs as any);
//     }

//     return collectionContains(lhs as any, rhs as any, mapper);

// }

// const bool = resolveOutputType(NonNumericTypes.Boolean)

// function stringContains(lhs: Operable<string>, rhs: Operable<string> | string) {
//     const metadata = getOperableTypeInfo(lhs)
//     let lhsS = filterString(lhs, metadata, undefined)
//     let rhsS = filterString(rhs, metadata, undefined)

//     return combineFilterStrings("", bool, metadata.root, `contains(${lhsS},${rhsS})`);

// }

// function collectionContains<T>(lhs: OperableCollection<T>, rhs: OperableCollection<T> | T, mapper?: (x: T) => string) {
//     const metadata = getOperableTypeInfo(lhs)
//     let lhsS = filterString(lhs, metadata, undefined)
//     let rhsS = filterString(rhs, metadata, undefined)

//     return combineFilterStrings("", bool, metadata.root, `contains(${lhsS},${rhsS})`);

// }
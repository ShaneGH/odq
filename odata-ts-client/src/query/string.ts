import { serialize } from "../valueSerializer.js";
import { combineFilterStrings, Filter, getFilterString, getOperableFilterString, getOperableTypeInfo, Operable } from "./operable0.js";
import { NonNumericTypes, resolveOutputType } from "./queryPrimitiveTypes0.js";

const stringT = resolveOutputType(NonNumericTypes.String)
const boolT = resolveOutputType(NonNumericTypes.Boolean)

export function concat(lhs: Operable<string>, rhs: Operable<string> | string): Filter;
export function concat(lhs: Operable<string> | string, rhs: Operable<string>): Filter;
export function concat<T>(lhs: Operable<string> | string, rhs: Operable<string> | string): Filter {

    if (typeof lhs === "string") {
        if (typeof rhs === "string") {
            throw new Error("Invalid method overload");
        }

        return _concat(rhs, lhs, true);
    }

    return _concat(lhs, rhs, false);
}

function _concat(lhs: Operable<string>, rhs: Operable<string> | string, swap: boolean): Filter {
    const metadata = getOperableTypeInfo(lhs)
    let lhsS = getOperableFilterString(lhs)
    let rhsS = getFilterString(rhs, undefined, metadata)

    if (swap) {
        const x = lhsS
        lhsS = rhsS
        rhsS = x
    }

    return combineFilterStrings("", stringT, metadata.root, `concat(${lhsS},${rhsS})`);
}

export function contains(lhs: Operable<string>, rhs: Operable<string> | string): Filter;
export function contains(lhs: Operable<string> | string, rhs: Operable<string>): Filter;
export function contains(lhs: Operable<string> | string, rhs: Operable<string> | string): Filter {

    if (typeof lhs === "string" && typeof rhs === "string") {
        throw new Error("Invalid method overload");
    }

    const { nonString, possibleString, rev } = typeof lhs === "string"
        ? {
            nonString: rhs as Operable<string>,
            possibleString: lhs,
            rev: true
        } : {
            nonString: lhs,
            possibleString: rhs,
            rev: false
        }


    const metadata = getOperableTypeInfo(nonString)
    let lhsS = getOperableFilterString(nonString)
    let rhsS = typeof possibleString === "string"
        ? serialize(possibleString)
        : getOperableFilterString(possibleString);

    if (rev) {
        const x = lhsS
        lhsS = rhsS
        rhsS = x
    }

    return combineFilterStrings("", boolT, metadata.root, `contains(${lhsS},${rhsS})`);
}
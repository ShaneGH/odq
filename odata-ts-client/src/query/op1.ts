import { ODataTypeRef } from "odata-ts-client-shared";
import { PathSegment, QueryObject } from "../typeRefBuilder.js";
import { combineFilterStrings, Filter, getOperableFilterString, getOperableTypeInfo, HasFilterMetadata } from "./operable0.js";
import { OutputTypes, resolveOutputType } from "./queryPrimitiveTypes0.js";

// using a class here because they play ywell with type deconstruction
export class MappableType<T> {
    constructor(public val: T, public mapper: (x: T) => string) { }

    resolve() {
        return this.mapper(this.val);
    }
}

export function op(filter: string, outputType?: OutputTypes | undefined): Filter;
export function op(obj: QueryObject<any>, filter: (path: string) => string, outputType?: OutputTypes | undefined): Filter;
export function op(arg1: string | QueryObject<any>, arg2?: ((path: string) => string) | OutputTypes, arg3?: OutputTypes | undefined): Filter {

    // WARNING: ts is having a hard time resolving types here
    // take care modifying this method

    if (typeof arg1 === "string") {
        if (typeof arg2 === "function" || arg3) {
            throw new Error("Invalid overload args");
        }

        return {
            $$oDataQueryObjectType: "Filter",
            $$output: arg2 && resolveOutputType(arg2),
            $$root: undefined,
            $$filter: arg1
        }
    }

    if (typeof arg2 !== "function") {
        throw new Error("Invalid overload args");
    }

    const path: PathSegment[] = arg1.$$oDataQueryMetadata.path
    return {
        $$oDataQueryObjectType: "Filter",
        $$output: arg3 && resolveOutputType(arg3),
        $$root: undefined,
        $$filter: arg2(path.map(x => x.path).join("/") || "$it")
    }
}

/** 
 * an operation with 2 inputs
 */
export function infixOp<T>(
    lhs: HasFilterMetadata,
    operator: string,
    rhs: MappableType<T> | HasFilterMetadata,
    output: ODataTypeRef): Filter {

    try {
        const root = getOperableTypeInfo(lhs).root;
        const lhsS = getOperableFilterString(lhs);
        const rhsS = rhs instanceof MappableType<T>
            ? rhs.resolve()
            : getOperableFilterString(rhs);

        return combineFilterStrings(" ", output, root, lhsS, operator, rhsS)
    } catch (e) {
        throw new Error(`Error executing operation:\n  lhs: ${lhs}\n  operator: ${operator}\n  rhs: ${rhs}\n${e}`);
    }
}
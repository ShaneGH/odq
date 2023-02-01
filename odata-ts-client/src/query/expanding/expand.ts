import { Expand } from "../../queryBuilder.js"
import { PathSegment, QueryArray, QueryObject } from "../../typeRefBuilder.js"

export type ExpandUtils = {

    /**
     * Add a custom expand string
     * 
     * @example expand("property1")
     */
    expandRaw(expand: string): Expand

    /**
     * Expand an object or array of objects
     * 
     * @param obj The properties to select
     * 
     * @example expand(my.property1)
     */
    expand<T>(obj: QueryObject<T>): Expand

    /**
     * Combine multiple expanded properties
     * 
     * @example combine(expand(my.property1), expand(my.property2))
     */
    combine(...expansions: Expand[]): Expand

    expandAndTODO<TQueryObj extends QueryObject<TArrayType>, TArrayType>(
        obj: QueryArray<TQueryObj, TArrayType>, and: (x: TQueryObj) => Expand): Expand;
}

function expand<T>(obj: QueryObject<T>): Expand {

    const $$expand = _expand(obj.$$oDataQueryMetadata.path);
    if (!$$expand) {
        throw new Error("Object cannot be expanded");
    }

    return { $$expand }
}

function expandRaw(expand: string): Expand {

    return { $$expand: expand }
}

// this method is a hack. Need to see how the "and" function evolves
function expandAndTODO<TQueryObj extends QueryObject<TArrayType>, TArrayType>(
    obj: QueryArray<TQueryObj, TArrayType>, and: (x: TQueryObj) => Expand): Expand {

    const outerExpand = _expand(obj.$$oDataQueryMetadata.path);
    if (!outerExpand) {
        throw new Error("Object cannot be expanded");
    }

    const innerExpand = and(obj.childObjConfig);
    let inner = innerExpand.$$expand;
    if (inner.startsWith(obj.childObjAlias)) {
        inner = inner.substring(obj.childObjAlias.length)
    }

    return { $$expand: `${outerExpand}${inner}` }
}

function _expand(pathSegment: PathSegment[]): string | null {
    if (!pathSegment.length) return null

    const head = pathSegment[0].path;
    const tail = pathSegment.slice(1);
    const next = _expand(tail);
    if (next == undefined) {
        return head;
    }

    return tail[0].navigationProperty
        ? `${head}($expand=${next})`
        : `${head}/${next}`;
}

function combine(...expansions: Expand[]): Expand {
    return {
        $$expand: expansions.map(x => x.$$expand).join(",")
    }
}

export function newUtils(): ExpandUtils {
    return {
        expand,
        combine,
        expandRaw,
        expandAndTODO
    }
}
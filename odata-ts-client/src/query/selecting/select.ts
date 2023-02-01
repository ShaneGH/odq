import { Select } from "../../queryBuilder.js"
import { QueryObject } from "../../typeRefBuilder.js"

export type SelectUtils = {
    /**
     * Select a list of properties
     * NOTE: if you enter a navigation property here, you may get back some unexpected results
     * http://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_SystemQueryOptionselect
     * 
     * @param props The properties to select
     * 
     * @example props(my.property1, my.property2)
     */
    props(...props: QueryObject<any>[]): Select

    /**
     * Add a custom select statement
     * 
     * @example selectRaw("property1,property2")
     */
    selectRaw(customSelect: string): Select
}

// not particularly useful, but helps the typescript compiler
function path<T>(x: QueryObject<T>) {
    return x.$$oDataQueryMetadata.path
}

function props(...props: QueryObject<any>[]): Select {
    if (!props?.length) {
        throw new Error("You must specify at least one property to select");
    }

    return {
        $$select: props.map(path).map(ps => ps.map(p => p.path).join("/")).join(",")
    }
}

function selectRaw(customSelect: string): Select {

    return {
        $$select: customSelect
    }
}

export function newUtils(): SelectUtils {
    return {
        props,
        selectRaw
    }
}
import { Select } from "../../queryBuilder.js"
import { QueryEnum, QueryObject, QueryPrimitive } from "../../typeRefBuilder.js"

type Selectable = QueryPrimitive<any> | QueryEnum<any>

export type ISelectUtils = {
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
     * @example select("property1,property2")
     */
    select(customSelect: string): Select
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

function select(customSelect: string): Select {

    return {
        $$select: customSelect
    }
}

export function newUtils(): ISelectUtils {
    return {
        props,
        select
    }
}
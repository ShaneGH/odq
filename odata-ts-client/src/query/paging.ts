import { Paging } from "../queryBuilder.js"

/**
 * Add paging to the query
 */
export function paging(top: number | undefined, skip?: number | undefined, count?: boolean | undefined): Paging {

    return {
        $$oDataQueryObjectType: "Paging",
        $$top: top,
        $$skip: skip,
        $$count: count
    }
}
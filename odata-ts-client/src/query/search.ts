import { Search } from "../queryBuilder.js"

export type SearchUtils = {

    term(term: string): Search

    searchAnd(...terms: Search[]): Search

    searchOr(...terms: Search[]): Search

    searchNot(term: Search): Search

    searchRaw(searchString: string): Search
}

function term(term: string): Search {
    return {
        $$oDataQueryObjectType: "Search",
        $$search: `"${term}"`
    }
}

function searchAnd(...terms: Search[]): Search {
    return {
        $$oDataQueryObjectType: "Search",
        $$search: `(${terms.map(x => x.$$search).join(" AND ")})`
    }
}

function searchOr(...terms: Search[]): Search {
    return {
        $$oDataQueryObjectType: "Search",
        $$search: `(${terms.map(x => x.$$search).join(" OR ")})`
    }
}

function searchNot(term: Search): Search {
    return {
        $$oDataQueryObjectType: "Search",
        $$search: `(NOT ${term.$$search})`
    }
}

function searchRaw(searchString: string): Search {
    return {
        $$oDataQueryObjectType: "Search",
        $$search: searchString
    }
}

export function newUtils(): SearchUtils {
    return {
        term,
        searchAnd,
        searchOr,
        searchNot,
        searchRaw
    }
}
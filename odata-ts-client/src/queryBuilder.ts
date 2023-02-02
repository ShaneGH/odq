import { ODataServiceTypes, ODataTypeRef } from "odata-ts-client-shared";

type Dict<T> = { [key: string]: T }

export type QueryParts = Partial<{
    select: Select
    filter: Filter
    expand: Expand,
    orderBy: OrderBy,
    paging: Paging
}>

export type Paging = {
    $$oDataQueryObjectType: "Paging"
    $$top: number | undefined
    $$skip: number | undefined
    $$count: boolean | undefined
}

export type Expand = {
    $$oDataQueryObjectType: "Expand"
    $$expand: string
}

export type OrderBy = {
    $$oDataQueryObjectType: "OrderBy"
    $$orderBy: string
}

export type Custom = {
    $$oDataQueryObjectType: "Custom"
    $$key: string
    $$value: string
}

export type Select = {
    $$oDataQueryObjectType: "Select"
    $$select: string
}

export type Search = {
    $$oDataQueryObjectType: "Search"
    $$search: string
}

export type Filter = {
    $$oDataQueryObjectType: "Filter"
    $$filter: string
    $$output?: ODataTypeRef
    $$root?: ODataServiceTypes
}

export type Query = Paging | Expand | OrderBy | Select | Filter | Custom | Search

function hasOwnProperty(s: Dict<string>, prop: string) {
    return Object.prototype.hasOwnProperty.call(s, prop)
}

function maybeAdd(s: Dict<string>, stateProp: string, inputProp: string | undefined, errorMessage: string) {

    if (s[stateProp]) {
        throw new Error(errorMessage);
    }

    return inputProp !== undefined
        ? {
            ...s,
            [stateProp]: inputProp
        }
        : s

}

export function buildQuery(q: Query | Query[]): Dict<string> {
    if (!Array.isArray(q)) {
        return buildQuery([q])
    }

    return q
        .reduce((s, x) => {

            if (x.$$oDataQueryObjectType === "Expand") {
                return maybeAdd(s, "$expand", x.$$expand,
                    "Multiple expansions detected. Combine multipe expansions with the expand.combine util");
            }

            if (x.$$oDataQueryObjectType === "Filter") {
                return maybeAdd(s, "$filter", x.$$filter,
                    "Multiple filters detected. Combine multipe expansions with the filter.and or filter.or utils");
            }

            if (x.$$oDataQueryObjectType === "OrderBy") {
                return maybeAdd(s, "$orderBy", x.$$orderBy, "Multiple order by clauses detected");
            }

            if (x.$$oDataQueryObjectType === "Select") {
                return maybeAdd(s, "$select", x.$$select, "Multiple select clauses detected");
            }

            if (x.$$oDataQueryObjectType === "Custom") {
                return maybeAdd(s, x.$$key, x.$$value, "Multiple select clauses detected");
            }

            if (x.$$oDataQueryObjectType === "Search") {
                return maybeAdd(s, "$search", x.$$search, "Multiple select clauses detected");
            }

            if (hasOwnProperty(s, "$count") || hasOwnProperty(s, "$skip") || hasOwnProperty(s, "$top")) {
                throw new Error("Multiple paging clauses detected")
            }

            const err = "Multiple paging clauses detected. If using a count and paging, both must use the same \"paging(...)\" function call"
            s = maybeAdd(s, "$skip", x.$$skip?.toString(), err)
            s = maybeAdd(s, "$top", x.$$top?.toString(), err)
            return maybeAdd(s, "$count", (x.$$count || undefined) && "true", err)
        }, {} as Dict<string>);
}

// export interface IQueryBulder {

//     toQueryParts(urlEncode: boolean): Dict<string>;
//     toQueryString(urlEncode: boolean, addLeadingQuestionMark: boolean): string
// }

// export interface ISingletonQueryBulder<T> extends IQueryBulder {

//     expand(q: Expand | ((t: T) => PathSegment[])): ISingletonQueryBulder<T>;
// }

// export class QueryStringBuilder implements IQueryBulder {

//     constructor(protected state: QueryParts) {
//     }

//     toQueryParts(urlEncode = true): Dict<string> {

//         return [
//             param("$filter", this.state.filter?.$$filter),
//             param("$expand", this.state.expand?.$$expand),
//             param("$select", this.state.select?.$$select),
//             param("$orderBy", this.state.orderBy?.$$orderBy),
//             param("$count", this.state.paging?.$$count ? "true" : undefined),
//             param("$top", this.state.paging?.$$top?.toString()),
//             param("$skip", this.state.paging?.$$skip?.toString())
//         ]
//             .reduce((s: Dict<string>, x) => x ? { ...s, ...x } : s, {} as Dict<string>);

//         function param(name: string, value: string | undefined): Dict<string> | null {
//             return value != undefined
//                 ? { [name]: urlEncode ? encodeURIComponent(value) : value }
//                 : null;
//         }
//     }

//     toQueryString(urlEncode = true, addLeadingQuestionMark = false): string {

//         const qParts = this.toQueryParts(urlEncode);
//         const output = Object
//             .keys(qParts)
//             .map(name => `${name}=${qParts[name]}`)
//             .join("&");

//         return addLeadingQuestionMark ? `?${output}` : output;
//     }
// }

// export class QueryBuilder<T, TQInput> extends QueryStringBuilder {

//     constructor(
//         state?: QueryParts | undefined) {

//         super(state || {});
//     }

//     select(q: Select): QueryBuilder<T, TQInput> {
//         if (this.state.select) {
//             throw new Error("This query already has a select clause");
//         }

//         return new QueryBuilder<T, TQInput>({
//             ...this.state,
//             select: q
//         });
//     }

//     filter(q: Filter): QueryBuilder<T, TQInput> {
//         if (this.state.filter) {
//             throw new Error("This query is alread filtered");
//         }

//         return new QueryBuilder<T, TQInput>({
//             ...this.state,
//             filter: q
//         });
//     }

//     expand(q: Expand): QueryBuilder<T, TQInput> {
//         if (this.state.expand) {
//             throw new Error("This query is alread expanded");
//         }

//         return new QueryBuilder<T, TQInput>({
//             ...this.state,
//             expand: q
//         });
//     }

//     orderBy(q: OrderBy): QueryBuilder<T, TQInput> {
//         if (this.state.orderBy) {
//             throw new Error("This query is alread ordered");
//         }

//         return new QueryBuilder<T, TQInput>({
//             ...this.state,
//             orderBy: q
//         });
//     }

//     page(q: Paging): QueryBuilder<T, TQInput> {
//         if (this.state.paging) {
//             throw new Error("This query already has paging");
//         }

//         return new QueryBuilder<T, TQInput>({
//             ...this.state,
//             paging: q
//         });
//     }
// }

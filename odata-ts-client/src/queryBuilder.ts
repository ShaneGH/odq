import { Filter } from "./query/filtering/operable0.js";
import { PathSegment } from "./typeRefBuilder.js";

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

export type Select = {
    $$oDataQueryObjectType: "Select"
    $$select: string
}

export interface IQueryBulder {

    toQueryParts(urlEncode: boolean): Dict<string>;
    toQueryString(urlEncode: boolean, addLeadingQuestionMark: boolean): string
}

export interface ISingletonQueryBulder<T> extends IQueryBulder {

    expand(q: Expand | ((t: T) => PathSegment[])): ISingletonQueryBulder<T>;
}

export class QueryStringBuilder implements IQueryBulder {

    constructor(protected state: QueryParts) {
    }

    toQueryParts(urlEncode = true): Dict<string> {

        return [
            param("$filter", this.state.filter?.$$filter),
            param("$expand", this.state.expand?.$$expand),
            param("$select", this.state.select?.$$select),
            param("$orderBy", this.state.orderBy?.$$orderBy),
            param("$count", this.state.paging?.$$count ? "true" : undefined),
            param("$top", this.state.paging?.$$top?.toString()),
            param("$skip", this.state.paging?.$$skip?.toString())
        ]
            .reduce((s: Dict<string>, x) => x ? { ...s, ...x } : s, {} as Dict<string>);

        function param(name: string, value: string | undefined): Dict<string> | null {
            return value != undefined
                ? { [name]: urlEncode ? encodeURIComponent(value) : value }
                : null;
        }
    }

    toQueryString(urlEncode = true, addLeadingQuestionMark = false): string {

        const qParts = this.toQueryParts(urlEncode);
        const output = Object
            .keys(qParts)
            .map(name => `${name}=${qParts[name]}`)
            .join("&");

        return addLeadingQuestionMark ? `?${output}` : output;
    }
}

export class QueryBuilder<T, TQInput> extends QueryStringBuilder {

    constructor(
        private typeRef: TQInput,
        state?: QueryParts | undefined) {

        super(state || {});
    }

    select(q: Select | ((t: TQInput) => Select)): QueryBuilder<T, TQInput> {
        if (this.state.select) {
            throw new Error("This query already has a select clause");
        }

        if (typeof q !== "function") {
            return this.select(() => q);
        }

        return new QueryBuilder<T, TQInput>(this.typeRef, {
            ...this.state,
            select: q(this.typeRef)
        });
    }

    filter(q: Filter | ((t: TQInput) => Filter)): QueryBuilder<T, TQInput> {
        if (this.state.filter) {
            throw new Error("This query is alread filtered");
        }

        if (typeof q !== "function") {
            return this.filter(() => q);
        }

        return new QueryBuilder<T, TQInput>(this.typeRef, {
            ...this.state,
            filter: q(this.typeRef)
        });
    }

    expand(q: Expand | ((t: TQInput) => Expand)): QueryBuilder<T, TQInput> {
        if (this.state.expand) {
            throw new Error("This query is alread expanded");
        }

        if (typeof q !== "function") {
            return this.expand(() => q);
        }

        return new QueryBuilder<T, TQInput>(this.typeRef, {
            ...this.state,
            expand: q(this.typeRef)
        });
    }

    orderBy(q: OrderBy | ((t: TQInput) => OrderBy)): QueryBuilder<T, TQInput> {
        if (this.state.orderBy) {
            throw new Error("This query is alread ordered");
        }

        if (typeof q !== "function") {
            return this.orderBy(() => q);
        }

        return new QueryBuilder<T, TQInput>(this.typeRef, {
            ...this.state,
            orderBy: q(this.typeRef)
        });
    }

    page(q: Paging | (() => Paging)): QueryBuilder<T, TQInput> {
        if (this.state.paging) {
            throw new Error("This query already has paging");
        }

        if (typeof q !== "function") {
            return this.page(() => q);
        }

        return new QueryBuilder<T, TQInput>(this.typeRef, {
            ...this.state,
            paging: q()
        });
    }
}

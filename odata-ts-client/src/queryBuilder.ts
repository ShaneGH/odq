import { Filter } from "./query/filtering/operable0.js";
import { PathSegment } from "./typeRefBuilder.js";

type Dict<T> = { [key: string]: T }

export type QueryParts = Partial<{
    select: Select
    filter: Filter
    expand: Expand,
    count: boolean,
    skip: number,
    top: number
}>

export type Expand = {
    $$expand: string
}

export type Select = {
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
            param("$count", this.state.count ? "true" : undefined),
            param("$top", this.state.top?.toString()),
            param("$skip", this.state.skip?.toString())
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

    count(): QueryBuilder<T, TQInput> {

        if (this.state.count != null) {
            throw new Error("This query already has a count");
        }

        return new QueryBuilder<T, TQInput>(this.typeRef, {
            ...this.state,
            count: true
        });
    }

    top(top: number): QueryBuilder<T, TQInput> {

        if (this.state.top != null) {
            throw new Error("This query already has a top");
        }

        return new QueryBuilder<T, TQInput>(this.typeRef, {
            ...this.state,
            top
        });
    }

    skip(skip: number): QueryBuilder<T, TQInput> {

        if (this.state.skip != null) {
            throw new Error("This query already has a skip");
        }

        return new QueryBuilder<T, TQInput>(this.typeRef, {
            ...this.state,
            skip
        });
    }
}

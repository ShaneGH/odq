import { ODataComplexType, ODataServiceTypes } from "odata-ts-client-shared";
import { bulidTypeRef, PathSegment, QueryComplexObject, QueryObjectType, QueryPath, QueryPrimitive } from "./typeRefBuilder.js";


type Dict<T> = { [key: string]: T }

export type QueryParts = {
    filter?: Filter | undefined
    expand?: Expand | undefined,
    count?: boolean | undefined,
    skip?: number | undefined,
    top?: number | undefined
}

export type Filter = {
    filter: string
}

export type Expand = {
    expand: PathSegment[]
}

export interface IQueryBulder {

    toQueryParts(urlEncode: boolean): Dict<string>;
    toQueryString(urlEncode: boolean, addLeadingQuestionMark: boolean): string
}

export interface ISingletonQueryBulder<T> extends IQueryBulder {

    expand(q: Expand | ((t: T) => QueryPath)): ISingletonQueryBulder<T>;
}

export interface ICollectionQueryBulder<T> extends IQueryBulder {

    filter(q: Filter | ((t: T) => Filter)): ICollectionQueryBulder<T>;
    expand(q: Expand | ((t: T) => QueryPath)): ICollectionQueryBulder<T>;
    count(): ICollectionQueryBulder<T>;
    top(top: number): ICollectionQueryBulder<T>;
    skip(skip: number): ICollectionQueryBulder<T>;
}

function expand(pathSegment: PathSegment[] | undefined): string | undefined {
    if (!pathSegment?.length) return undefined;

    const head = pathSegment[0].path;
    const tail = pathSegment.slice(1);
    const next = expand(tail);
    if (next == undefined) {
        return head;
    }

    return tail[0].navigationProperty
        ? `${head}($expand=${next})`
        : `${head}/${next}`;
}

export class QueryStringBuilder implements IQueryBulder {

    constructor(protected state: QueryParts) {
    }

    toQueryParts(urlEncode = true): Dict<string> {

        return [
            param("$filter", this.state.filter?.filter),
            param("$expand", expand(this.state.expand?.expand)),
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

    expand(q: Expand | ((t: TQInput) => QueryPath)): QueryBuilder<T, TQInput> {
        if (this.state.expand) {
            throw new Error("This query is alread expanded");
        }

        if (typeof q !== "function") {
            return this.expand(() => ({ path: q.expand }));
        }

        return new QueryBuilder<T, TQInput>(this.typeRef, {
            ...this.state,
            expand: { expand: q(this.typeRef).path }
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

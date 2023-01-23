import { Filter } from "./queryBuilder.js";
import { PathSegment, QueryArray, QueryEnum, QueryObject, QueryObjectType, QueryPrimitive } from "./typeRefBuilder.js";

export function and(...conditions: Filter[]): Filter {
    if (conditions.length === 0) {
        throw new Error("You must include at least 1 condition");
    }

    return {
        filter: conditions.map(x => x.filter).join(" and ")
    }
}

export function group(filter: Filter): Filter {

    return {
        filter: `(${filter.filter})`
    }
}

export function or(...conditions: Filter[]): Filter {
    if (conditions.length === 0) {
        throw new Error("You must include at least 1 condition");
    }

    return {
        filter: conditions.map(x => x.filter).join(" or ")
    }
}

export function not(condition: Filter, group = false): Filter {

    return {
        filter: `not${group ? `(${condition.filter})` : ` ${condition.filter}`}`
    }
}

function nullString(_: any) { return "null" };
function toString(x: any) { return x.toString() };
function toQuotedString(x: any) { return `'${x.toString().replace(/'/g, "''")}'`; };
function addRoundBrackets(x: any) { return `(${x})`; };

function defaultMapper(forValue: any) {

    return typeof forValue === "string"
        ? toQuotedString
        : forValue == null
            ? nullString
            : toString;
}

export function infixFunction<T>(path: PathSegment[], value: T, operator: string, mapper?: (x: T) => string): Filter {
    if (!path.length) {
        throw new Error("Primitive objects are not supported as root values");
    }

    mapper = mapper || defaultMapper(value);
    return {
        filter: `${path.map(x => x.path).join("/")} ${operator} ${mapper(value)}`
    }
}

export function binaryArrayFunction<TQueryObj extends QueryObject<TArrayType>, TArrayType>(
    obj: QueryArray<TQueryObj, TArrayType>,
    values: TArrayType[],
    functionName: string,
    mapper?: (x: TArrayType) => string): Filter {

    if (!obj.$$oDataQueryMetadata.path.length) {
        throw new Error("Collection objects are not supported as root values");
    }

    mapper = mapper || values.length ? defaultMapper(values[0]) : toString;
    return {
        filter: `${functionName}(${obj.$$oDataQueryMetadata.path.map(x => x.path).join("/")},[${values.map(mapper).join(",")}])`
    }
}

// TODO: this is all incorrect. e.g. if valiue is a guid, it will be treated like a string
// and will be surrounded by quotes which is incorrect
// check: valueSerializer.ts
export function eq<T>(obj: QueryPrimitive<T> | QueryEnum<T>, value: T, mapper?: (x: T) => string): Filter {
    return obj.$$oDataQueryObjectType === QueryObjectType.QueryPrimitive || mapper || typeof value !== "number"
        ? infixFunction<T>(obj.$$oDataQueryMetadata.path, value, "eq", mapper)
        : eqEnum(obj, value);
}

function eqEnum<T>(obj: QueryEnum<T>, value: number): Filter {
    const name = Object
        .keys(obj.$$oDataEnumType.members)
        .filter(k => obj.$$oDataEnumType.members[k] === value);

    if (!name.length) {
        throw new Error(`Cannot find name of enum for value: ${value}. Use the mapper arg to specify a custom value`);
    } else if (name.length > 1) {
        console.warn(`Found multiple members for enum value: ${value}`);
    }

    const c = infixFunction(obj.$$oDataQueryMetadata.path, name[0], "eq");
    console.log(c);
    return c
}

export function ne<T>(obj: QueryPrimitive<T>, value: T, mapper?: (x: T) => string): Filter {
    return infixFunction<T>(obj.$$oDataQueryMetadata.path, value, "ne", mapper);
}

export function gt<T>(obj: QueryPrimitive<T>, value: T, mapper?: (x: T) => string): Filter {
    return infixFunction<T>(obj.$$oDataQueryMetadata.path, value, "gt", mapper);
}

export function ge<T>(obj: QueryPrimitive<T>, value: T, mapper?: (x: T) => string): Filter {
    return infixFunction<T>(obj.$$oDataQueryMetadata.path, value, "ge", mapper);
}

export function lt<T>(obj: QueryPrimitive<T>, value: T, mapper?: (x: T) => string): Filter {
    return infixFunction<T>(obj.$$oDataQueryMetadata.path, value, "lt", mapper);
}

export function le<T>(obj: QueryPrimitive<T>, value: T, mapper?: (x: T) => string): Filter {
    return infixFunction<T>(obj.$$oDataQueryMetadata.path, value, "le", mapper);
}

export function has<T>(obj: QueryPrimitive<T>, value: T, mapper?: (x: T) => string): Filter {
    return infixFunction<T>(obj.$$oDataQueryMetadata.path, value, "has", mapper);
}

export function hasSubset<TArrayType>(
    obj: QueryArray<QueryPrimitive<TArrayType>, TArrayType>,
    value: TArrayType[],
    mapper?: (x: TArrayType) => string): Filter {

    return binaryArrayFunction(obj, value, "hassubset", mapper);
}

export function isIn<T>(obj: QueryPrimitive<T>, values: T[], mapper?: (x: T) => string): Filter {

    const valuesStr = values
        .map(x => (mapper ??= defaultMapper(x))(x))
        .join(",");

    return infixFunction<string>(obj.$$oDataQueryMetadata.path, valuesStr, "in", addRoundBrackets);
}

function arrayExpansion<TQueryObj extends QueryObject<TArrayType>, TArrayType>(
    operator: string, arr: QueryArray<TQueryObj, TArrayType>, prop: ((t: TQueryObj) => Filter)): Filter {

    const ancestorsStr = arr.$$oDataQueryMetadata.path.map(x => x.path).join("/");
    const filter = prop(arr.childObjConfig)?.filter;
    if (!filter) {
        throw new Error("Invalid prop filter for any method");
    }

    return {
        filter: `${ancestorsStr}/${operator}(${arr.childObjAlias}:${filter})`
    }
}

export function count(arr: QueryArray<any, any>): QueryPrimitive<Number> {

    return {
        $$oDataQueryObjectType: QueryObjectType.QueryPrimitive,
        $$oDataQueryMetadata: {
            type: QueryObjectType.QueryPrimitive,
            path: [
                ...arr.$$oDataQueryMetadata.path,
                {
                    path: "$count",
                    navigationProperty: false
                }
            ]
        }
    }
}

export function any<TQueryObj extends QueryObject<TArrayType>, TArrayType>(arr: QueryArray<TQueryObj, TArrayType>, prop: ((t: TQueryObj) => Filter)): Filter {

    return arrayExpansion("any", arr, prop);
}

export function all<TQueryObj extends QueryObject<TArrayType>, TArrayType>(arr: QueryArray<TQueryObj, TArrayType>, prop: ((t: TQueryObj) => Filter)): Filter {

    return arrayExpansion("all", arr, prop);
}
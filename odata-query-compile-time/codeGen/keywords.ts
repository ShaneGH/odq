import { Dict } from "./utils.js";

export type Keywords = {
    ODataServiceConfig: string
    QueryPrimitive: string
    QueryArray: string
    QueryComplexObject: string
    EntityQuery: string
    rootConfig: string
    ODataUriParts: string,
    CastSelection: string,
    ODataUtils: string,
    _httpClientArgs: string
};

export function generateKeywords(allNamespaces: string[], rootLevelTypes: string[]): Keywords {

    if (rootLevelTypes.indexOf("Edm") !== -1) {
        throw new Error('You cannot have a root level type named "Edm". "Edm" is a namespace reserved by OData for primitive types');
    }
    const lookup = allNamespaces
        .map(x => x.split("."))
        .map(x => x[0])
        .filter(x => !!x)
        .concat(rootLevelTypes)
        .reduce((s, x) => ({ ...s, [x]: true }), {} as Dict<boolean>)

    // TODO: tests for all keyword re-mappings
    return {
        QueryPrimitive: getKeyword("QueryPrimitive"),
        QueryArray: getKeyword("QueryArray"),
        QueryComplexObject: getKeyword("QueryComplexObject"),
        CastSelection: getKeyword("CastSelection"),
        EntityQuery: getKeyword("EntityQuery"),
        rootConfig: getKeyword("rootConfig"),
        ODataUtils: getKeyword("ODataUtils"),
        ODataUriParts: getKeyword("ODataUriParts"),
        ODataServiceConfig: getKeyword("ODataServiceConfig"),
        _httpClientArgs: getKeyword("_httpClientArgs")
    }

    function getKeyword(defaultVal: string) {
        if (!lookup[defaultVal]) return defaultVal;

        for (let i = 1; true; i++) {
            const val = `${defaultVal}${i}`;
            if (!lookup[val]) return val;
        }
    }
}
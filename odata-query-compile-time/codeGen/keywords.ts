import { Dict, Tab } from "./utils.js";

export type Keywords = {
    ODataServiceConfig: string
    QueryPrimitive: string
    QueryArray: string
    QueryComplexObject: string
    EntityQuery: string
    rootConfig: string
    ODataUriParts: string,
    CastSelection: string,
    SubPathSelection: string
    ODataUtils: string,
    RequestTools: string,
    _httpClientArgs: string,
    ISingletonQueryBulder: string,
    ICollectionQueryBulder: string,
    ODataMultiResult: string
    ODataSingleResult: string
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
        RequestTools: getKeyword("RequestTools"),
        QueryPrimitive: getKeyword("QueryPrimitive"),
        QueryArray: getKeyword("QueryArray"),
        QueryComplexObject: getKeyword("QueryComplexObject"),
        SubPathSelection: getKeyword("SubPathSelection"),
        CastSelection: getKeyword("CastSelection"),
        EntityQuery: getKeyword("EntityQuery"),
        rootConfig: getKeyword("rootConfig"),
        ODataUtils: getKeyword("ODataUtils"),
        ODataUriParts: getKeyword("ODataUriParts"),
        ODataServiceConfig: getKeyword("ODataServiceConfig"),
        ISingletonQueryBulder: getKeyword("ISingletonQueryBulder"),
        ICollectionQueryBulder: getKeyword("ICollectionQueryBulder"),
        ODataMultiResult: getKeyword("ODataMultiResult"),
        ODataSingleResult: getKeyword("ODataSingleResult"),
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

export function imports(keywords: Keywords, tab: Tab) {

    // TODO: audit are all of these still used?
    return `import {
${tab(importWithAlias("RequestTools"))},
${tab(importWithAlias("ODataServiceConfig"))},
${tab(importWithAlias("CastSelection"))},
${tab(importWithAlias("SubPathSelection"))},
${tab(importWithAlias("ODataUriParts"))},
${tab(importWithAlias("QueryPrimitive"))},
${tab(importWithAlias("QueryArray"))},
${tab(importWithAlias("ICollectionQueryBulder"))},
${tab(importWithAlias("ISingletonQueryBulder"))},
${tab(importWithAlias("EntityQuery"))},
${tab(importWithAlias("QueryComplexObject"))},
${tab(importWithAlias("ODataMultiResult"))},
${tab(importWithAlias("ODataSingleResult"))}
} from 'odata-query';`

    function importWithAlias(importName: keyof Keywords) {
        if (!keywords[importName]) {
            throw new Error(`Invalid keyword: ${importName}`);
        }
        return keywords[importName] === importName ? importName : `${importName} as ${keywords[importName]}`
    }
}
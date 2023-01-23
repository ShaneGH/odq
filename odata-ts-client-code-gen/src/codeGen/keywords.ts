import { Dict, Tab } from "./utils.js";

export type Keywords = {
    ODataServiceConfig: string
    QueryPrimitive: string
    QueryArray: string
    QueryComplexObject: string
    QueryEnum: string
    EntityQuery: string
    rootConfig: string
    rootConfigExporter: string
    ODataUriParts: string
    CastSelection: string
    SubPathSelection: string
    RequestTools: string,
    ODataComplexType: string,
    ODataTypeRef: string
    _httpClientArgs: string,
    ISingletonQueryBulder: string,
    ICollectionQueryBulder: string,
    ODataAnnotatedResult: string
    ODataResult: string
    Internal: string
    SingleItemsCannotBeQueriedByKey: string
    CollectionsCannotBeTraversed: string
    PrimitiveTypesCannotBeTraversed: string
    CastingOnCollectionsOfCollectionsIsNotSupported: string
    QueryingOnCollectionsOfCollectionsIsNotSupported: string
    ThisItemDoesNotHaveAKey: string
    QueryBuilder: string
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

    const keys = Object.keys(lookup)

    // TODO: tests for all keyword re-mappings
    return {
        QueryEnum: getKeyword("QueryEnum"),
        QueryBuilder: getKeyword("QueryBuilder"),
        ODataTypeRef: getKeyword("ODataTypeRef"),
        ODataComplexType: getKeyword("ODataComplexType"),
        RequestTools: getKeyword("RequestTools"),
        rootConfigExporter: getKeyword("rootConfigExporter"),
        QueryPrimitive: getKeyword("QueryPrimitive"),
        QueryArray: getKeyword("QueryArray"),
        QueryComplexObject: getKeyword("QueryComplexObject"),
        SubPathSelection: getKeyword("SubPathSelection"),
        CastSelection: getKeyword("CastSelection"),
        EntityQuery: getKeyword("EntityQuery"),
        rootConfig: getKeyword("rootConfig"),
        ODataUriParts: getKeyword("ODataUriParts"),
        ODataServiceConfig: getKeyword("ODataServiceConfig"),
        ISingletonQueryBulder: getKeyword("ISingletonQueryBulder"),
        ICollectionQueryBulder: getKeyword("ICollectionQueryBulder"),
        ODataAnnotatedResult: getKeyword("ODataAnnotatedResult"),
        ODataResult: getKeyword("ODataResult"),
        _httpClientArgs: getKeyword("_httpClientArgs"),
        SingleItemsCannotBeQueriedByKey: getKeyword("SingleItemsCannotBeQueriedByKey"),
        CollectionsCannotBeTraversed: getKeyword("CollectionsCannotBeTraversed"),
        PrimitiveTypesCannotBeTraversed: getKeyword("PrimitiveTypesCannotBeTraversed"),
        CastingOnCollectionsOfCollectionsIsNotSupported: getKeyword("CastingOnCollectionsOfCollectionsIsNotSupported"),
        QueryingOnCollectionsOfCollectionsIsNotSupported: getKeyword("QueryingOnCollectionsOfCollectionsIsNotSupported"),
        ThisItemDoesNotHaveAKey: getKeyword("ThisItemDoesNotHaveAKey"),
        Internal: getKeyword("Internal")
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
${tab(importWithAlias("QueryEnum"))},
${tab(importWithAlias("QueryBuilder"))},
${tab(importWithAlias("ODataComplexType"))},
${tab(importWithAlias("ODataTypeRef"))},
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
${tab(importWithAlias("ODataAnnotatedResult"))},
${tab(importWithAlias("ODataResult"))},
${tab(importWithAlias("SingleItemsCannotBeQueriedByKey"))},
${tab(importWithAlias("ThisItemDoesNotHaveAKey"))},
${tab(importWithAlias("CollectionsCannotBeTraversed"))},
${tab(importWithAlias("PrimitiveTypesCannotBeTraversed"))},
${tab(importWithAlias("CastingOnCollectionsOfCollectionsIsNotSupported"))},
${tab(importWithAlias("QueryingOnCollectionsOfCollectionsIsNotSupported"))}
} from 'odata-ts-client';`

    function importWithAlias(importName: keyof Keywords) {
        if (!keywords[importName]) {
            throw new Error(`Invalid keyword: ${importName}`);
        }
        return keywords[importName] === importName ? importName : `${importName} as ${keywords[importName]}`
    }
}
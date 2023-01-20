import { Keywords } from "./keywords.js";
import { Tab } from "./utils.js";

export function imports(keywords: Keywords, tab: Tab) {
    // TODO: audit are all of these still used?
    return `import {
${tab(importWithAlias("ODataServiceConfig", keywords.ODataServiceConfig))},
${tab(importWithAlias("CastSelection", keywords.CastSelection))},
${tab(importWithAlias("ODataUriParts", keywords.ODataUriParts))},
${tab(importWithAlias("QueryPrimitive", keywords.QueryPrimitive))},
${tab(importWithAlias("QueryArray", keywords.QueryArray))},
${tab(importWithAlias("EntityQuery", keywords.EntityQuery))},
${tab(importWithAlias("QueryComplexObject", keywords.QueryComplexObject))}
} from 'odata-query';`
}

function importWithAlias(importName: string, alias: string) {
    return importName === alias ? importName : `${importName} as ${alias}`

}
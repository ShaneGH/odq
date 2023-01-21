import { Keywords } from "./keywords.js";
import { Dict, Tab } from "./utils.js";

export function imports(keywords: Keywords, tab: Tab) {

    const kw = keywords as Dict<string>

    // TODO: audit are all of these still used?
    return `import {
${tab(importWithAlias("RequestTools"))},
${tab(importWithAlias("ODataServiceConfig"))},
${tab(importWithAlias("CastSelection"))},
${tab(importWithAlias("ODataUriParts"))},
${tab(importWithAlias("QueryPrimitive"))},
${tab(importWithAlias("QueryArray"))},
${tab(importWithAlias("EntityQuery"))},
${tab(importWithAlias("QueryComplexObject"))}
} from 'odata-query';`

    function importWithAlias(importName: string) {
        if (!kw[importName]) {
            throw new Error(`Invalid keyword: ${importName}`);
        }
        return kw[importName] === importName ? importName : `${importName} as ${kw[importName]}`
    }
}
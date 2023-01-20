import { Keywords } from "./keywords.js";
import { Tab } from "./utils.js";

export function imports(keywords: Keywords, tab: Tab) {
    // TODO: audit are all of these still used?
    return `import {
${tab(`ODataServiceConfig as ${keywords.ODataServiceConfig},`)}
${tab(`ODataMultiResult as ${keywords.ODataMultiResult},`)}
${tab(`CastSelection as ${keywords.CastSelection},`)}
${tab(`ODataUriParts as ${keywords.ODataUriParts},`)}
${tab(`QueryPrimitive as ${keywords.QueryPrimitive},`)}
${tab(`QueryArray as ${keywords.QueryArray},`)}
${tab(`EntityQuery as ${keywords.EntityQuery},`)}
${tab(`QueryComplexObject as ${keywords.QueryComplexObject} } from 'odata-query';`)}`
}
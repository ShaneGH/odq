import { ODataEntitySet, ODataServiceConfig } from "odata-query-shared";
import { CodeGenConfig, SupressWarnings } from "../config.js";
import { buildGetCasterName } from "./entityCasting.js";
import { buildGetQueryableName } from "./entityQuery.js";
import { Keywords } from "./keywords.js";
import { buildFullyQualifiedTsType, buildGetKeyType, buildLookupType, buildSanitizeNamespace, LookupType, Tab } from "./utils.js";

export function httpClient(
    serviceConfig: ODataServiceConfig,
    tab: Tab,
    keywords: Keywords,
    settings: CodeGenConfig | null | undefined,
    warnings: SupressWarnings | null | undefined) {

    const fullyQualifiedTsType = buildFullyQualifiedTsType(settings);
    const sanitizeNamespace = buildSanitizeNamespace(settings);
    const getKeyType = buildGetKeyType(settings, serviceConfig);
    const lookupType = buildLookupType(serviceConfig);


    const getQueryableName = buildGetQueryableName(settings);
    const getCasterName = buildGetCasterName(settings)

    // TODO: _httpClientArgs keyword is different to others.It needs to be unique from the point of
    // view of an EntitySet, not an Entity(or root namespace)
    const methods = Object
        .keys(serviceConfig.entitySets)
        .map(namespace => ({
            escapedNamespaceParts: sanitizeNamespace(namespace).split("."),
            entitySets: Object
                .keys(serviceConfig.entitySets[namespace])
                .map(k => serviceConfig.entitySets[namespace][k])
        }))
        .map(x => methodsForEntitySetNamespace(x.escapedNamespaceParts, x.entitySets))
        .join("\n\n");

    const constructor = `constructor(private ${keywords._httpClientArgs}: ${keywords.RequestTools}) { }`;

    return `export class ${settings?.oDataClientName || "ODataClient"} {
${tab(constructor)}

${tab(methods)}
}`

    // TODO: need to test code gen for entysets with no namespace. The syntax is slightly different
    function methodsForEntitySetNamespace(
        entitySetNamespaceParts: string[],
        entitySets: ODataEntitySet[],
        first = true): string {

        if (!entitySetNamespaceParts.length) {
            return entitySets
                .map(methodForEntitySet)
                .filter(x => x)
                .join(first ? "\n\n" : ",\n\n");
        }

        const methods = tab(methodsForEntitySetNamespace(
            entitySetNamespaceParts.slice(1),
            entitySets,
            false));

        const cacheArgs = first
            // TODO: weird error. If I remove the ";" from this.${keywords._httpClientArgs};, the last letter of 
            // _httpClientArgs also disappears
            ? tab(`const ${keywords._httpClientArgs} = this.${keywords._httpClientArgs};`)
            : ""

        return `get ${entitySetNamespaceParts[0]}() {
${cacheArgs}
${tab(`return {
${methods}
}`)}
}`;
    }

    function methodForEntitySet(entitySet: ODataEntitySet): string | undefined {

        const type = lookupType(entitySet.forType);
        if (!type) {
            if (!warnings?.suppressAll && !warnings?.suppressUnableToFindTypeForEntitySet) {
                const ns = entitySet.namespace && `${entitySet.namespace}.`
                console.warn(`Could not find type for entity set: ${ns}${entitySet.name}. `
                    // TODO: standardise "to suppress this warning text"
                    + "To supress this warning, set warningSettings.suppressUnableToFindTypeForEntitySet to false");
            }

            return undefined;
        }

        const resultType = fullyQualifiedTsType(entitySet.forType);
        const queryableType = fullyQualifiedTsType(entitySet.forType, getQueryableName);
        const casterType = fullyQualifiedTsType(entitySet.forType, getCasterName)
        const idType = getKeyType(type, true);
        const generics = [
            resultType,
            idType || "never",
            queryableType,
            //`${keywords.ICollectionQueryBulder}<${queryableType}>`,
            casterType,
            `${keywords.ODataMultiResult}<${resultType}>`
        ].join(", ");

        const instanceType = `${keywords.EntityQuery}<${generics}>`;
        const constructorArgs = [
            `${keywords._httpClientArgs}`,
            `${keywords.rootConfig}.types["${entitySet.forType.namespace || ""}"]["${entitySet.forType.name}"]`,
            `${keywords.rootConfig}.entitySets["${entitySet.namespace || ""}"]["${entitySet.name}"]`,
            keywords.rootConfig
        ]

        return `get ${entitySet.name}() {
${tab(`return new ${instanceType}(${constructorArgs.join(", ")});`)}
}`
    }
}
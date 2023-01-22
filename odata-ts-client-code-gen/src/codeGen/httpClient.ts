import { ODataEntitySet, ODataServiceConfig } from "odata-ts-client-shared";
import { CodeGenConfig, SupressWarnings } from "../config.js";
import { Keywords } from "./keywords.js";
import { buildFullyQualifiedTsType, buildGetCasterName, buildGetKeyType, buildGetQueryableName, buildGetSubPathName, buildLookupType, buildSanitizeNamespace, httpClientType, Tab } from "./utils.js";

export function httpClient(
    serviceConfig: ODataServiceConfig,
    tab: Tab,
    keywords: Keywords,
    settings: CodeGenConfig | null | undefined,
    warnings: SupressWarnings | null | undefined) {

    const fullyQualifiedTsType = buildFullyQualifiedTsType(settings);
    const sanitizeNamespace = buildSanitizeNamespace(settings);
    const getKeyType = buildGetKeyType(settings, serviceConfig, keywords);
    const lookupType = buildLookupType(serviceConfig);

    const getQueryableName = buildGetQueryableName(settings);
    const getCasterName = buildGetCasterName(settings)
    const getSubPathName = buildGetSubPathName(settings)

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

    return `/*
 * The http client which serves as an entry point to OData
 */
export class ${className()} {
${tab(constructor)}

${tab(toODataTypeRef())}

${tab(methods)}
}`

    function className() {
        return settings?.oDataClientName || "ODataClient";
    }

    function toODataTypeRef() {
        return `private static toODataTypeRef(namespace: string, name: string): ${keywords.ODataTypeRef} {
${tab("return { isCollection: true, collectionType: { isCollection: false, name, namespace } }")}
}`
    }

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
        const subPathType = fullyQualifiedTsType(entitySet.forType, getSubPathName)

        const idType = getKeyType(type, true);
        const generics = {
            tEntity: resultType,
            tKey: idType,
            tQuery: {
                isPrimitive: false,
                fullyQualifiedQueryableName: queryableType
            },
            tCaster: `${casterType}.Collection`,
            tSingleCaster: `${casterType}.Single`,
            tSubPath: keywords.CollectionsCannotBeTraversed,
            tSingleSubPath: `${subPathType}`,
            tResult: {
                annotated: true,
                resultType: `${resultType}[]`
            }
        }

        const instanceType = httpClientType(keywords, generics, tab);
        const constructorArgs = [
            `${keywords._httpClientArgs}`,
            `${className()}.toODataTypeRef("${entitySet.forType.namespace || ""}", "${entitySet.forType.name}")`,
            `${keywords.rootConfig}.entitySets["${entitySet.namespace || ""}"]["${entitySet.name}"]`,
            keywords.rootConfig
        ]

        return `get ${entitySet.name}() {
${tab(`return new ${instanceType}(${constructorArgs.join(", ")});`)}
}`
    }
}
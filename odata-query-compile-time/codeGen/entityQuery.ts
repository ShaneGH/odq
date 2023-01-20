import { ODataComplexType, ODataPropertyType, ODataServiceConfig } from "odata-query-shared";
import { CodeGenConfig } from "../config.js";
import { Keywords } from "./keywords.js";
import { buildFullyQualifiedTsType, buildSanitizeNamespace, FullyQualifiedTsType, Tab } from "./utils.js";



function getQueryableTypeString(
    type: ODataPropertyType, wrapInQueryObject: boolean, keywords: Keywords, serviceConfig: ODataServiceConfig,
    fullyQualifiedTsType: FullyQualifiedTsType, getQueryableName: GetQueryableName): string {

    const t = getQueryableType(type, keywords, serviceConfig, fullyQualifiedTsType, getQueryableName);
    return wrapInQueryObject
        ? `${t.wrapper}<${t.generics.join(", ")}>`
        : t.generics[0];
}

function getQueryableType(type: ODataPropertyType, keywords: Keywords,
    serviceConfig: ODataServiceConfig, fullyQualifiedTsType: FullyQualifiedTsType, getQueryableName: GetQueryableName) {
    // TODO: namespacing of value from getTypeString?
    // TODO: test for QueryArray<QueryArray<T>>
    if (type.isCollection) {
        // TODO: type signature gets very long. Remove namespaces where possible
        return {
            wrapper: keywords.QueryArray,
            generics: [
                getQueryableTypeString(type.collectionType, true, keywords, serviceConfig, fullyQualifiedTsType, getQueryableName),
                getQueryableTypeString(type.collectionType, false, keywords, serviceConfig, fullyQualifiedTsType, getQueryableName)
            ]
        };
    }

    if (type.namespace === "Edm") {
        return {
            wrapper: keywords.QueryPrimitive,
            generics: [`Edm.${type.name}`]
        };
    }

    if (!serviceConfig.types[type.namespace] || !serviceConfig.types[type.namespace][type.name]) {
        const ns = type.namespace ? `${type.namespace}.` : "";
        throw new Error(`Unknown type: ${ns}${type.name}`);
    }

    const t = fullyQualifiedTsType(type, getQueryableName);

    return {
        wrapper: keywords.QueryComplexObject,
        generics: [t]
    };
}

export type GetQueryableName = (forType: string) => string
export const buildGetQueryableName = (settings: CodeGenConfig | null | undefined): GetQueryableName => {

    return (forType: string) => {
        const qTemplate = settings?.queryableTypeNameTemplate || "Queryable{0}";
        return qTemplate.replace(/\{0\}/g, forType);
    }
}

export type EntityQuery = (type: ODataComplexType) => string
export const buildEntityQuery = (settings: CodeGenConfig | null | undefined, tab: Tab, keywords: Keywords, serviceConfig: ODataServiceConfig): EntityQuery => {

    const sanitizeNamespace = buildSanitizeNamespace(settings);
    const fullyQualifiedTsType = buildFullyQualifiedTsType(settings);
    const getQueryableName = buildGetQueryableName(settings);

    return (type: ODataComplexType) => {
        const qtName = getQueryableName(type.name)
        const baseTypeNs = type.baseType?.namespace ? `${sanitizeNamespace(type.baseType?.namespace)}.` : ""
        const baseQType = type.baseType ? `${baseTypeNs}${getQueryableName(type.baseType.name)} & ` : "";

        const queryableProps = Object
            .keys(type.properties)
            .map(key => ({
                key,
                type: getQueryableTypeString(type.properties[key].type, true, keywords, serviceConfig, fullyQualifiedTsType, getQueryableName)
            }))
            .map(prop => `${prop.key}: ${prop.type}`)
            .join("\n");

        return `export type ${qtName} = ${baseQType}{
${tab(queryableProps)}
}`
    }
}
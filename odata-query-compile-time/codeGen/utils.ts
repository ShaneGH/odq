import { ODataComplexType, ODataPropertyType, ODataServiceConfig, ODataTypeRef } from "odata-query-shared";
import { CodeGenConfig } from "../config.js";
import { Keywords } from "./keywords.js";

export type Dict<T> = { [key: string]: T }

const defaultTabs = 2;

export type Tab = {
    (text: string): string
    spaces: number
}

export function buildTab(settings: CodeGenConfig | null | undefined): Tab {
    const tabValue = [...Array(settings?.tabSize == null ? defaultTabs : settings.tabSize).keys()]
        .map(_ => " ")
        .join("");

    function f(input: string) {

        return input
            .split(/\r?\n/)
            .map(x => tabValue + x)
            .join("\n");
    }

    f.spaces = tabValue.length

    return f;
}

export function linting() {
    return `/* tslint:disable */
/* eslint-disable */`
}

export function configObj(serviceConfig: ODataServiceConfig, keywords: Keywords, settings: CodeGenConfig | null | undefined, tab: Tab) {
    const oDataServiceConfig = !!settings?.prettyPrintJsonConfig
        ? JSON.stringify(serviceConfig, null, tab.spaces)
        : JSON.stringify(serviceConfig);

    const exportSettings = settings?.exportTypeDefinitionJsObject ? "export " : ""

    return `// a config object which describes relationships between types
${exportSettings}const ${keywords.rootConfig}: ${keywords.ODataServiceConfig} = ${oDataServiceConfig}`
}

type SanitizeNamespace = (namespace: string) => string
export const buildSanitizeNamespace = (settings: CodeGenConfig | null | undefined): SanitizeNamespace => (namespace: string) => {
    return namespace.replace(/[^a-zA-Z0-9$._]/, settings?.namespaceSpecialCharacter || ".");
}

export type LookupType = (t: ODataTypeRef) => ODataComplexType | undefined

// TODO: if the key type is a collection, I think this function will fall over
export const buildLookupType = (serviceConfig: ODataServiceConfig): LookupType => (t: ODataTypeRef) => {
    return (serviceConfig.types[t.namespace] && serviceConfig.types[t.namespace][t.name]) || undefined
}

function id<T>(x: T) { return x }

export type FullyQualifiedTsType = (type: ODataPropertyType, transformTypeName?: ((name: string) => string) | undefined) => string
export const buildFullyQualifiedTsType = (settings: CodeGenConfig | null | undefined): FullyQualifiedTsType => {
    const sanitizeNamespace = buildSanitizeNamespace(settings)

    const fullyQualifiedTsType = (type: ODataPropertyType, transformTypeName?: ((name: string) => string) | undefined): string => {

        if (type.isCollection) {
            return `${fullyQualifiedTsType(type.collectionType, transformTypeName)}[]`
        }

        transformTypeName ??= id;
        const ns = type.namespace ? `${sanitizeNamespace(type.namespace)}.` : "";
        return `${ns}${transformTypeName(type.name)}`;
    }

    return fullyQualifiedTsType;
}

function getKeyPropertyType(prop: ODataPropertyType, fullyQualifiedTsType: FullyQualifiedTsType): string {
    if (prop.isCollection) {
        // TODO: test
        return getKeyPropertyType(prop.collectionType, fullyQualifiedTsType) + "[]"
    }

    return fullyQualifiedTsType({
        isCollection: false,
        name: prop.name,
        namespace: prop.namespace
    });

}

export type GetKeyType = (t: ODataComplexType, lookupParent: boolean) => string | undefined
export const buildGetKeyType = (settings: CodeGenConfig | null | undefined, serviceConfig: ODataServiceConfig): GetKeyType => {

    const fullyQualifiedTsType = buildFullyQualifiedTsType(settings)
    const lookupType = buildLookupType(serviceConfig)

    const getKeyType: GetKeyType = (t: ODataComplexType, lookupParent = true): string | undefined => {
        if (!t.keyProp) {
            if (t.baseType && lookupParent) {
                const baseType = lookupType({ isCollection: false, namespace: t.baseType.namespace, name: t.baseType.name })
                if (!baseType) {
                    const ns = t.baseType.namespace && `${t.baseType.namespace}.`
                    throw new Error(`Could not find base type: ${ns}${t.baseType.name}`);
                }

                return getKeyType(baseType, lookupParent)
            }

            return undefined;
        }

        const prop = t.properties[t.keyProp];
        if (!prop) {
            const ns = t.namespace ? `${t.namespace}.` : ""
            throw new Error(`Could not find key property: ${t.keyProp} of type ${ns}${t.name}`)
        }

        return getKeyPropertyType(prop.type, fullyQualifiedTsType);
    }

    return getKeyType;
}

export type GetTypeString = (type: ODataPropertyType) => string
export const buildGetTypeString = (settings: CodeGenConfig | null | undefined) => {

    const fullyQualifiedTsType = buildFullyQualifiedTsType(settings);
    const getTypeString = (type: ODataPropertyType): string => {

        if (type.isCollection) {
            return `${getTypeString(type.collectionType)}[]`;
        }

        return fullyQualifiedTsType(type);
    }

    return getTypeString;
}
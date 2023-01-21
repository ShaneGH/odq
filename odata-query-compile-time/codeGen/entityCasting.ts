import { ODataComplexType, ODataServiceConfig, ODataServiceTypes, ODataTypeRef } from "odata-query-shared";
import { CodeGenConfig } from "../config.js";
import { buildGetQueryableName, GetQueryableName } from "./entityQuery.js";
import { Keywords } from "./keywords.js";
import { buildFullyQualifiedTsType, buildGetKeyType, FullyQualifiedTsType, GetKeyType, Tab } from "./utils.js"

type GetCasterName = (forType: string) => string
export const buildGetCasterName = (settings: CodeGenConfig | null | undefined): GetCasterName => (forType: string) => {
    const qTemplate = settings?.casterTypeNameTemplate || "{0}Caster";
    return qTemplate.replace(/\{0\}/g, forType);
}

// TODO: duplicate_logic_key: caster
// TODO: this is a fairly heavy method to be called quite a bit. Optisation?
function getCasterProps(
    type: ODataComplexType,
    allTypes: ODataServiceTypes,
    fullyQualifiedTsType: FullyQualifiedTsType,
    getKeyType: GetKeyType,
    getQueryableName: GetQueryableName,
    getCasterName: GetCasterName,
    keywords: Keywords) {

    const inherits = Object
        .keys(allTypes)
        .map(ns => Object
            .keys(allTypes[ns])
            .map(t => allTypes[ns][t]))
        .reduce((s, x) => [...s, ...x], [])
        .filter(x => x.baseType
            && x.baseType.namespace === type.namespace
            && x.baseType.name === type.name);

    const distinctNames = Object.keys(inherits
        .reduce((s, x) => ({ ...s, [x.name]: true }), {} as { [key: string]: boolean }))

    const name = inherits.length === distinctNames.length
        ? (x: ODataComplexType) => x.name
        // TODO: test
        // TODO: this logic will be duplicated in the code gen project. Possible to merge?
        : (x: ODataComplexType) => `${x.namespace}.${x.name}`.replace(/[^\w]/g, "_")

    return inherits
        .map(t => {
            const typeRef: ODataTypeRef = { namespace: t.namespace, name: t.name, isCollection: false };
            const generics = [
                fullyQualifiedTsType(typeRef),
                getKeyType(t, true) || "never",
                fullyQualifiedTsType(typeRef, getQueryableName),
                fullyQualifiedTsType(typeRef, getCasterName)
            ].join(", ");

            return `${name(t)}(): ${keywords.CastSelection}<${keywords.EntityQuery}<${generics}>>`
        })
}

export type EntityCasting = (type: ODataComplexType) => string
export const buildEntityCasting = (tab: Tab, settings: CodeGenConfig | null | undefined, serviceConfig: ODataServiceConfig,
    keywords: Keywords) => {

    const getCasterName = buildGetCasterName(settings);
    const fullyQualifiedTsType = buildFullyQualifiedTsType(settings);
    const getKeyType = buildGetKeyType(settings, serviceConfig);
    const getQueryableName = buildGetQueryableName(settings);

    return (type: ODataComplexType) => {
        const casterName = getCasterName(type.name)
        const casterProps = getCasterProps(type, serviceConfig.types, fullyQualifiedTsType, getKeyType, getQueryableName, getCasterName, keywords)

        return `export type ${casterName} = {
${tab(casterProps.join("\n"))}
}`
    }
}
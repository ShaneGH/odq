import { ODataComplexType, ODataServiceConfig, ODataServiceTypes, ODataTypeRef } from "odata-query-shared";
import { CodeGenConfig } from "../config.js";
import { Keywords } from "./keywords.js";
import { buildFullyQualifiedTsType, buildGetCasterName, buildGetKeyType, buildGetQueryableName, buildGetSubPathName, FullyQualifiedTsType, GetCasterName, GetKeyType, GetQueryableName, GetSubPathName, httpClientType, Tab } from "./utils.js"

// TODO: duplicate_logic_key: caster
// TODO: this is a fairly heavy method to be called quite a bit. Optisation?
function buildGetCasterProps(
    allTypes: ODataServiceTypes,
    fullyQualifiedTsType: FullyQualifiedTsType,
    getKeyType: GetKeyType,
    getQueryableName: GetQueryableName,
    getCasterName: GetCasterName,
    getSubPathName: GetSubPathName,
    keywords: Keywords,
    tab: Tab) {

    return (type: ODataComplexType, resultWrapper: string, casterType: string) => {

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
                const resultType = fullyQualifiedTsType(typeRef)
                const caster = fullyQualifiedTsType(typeRef, getCasterName)
                const subProps = fullyQualifiedTsType(typeRef, getSubPathName)

                const generics = {
                    tEntity: resultType,
                    tKey: getKeyType(t, true) || "never",
                    tQuery: fullyQualifiedTsType(typeRef, getQueryableName),
                    tCaster: `${caster}.${casterType}`,
                    tSingleCaster: `${caster}.Single`,
                    tSubPath: `${subProps}.${casterType}`,
                    tSingleSubPath: `${subProps}.Single`,
                    tResult: `${resultWrapper}<${resultType}>`
                }

                const entityQueryType = httpClientType(keywords, generics, tab, false);
                return `${name(t)}(): ${keywords.CastSelection}<${entityQueryType}>`
            })
    }
}

export type EntityCasting = (type: ODataComplexType) => string
export const buildEntityCasting = (tab: Tab, settings: CodeGenConfig | null | undefined, serviceConfig: ODataServiceConfig,
    keywords: Keywords) => {

    const getCasterName = buildGetCasterName(settings);
    const getSubPathName = buildGetSubPathName(settings);
    const getQueryableName = buildGetQueryableName(settings);
    const fullyQualifiedTsType = buildFullyQualifiedTsType(settings);
    const getKeyType = buildGetKeyType(settings, serviceConfig);
    const getCasterProps = buildGetCasterProps(serviceConfig.types, fullyQualifiedTsType, getKeyType, getQueryableName, getCasterName, getSubPathName, keywords, tab);

    return (type: ODataComplexType) => {
        const casterName = getCasterName(type.name)

        return `export module ${casterName} {
${tab(single(type))}
${tab(collection(type))}
}`
    }

    function single(type: ODataComplexType) {
        const props = getCasterProps(type, "ODataSingleResult", "Single")
        return `export type Single = {
${tab(props.join("\n"))}
}`;
    }

    function collection(type: ODataComplexType) {
        const props = getCasterProps(type, "ODataMultiResult", "Collection")
        return `export type Collection = {
${tab(props.join("\n"))}
}`;

    }
}
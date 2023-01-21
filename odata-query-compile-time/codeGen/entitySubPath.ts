import { ODataComplexType, ODataPropertyType, ODataServiceConfig, ODataServiceTypes, ODataTypeRef } from "odata-query-shared";
import { CodeGenConfig } from "../config.js";
import { Keywords } from "./keywords.js";
import { buildFullyQualifiedTsType, buildGetCasterName, buildGetKeyType, buildGetQueryableName, buildGetSubPathName, buildSanitizeNamespace, FullyQualifiedTsType, GetCasterName, GetKeyType, GetQueryableName, GetSubPathName, httpClientType, Tab } from "./utils.js"

// TODO: duplicate_logic_key: subPath
enum ObjectType {
    ComplexType = "ComplexType",
    PrmitiveType = "PrmitiveType"
}

type IsObjectDescription<T extends ObjectType> = {
    objectType: T
}

type IsComplexType = IsObjectDescription<ObjectType.ComplexType> & {
    complexType: ODataComplexType
}

type IsPrimitiveType = IsObjectDescription<ObjectType.PrmitiveType> & {
    primitiveType: ODataTypeRef
}

type EntityTypeInfo = {
    // the number of collection in this type info. e.g. MyType[][][] === 3
    collectionDepth: number
    // if null, this is a primitive object
    type: IsComplexType | IsPrimitiveType
}

// TODO: allow multiple paths in a single call... e.g. x => x.BlogPost.Blog.User
function buildGetSubPathProps(
    allTypes: ODataServiceTypes,
    fullyQualifiedTsType: FullyQualifiedTsType,
    getKeyType: GetKeyType,
    getQueryableName: GetQueryableName,
    getCasterName: GetCasterName,
    getSubPathName: GetSubPathName,
    keywords: Keywords,
    tab: Tab) {

    return (type: ODataComplexType): string[] => {

        return Object
            .keys(type.properties)
            .map(key => [key, type.properties[key].type] as [string, ODataPropertyType])
            .map(([key, value]) => {

                // TODO: test with arrays of arrays?

                const entityInfo = getEntityTypeInfo(value)
                const tEntity = typeName(entityInfo, 1)

                const generics = {
                    tEntity,
                    tKey: getPropertyKeyType(entityInfo) || "never",
                    tQuery: getTQuery(entityInfo),
                    tCaster: getTCaster(entityInfo),
                    tSingleCaster: getTCaster(entityInfo, true),
                    tSubPath: entityInfo.collectionDepth ? "never" : getTSubPath(entityInfo, false),
                    tSingleSubPath: entityInfo.collectionDepth ? getTSubPath(entityInfo, true) : "never",
                    tResult: entityInfo.collectionDepth ? `ODataMultiResult<${tEntity}>` : `ODataSingleResult<${tEntity}>`
                }

                const entityQueryType = httpClientType(keywords, generics, tab, false);
                return `${key}: ${keywords.SubPathSelection}<${entityQueryType}>`
            })
    }

    function getTSubPath(info: EntityTypeInfo, single: boolean) {

        // TODO: is is possible to cast a primitive? (e.g. int -> string)
        if (info.type.objectType !== ObjectType.ComplexType) {
            return "never";
        }

        if (info.collectionDepth > 1 || (info.collectionDepth && !single)) {
            return "never";
        }

        return fullyQualifiedTsType({
            isCollection: false,
            namespace: info.type.complexType.namespace,
            name: info.type.complexType.name
        }, getSubPathName)
    }

    function getTCaster(info: EntityTypeInfo, forceSingle = false) {

        // TODO: is is possible to cast a primitive? (e.g. int -> string)
        if (info.type.objectType !== ObjectType.ComplexType || info.collectionDepth > 1) {
            return "never";
        }

        const caster = fullyQualifiedTsType({
            isCollection: false,
            namespace: info.type.complexType.namespace,
            name: info.type.complexType.name
        }, getCasterName)

        return forceSingle || !info.collectionDepth
            ? `${caster}.Single`
            : `${caster}.Collection`
    }

    function getTQuery(info: EntityTypeInfo) {

        if (info.type.objectType !== ObjectType.ComplexType || info.collectionDepth > 1) {
            return "TODO_Type";
        }

        return fullyQualifiedTsType({
            isCollection: false,
            namespace: info.type.complexType.namespace,
            name: info.type.complexType.name
        }, getQueryableName)
    }

    function getPropertyKeyType(type: EntityTypeInfo) {

        if (type.collectionDepth !== 1 || type.type.objectType !== ObjectType.ComplexType) {
            return null;
        }

        return getKeyType(type.type.complexType, true)
    }

    function typeName(info: EntityTypeInfo, unwrapCollections = 0) {
        const collectionStr = [...Array(Math.max(0, info.collectionDepth - unwrapCollections)).keys()]
            .map(_ => "[]")
            .join("")

        return info.type.objectType === ObjectType.PrmitiveType
            ? fullyQualifiedTsType(info.type.primitiveType) + collectionStr
            : fullyQualifiedTsType({
                isCollection: false,
                namespace: info.type.complexType.namespace,
                name: info.type.complexType.name
            }) + collectionStr;
    }

    function getEntityTypeInfo(propertyType: ODataPropertyType): EntityTypeInfo {
        if (propertyType.isCollection) {
            const innerResult = getEntityTypeInfo(propertyType.collectionType)
            return {
                ...innerResult,
                collectionDepth: innerResult.collectionDepth + 1
            }
        }

        if (propertyType.namespace === "Edm") {
            return {
                collectionDepth: 0,
                type: {
                    objectType: ObjectType.PrmitiveType,
                    primitiveType: propertyType
                }
            };
        }

        const type = allTypes[propertyType.namespace] && allTypes[propertyType.namespace][propertyType.name]
        if (!type) {
            const ns = propertyType.namespace && `${propertyType.namespace}.`
            throw new Error(`Could not find key for type ${ns}${propertyType.name}`);
        }

        return {
            collectionDepth: 0,
            type: {
                objectType: ObjectType.ComplexType,
                complexType: type
            }
        };
    }
}

export type EntityCasting = (type: ODataComplexType) => string
export const buildEntitySubPath = (tab: Tab, settings: CodeGenConfig | null | undefined, serviceConfig: ODataServiceConfig,
    keywords: Keywords) => {

    const sanitizeNamespace = buildSanitizeNamespace(settings);
    const getCasterName = buildGetCasterName(settings);
    const getSubPathName = buildGetSubPathName(settings);
    const fullyQualifiedTsType = buildFullyQualifiedTsType(settings);
    const getKeyType = buildGetKeyType(settings, serviceConfig);
    const getQueryableName = buildGetQueryableName(settings);
    const getSubPathProps = buildGetSubPathProps(serviceConfig.types, fullyQualifiedTsType, getKeyType, getQueryableName, getCasterName, getSubPathName, keywords, tab);

    return (type: ODataComplexType) => {
        const subPathName = getSubPathName(type.name)
        const baseTypeNs = type.baseType?.namespace ? `${sanitizeNamespace(type.baseType?.namespace)}.` : ""
        const fullyQualifiedBaseTypeName = type.baseType ? `${baseTypeNs}${getSubPathName(type.baseType.name)}` : null;
        const baseType = (fullyQualifiedBaseTypeName || "") && `${fullyQualifiedBaseTypeName} & `
        const props = getSubPathProps(type)

        return `export type ${subPathName} = ${baseType}{
${tab(props.join("\n"))}
}`;
    }
}
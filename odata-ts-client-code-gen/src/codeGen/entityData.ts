import { ODataComplexType, ODataEnum, ComplexTypeOrEnum } from "odata-ts-client-shared";
import { CodeGenConfig } from "../config.js";
import { buildGetTypeString, buildSanitizeNamespace, Tab } from "./utils.js";

export type EntityData = (type: ComplexTypeOrEnum) => string
export const buildEntityData = (settings: CodeGenConfig | null | undefined, tab: Tab): EntityData => {

    const getTypeString = buildGetTypeString(settings);
    const sanitizeNamespace = buildSanitizeNamespace(settings);
    const enumValue = /number/i.test(settings?.enumType || "")
        ? (k: string, v: number) => v.toString()
        : (k: string, v: number) => `"${k}"`

    return (type: ComplexTypeOrEnum) => type.containerType === "ComplexType"
        ? buildComplexType(type.type)
        : buildEnum(type.type);

    function buildComplexType(type: ODataComplexType) {

        const q = (nullable: boolean) => nullable || settings?.makeAllPropsOptional === false ? "?" : "";
        const props = Object
            .keys(type.properties)
            .map(key => ({ key, type: getTypeString(type.properties[key].type), nullable: type.properties[key].nullable }))
            .map(prop => `${prop.key}${q(prop.nullable)}: ${prop.type}`)
            .join("\n");

        const baseTypeNs = type.baseType?.namespace ? `${sanitizeNamespace(type.baseType?.namespace)}.` : ""
        const baseType = type.baseType ? `${baseTypeNs}${type.baseType.name} & ` : "";

        return `export type ${type.name} = ${baseType}{
${tab(props)}
}`
    }

    function buildEnum(type: ODataEnum) {

        const members = Object
            .keys(type.members)
            .map(key => `${key} = ${enumValue(key, type.members[key])}`)
            .join(",\n");

        return `export enum ${type.name} {
${tab(members)}
}`
    }
}
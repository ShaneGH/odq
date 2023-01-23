import { ODataComplexType } from "odata-ts-client-shared";
import { CodeGenConfig } from "../config.js";
import { buildGetTypeString, buildSanitizeNamespace, Tab } from "./utils.js";


export type EntityData = (type: ODataComplexType) => string
export const buildEntityData = (settings: CodeGenConfig | null | undefined, tab: Tab): EntityData => {

    const getTypeString = buildGetTypeString(settings);
    const sanitizeNamespace = buildSanitizeNamespace(settings);
    return (type: ODataComplexType) => {

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
}
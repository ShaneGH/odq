import { ODataPropertyType } from "odata-query-shared";


export function serialize(value: any, type: ODataPropertyType) {
    if (type.isCollection) {
        throw new Error("TODO: not implemented")
        // if (!Array.isArray(value)) {
        //     throw new Error(`Cannot serialize non array value to `);
        // }
    }

    const t = type;
    if (type.namespace !== "Edm") {
        throw err();
    }

    // TODO: test each
    switch (type.name) {
        case "String": return `'${value}'`;
        case "Guid":
        case "Boolean":
        case "Int16":
        case "Int32":
        case "Int64":
        case "Decimal":
        case "Double":
        case "Single": return value.toString()
        default: throw err()
    }

    function err() {
        return new Error(`Property type - namespace: ${t.namespace}, name: ${t.name} cannot be used as a key lookup`);
    }

    /* TODO:
    ${tab(mapSimpleType("DateTime", "Date"))}
    ${tab(mapSimpleType("DateTimeOffset", "Date"))}
    
    <xs:enumeration value="Edm.Byte"/>
    <xs:enumeration value="Edm.Binary"/>
    <xs:enumeration value="Edm.Duration"/>
    <xs:enumeration value="Edm.TimeOfDay"/>
    <xs:enumeration value="Edm.GeographyPoint"/>
    <xs:enumeration value="Edm.GeographyLineString"/>
    <xs:enumeration value="Edm.GeographyPolygon"/>
    <xs:enumeration value="Edm.GeographyMultiPoint"/>
    <xs:enumeration value="Edm.GeographyMultiLineString"/>
    <xs:enumeration value="Edm.GeographyMultiPolygon"/>
    <xs:enumeration value="Edm.GeographyCollection"/>
    <xs:enumeration value="Edm.GeometryPoint"/>
    <xs:enumeration value="Edm.GeometryLineString"/>
    <xs:enumeration value="Edm.GeometryPolygon"/>
    <xs:enumeration value="Edm.GeometryMultiPoint"/>
    <xs:enumeration value="Edm.GeometryMultiLineString"/>
    <xs:enumeration value="Edm.GeometryMultiPolygon"/>
    <xs:enumeration value="Edm.GeometryCollection"/>
    <xs:enumeration value="Edm.SByte"/>*/

}
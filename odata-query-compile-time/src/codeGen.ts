
// Old file. Keeping for a while but can probably be deleted

// import { ODataEntitySet, ODataServiceConfig, ODataComplexType, ODataTypeRef, ODataSingleTypeRef, ODataServiceTypes } from "odata-query-shared";
// import { CodeGenConfig, SupressWarnings } from "./config.js";

// const defaultTabs = 2;

// type Keywords = {
//     QueryBuilder: string,
//     PrimitiveQueryBuilder: string
//     ODataServiceConfig: string
//     QueryPrimitive: string
//     QueryArray: string
//     QueryComplexObject: string
//     ODataMultiResult: string
//     EntityQuery: string
//     rootConfig: string
//     ODataUriParts: string,
//     CastSelection: string,
//     _httpClientArgs: string
// };

// type Dict<T> = { [key: string]: T }

// function id<T>(x: T) { return x }

// function generateKeywords(allNamespaces: string[], rootLevelTypes: string[]): Keywords {

//     if (rootLevelTypes.indexOf("Edm") !== -1) {
//         throw new Error('You cannot have a root level type named "Edm". "Edm" is a namespace reserved by OData for primitive types');
//     }
//     const lookup = allNamespaces
//         .map(x => x.split("."))
//         .map(x => x[0])
//         .filter(x => !!x)
//         .concat(rootLevelTypes)
//         .reduce((s, x) => ({ ...s, [x]: true }), {} as Dict<boolean>)

//     // TODO: tests for all keyword re-mappings
//     return {
//         QueryBuilder: getKeyword("QueryBuilder"),
//         QueryPrimitive: getKeyword("QueryPrimitive"),
//         QueryArray: getKeyword("QueryArray"),
//         QueryComplexObject: getKeyword("QueryComplexObject"),
//         PrimitiveQueryBuilder: getKeyword("PrimitiveQueryBuilder"),
//         CastSelection: getKeyword("CastSelection"),
//         ODataMultiResult: getKeyword("ODataMultiResult"),
//         EntityQuery: getKeyword("EntityQuery"),
//         rootConfig: getKeyword("rootConfig"),
//         ODataUriParts: getKeyword("ODataUriParts"),
//         ODataServiceConfig: getKeyword("ODataServiceConfig"),
//         _httpClientArgs: getKeyword("_httpClientArgs")
//     }

//     function getKeyword(defaultVal: string) {
//         if (!lookup[defaultVal]) return defaultVal;

//         for (let i = 1; true; i++) {
//             const val = `${defaultVal}${i}`;
//             if (!lookup[val]) return val;
//         }
//     }
// }

// export function codeGen(serviceConfig: ODataServiceConfig, settings: CodeGenConfig | null | undefined, warnings: SupressWarnings | null | undefined) {

//     const allTypes = serviceConfig.types;
//     const allEntitySets = serviceConfig.entitySets;
//     const keywords = generateKeywords(Object.keys(allTypes), Object.keys(allTypes[""] || {}));

//     const oDataServiceConfig = !!settings?.prettyPrintJsonConfig
//         ? JSON.stringify(serviceConfig, null, defaultTabs)
//         : JSON.stringify(serviceConfig);

//     // TODO: make module composition a bit nicer "module X { module Y { module Z { ..."
//     const output = `
// ${imports()}

// ${linting()}

// ${configObj()}

// ${edm()}

// ${entities()}

// ${httpClient()}`

//     return output
//         .replace(/\r\n/g, "\n")
//         .replace(/s+\n/g, "\n") + "\n";

//     function httpClient() {

//         // TODO: _httpClientArgs keyword is different to others.It needs to be unique from the point of
//         // view of an EntitySet, not an Entity(or root namespace)
//         const methods = Object
//             .keys(allEntitySets)
//             .map(namespace => ({
//                 escapedNamespaceParts: sanitizeNamespace(namespace).split("."),
//                 entitySets: Object
//                     .keys(allEntitySets[namespace])
//                     .map(k => allEntitySets[namespace][k])
//             }))
//             .map(x => methodsForEntitySetNamespace(x.escapedNamespaceParts, x.entitySets))
//             .join("\n\n");

//         const args = [
//             "// add a basic http client in here. Such as a browser fetch, node18 fetch or the node-fetch module",
//             "fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>",
//             "",
//             "// the root URI of all collections. Something like: https://my.service.com/my-odata-collections",
//             "uriRoot: string",
//             "",
//             `// optional. Interceptor for uri building`,
//             `uriBuilder?: (uri: ${keywords.ODataUriParts}) => string`,
//             "",
//             "// optional. Interceptor for http requests. Use this to add security",
//             "requestInterceptor?: (uri: string, reqValues: RequestInit,) => RequestInit",
//             "",
//             `// optinal. Add custom response parsing`,
//             `responseParser?: (input: Response, uri: string, reqValues: RequestInit, defaultParser: (input: Response) => Promise<any>) => Promise<any>`,
//         ].join("\n")

//         const constructor = `constructor(private ${keywords._httpClientArgs}: {
// ${tab(args)} }) { }`;

//         return `export class ${settings?.oDataClientName || "ODataClient"} {
// ${tab(constructor)}

// ${tab(methods)}
// }`
//     }

//     function methodForEntitySet(entitySet: ODataEntitySet): string | undefined {

//         const type = lookupType(entitySet.forType);
//         if (!type) {
//             if (!warnings?.suppressAll && !warnings?.suppressUnableToFindTypeForEntitySet) {
//                 const ns = entitySet.namespace && `${entitySet.namespace}.`
//                 console.warn(`Could not find type for entity set: ${ns}${entitySet.name}. `
//                     // TODO: standardise "to suppress this warning text"
//                     + "To supress this warning, set warningSettings.suppressUnableToFindTypeForEntitySet to false");
//             }

//             return undefined;
//         }

//         const resultType = fullyQualifiedTsType(entitySet.forType);
//         const queryableType = fullyQualifiedTsType(entitySet.forType, getQueryableName);
//         const casterType = fullyQualifiedTsType(entitySet.forType, getCasterName)
//         const idType = getKeyType(type);
//         const instanceType = `${keywords.EntityQuery}<${resultType}, ${idType || "any"}, ${queryableType}, ${casterType}>`;

//         const constructorArgs = [
//             `${keywords._httpClientArgs}`,
//             `${keywords.rootConfig}.types["${entitySet.forType.namespace || ""}"]["${entitySet.forType.name}"]`,
//             `${keywords.rootConfig}.entitySets["${entitySet.namespace || ""}"]["${entitySet.name}"]`,
//             keywords.rootConfig
//         ]

//         return `get ${entitySet.name}() {
// ${tab(`return new ${instanceType}(${constructorArgs.join(", ")});`)}
// }`
//     }

//     // TODO: if the key type is a collection, I think this function will fall over
//     function lookupType(t: ODataSingleTypeRef): ODataComplexType | undefined {
//         return (allTypes[t.namespace] && allTypes[t.namespace][t.name]) || undefined
//     }

//     function getKeyType(t: ODataComplexType, lookupParent = true): string | undefined {
//         if (!t.keyProp) {
//             if (t.baseType && lookupParent) {
//                 const baseType = lookupType({ isCollection: false, namespace: t.baseType.namespace, name: t.baseType.name })
//                 if (!baseType) {
//                     const ns = t.baseType.namespace && `${t.baseType.namespace}.`
//                     throw new Error(`Could not find base type: ${ns}${t.baseType.name}`);
//                 }

//                 return getKeyType(baseType)
//             }

//             return undefined;
//         }

//         const prop = t.properties[t.keyProp];
//         if (!prop) {
//             const ns = t.namespace ? `${t.namespace}.` : ""
//             throw new Error(`Could not find key property: ${t.keyProp} of type ${ns}${t.name}`)
//         }

//         return getKeyPropertyType(prop.type);
//     }

//     function getKeyPropertyType(prop: ODataTypeRef): string {
//         if (prop.isCollection) {
//             // TODO: test
//             return getKeyPropertyType(prop.collectionType) + "[]"
//         }

//         return fullyQualifiedTsType({
//             isCollection: false,
//             name: prop.name,
//             namespace: prop.namespace
//         });

//     }

//     // TODO: need to test code gen for entysets with no namespace. The syntax is slightly different
//     function methodsForEntitySetNamespace(entitySetNamespaceParts: string[], entitySets: ODataEntitySet[], first = true): string {

//         if (!entitySetNamespaceParts.length) {
//             return entitySets
//                 .map(methodForEntitySet)
//                 .filter(x => x)
//                 .join(first ? "\n\n" : ",\n\n");
//         }

//         const methods = tab(methodsForEntitySetNamespace(
//             entitySetNamespaceParts.slice(1),
//             entitySets,
//             false));

//         const cacheArgs = first
//             // TODO: weird error. If I remove the ";" from this.${keywords._httpClientArgs};, the last letter of
//             // _httpClientArgs also disappears
//             ? tab(`const ${keywords._httpClientArgs} = this.${keywords._httpClientArgs};`)
//             : ""

//         return `get ${entitySetNamespaceParts[0]}() {
// ${cacheArgs}
// ${tab(`return {
// ${methods}
// }`)}
// }`;
//     }

//     function entities() {
//         return Object
//             .keys(allTypes)
//             .map(namespace => ({ namespace, types: allTypes[namespace] }))
//             .map(namespace => {
//                 const types = Object
//                     .keys(namespace.types)
//                     .map(t => mapComplexType(namespace.types[t], allTypes))
//                     .join("\n\n");

//                 // TODO: test this case (type without module)
//                 if (!namespace.namespace) {
//                     return types;
//                 }

//                 // TODO: add module aliases to config
//                 return `export module ${sanitizeNamespace(namespace.namespace)} {
// ${tab(types)}
// }`;
//             })
//             .join("\n\n");
//     }

//     function configObj() {
//         return `// a config object which describes relationships between types
// const ${keywords.rootConfig}: ${keywords.ODataServiceConfig} = ${oDataServiceConfig}`
//     }

//     function linting() {
//         return `/* tslint:disable */
// /* eslint-disable */`
//     }

//     function imports() {
//         // TODO: audit are all of these still used?
//         return `import {
// ${tab(`QueryBuilder as ${keywords.QueryBuilder}, // TODO: not used anymore?`)}
// ${tab(`PrimitiveQueryBuilder as ${keywords.PrimitiveQueryBuilder}, // TODO: not used anymore?`)}
// ${tab(`ODataServiceConfig as ${keywords.ODataServiceConfig},`)}
// ${tab(`ODataMultiResult as ${keywords.ODataMultiResult},`)}
// ${tab(`CastSelection as ${keywords.CastSelection},`)}
// ${tab(`ODataUriParts as ${keywords.ODataUriParts},`)}
// ${tab(`QueryPrimitive as ${keywords.QueryPrimitive},`)}
// ${tab(`QueryArray as ${keywords.QueryArray},`)}
// ${tab(`EntityQuery as ${keywords.EntityQuery},`)}
// ${tab(`QueryComplexObject as ${keywords.QueryComplexObject} } from 'odata-query';`)}`
//     }

//     function edm() {
//         return `// type references for described Edm data types
// export module Edm {
// ${tab(mapSimpleType("String", "string"))}

// ${tab(mapSimpleType("Guid", "string"))}

// ${tab(mapSimpleType("Boolean", "boolean"))}

// ${tab(mapSimpleType("DateTime", "Date"))}

// ${tab(mapSimpleType("DateTimeOffset", "Date"))}

// ${tab(mapSimpleType("Int16", "Number"))}

// ${tab(mapSimpleType("Int32", "Number"))}

// ${tab(mapSimpleType("Int64", "Number"))}

// ${tab(mapSimpleType("Decimal", "Number"))}

// ${tab(mapSimpleType("Double", "Number"))}

// ${tab(mapSimpleType("Single", "Number"))}

//     /* TODO:
// <xs:enumeration value="Edm.Byte"/>
// <xs:enumeration value="Edm.Binary"/>
// <xs:enumeration value="Edm.Duration"/>
// <xs:enumeration value="Edm.TimeOfDay"/>
// <xs:enumeration value="Edm.GeographyPoint"/>
// <xs:enumeration value="Edm.GeographyLineString"/>
// <xs:enumeration value="Edm.GeographyPolygon"/>
// <xs:enumeration value="Edm.GeographyMultiPoint"/>
// <xs:enumeration value="Edm.GeographyMultiLineString"/>
// <xs:enumeration value="Edm.GeographyMultiPolygon"/>
// <xs:enumeration value="Edm.GeographyCollection"/>
// <xs:enumeration value="Edm.GeometryPoint"/>
// <xs:enumeration value="Edm.GeometryLineString"/>
// <xs:enumeration value="Edm.GeometryPolygon"/>
// <xs:enumeration value="Edm.GeometryMultiPoint"/>
// <xs:enumeration value="Edm.GeometryMultiLineString"/>
// <xs:enumeration value="Edm.GeometryMultiPolygon"/>
// <xs:enumeration value="Edm.GeometryCollection"/>
// <xs:enumeration value="Edm.SByte"/> */
// }`
//     }

//     function tab(input: string) {
//         const tabValue = [...Array(settings?.tabSize == null ? defaultTabs : settings.tabSize).keys()]
//             .map(_ => " ")
//             .join("");

//         return input
//             .split(/\r?\n/)
//             .map(x => tabValue + x)
//             .join("\n");
//     }

//     function getQueryableTypeString(type: ODataTypeRef, wrapInQueryObject: boolean): string {

//         const t = getQueryableType(type);
//         return wrapInQueryObject
//             ? `${t.wrapper}<${t.generics.join(", ")}>`
//             : t.generics[0];
//     }

//     function getTypeString(type: ODataTypeRef): string {

//         if (type.isCollection) {
//             return `${getTypeString(type.collectionType)}[]`;
//         }

//         return fullyQualifiedTsType(type);
//     }

//     function getQueryableType(type: ODataTypeRef) {
//         // TODO: namespacing of value from getTypeString?
//         // TODO: test for QueryArray<QueryArray<T>>
//         if (type.isCollection) {
//             // TODO: type signature gets very long. Remove namespaces where possible
//             return {
//                 wrapper: keywords.QueryArray,
//                 generics: [
//                     getQueryableTypeString(type.collectionType, true),
//                     getQueryableTypeString(type.collectionType, false)
//                 ]
//             };
//         }

//         if (type.namespace === "Edm") {
//             return {
//                 wrapper: keywords.QueryPrimitive,
//                 generics: [`Edm.${type.name}`]
//             };
//         }

//         if (!allTypes[type.namespace] || !allTypes[type.namespace][type.name]) {
//             const ns = type.namespace ? `${type.namespace}.` : "";
//             throw new Error(`Unknown type: ${ns}${type.name}`);
//         }

//         const t = fullyQualifiedTsType(type, getQueryableName);

//         return {
//             wrapper: keywords.QueryComplexObject,
//             generics: [t]
//         };
//     }

//     function getQueryBuilderName(forType: string) {
//         const qbTemplate = settings?.queryBuilderClassNameTemplate || "{0}QueryBuilder";
//         return qbTemplate.replace(/\{0\}/g, forType);
//     }

//     function getQueryableName(forType: string) {
//         const qTemplate = settings?.queryableTypeNameTemplate || "Queryable{0}";
//         return qTemplate.replace(/\{0\}/g, forType);
//     }

//     function getCasterName(forType: string) {
//         const qTemplate = settings?.casterTypeNameTemplate || "{0}Caster";
//         return qTemplate.replace(/\{0\}/g, forType);
//     }

//     function sanitizeNamespace(namespace: string) {
//         return namespace.replace(/[^a-zA-Z0-9$._]/, settings?.namespaceSpecialCharacter || ".");
//     }

//     function fullyQualifiedTsType(type: ODataTypeRef, transformTypeName: ((name: string) => string) | null = null): string {

//         if (type.isCollection) {
//             return `${fullyQualifiedTsType(type.collectionType, transformTypeName)}[]`
//         }

//         transformTypeName ??= id;
//         const ns = type.namespace ? `${sanitizeNamespace(type.namespace)}.` : "";
//         return `${ns}${transformTypeName(type.name)}`;
//     }

//     // TODO: duplicate_logic_key: caster
//     // TODO: this is a fairly heavy method to be called quite a bit. Optisation?
//     function getCasterProps(type: ODataComplexType, allTypes: ODataServiceTypes) {
//         const inherits = Object
//             .keys(allTypes)
//             .map(ns => Object
//                 .keys(allTypes[ns])
//                 .map(t => allTypes[ns][t]))
//             .reduce((s, x) => [...s, ...x], [])
//             .filter(x => x.baseType
//                 && x.baseType.namespace === type.namespace
//                 && x.baseType.name === type.name);

//         const distinctNames = Object.keys(inherits
//             .reduce((s, x) => ({ ...s, [x.name]: true }), {} as { [key: string]: boolean }))

//         const name = inherits.length === distinctNames.length
//             ? (x: ODataComplexType) => x.name
//             // TODO: test
//             // TODO: this logic will be duplicated in the code gen project. Possible to merge?
//             : (x: ODataComplexType) => `${x.namespace}.${x.name}`.replace(/[^\w]/g, "_")

//         return inherits
//             .map(t => {
//                 const typeRef: ODataSingleTypeRef = { namespace: t.namespace, name: t.name, isCollection: false };
//                 const generics = [
//                     fullyQualifiedTsType(typeRef),
//                     getKeyType(t) || "never",
//                     fullyQualifiedTsType(typeRef, getQueryableName),
//                     fullyQualifiedTsType(typeRef, getCasterName)
//                 ].join(", ");

//                 return `${name(t)}(): ${keywords.CastSelection}<${generics}>`
//             })
//     }

//     function digOutTypeRef(type: ODataTypeRef): ODataSingleTypeRef {
//         return !type.isCollection
//             ? type
//             : digOutTypeRef(type.collectionType)
//     }

//     function mapComplexType(type: ODataComplexType, allTypes: ODataServiceTypes) {

//         const allTypesInNamespace = allTypes[type.namespace] || {}

//         const queryableProps = Object
//             .keys(type.properties)
//             .map(key => ({ key, type: getQueryableTypeString(type.properties[key].type, true) }))
//             .map(prop => `${prop.key}: ${prop.type}`)
//             .join("\n");

//         const casterProps = getCasterProps(type, allTypes)

//         const q = settings?.makeAllPropsOptional === false ? "" : "?";
//         const props = Object
//             .keys(type.properties)
//             .map(key => ({ key, type: getTypeString(type.properties[key].type) }))
//             .map(prop => `${prop.key}${q}: ${prop.type}`)
//             .join("\n");

//         const qbName = getQueryBuilderName(type.name)
//         const qtName = getQueryableName(type.name)
//         const casterName = getCasterName(type.name)
//         if (allTypesInNamespace[qbName]) {
//             const clashingType = type.namespace ? `${type.namespace}.${qbName}` : qbName;
//             throw new Error(
//                 `Unable to create query builder component ${qbName} as it will clash with type name ${clashingType}.\n`
//                 + `Use the queryBuilderClassNameTemplate argument to modify the name of the query builder component.`);
//         }

//         const baseTypeNs = type.baseType?.namespace ? `${sanitizeNamespace(type.baseType?.namespace)}.` : ""
//         const baseType = type.baseType ? `${baseTypeNs}${type.baseType.name} & ` : "";
//         const baseQType = type.baseType ? `${baseTypeNs}${getQueryableName(type.baseType.name)} & ` : "";

//         return `export type ${type.name} = ${baseType}{
// ${tab(props)}
// }

// export type ${qtName} = ${baseQType}{
// ${tab(queryableProps)}
// }

// export type ${casterName} = {
// ${tab(casterProps.join("\n"))}
// }

// export class ${qbName} extends ${keywords.QueryBuilder}<${qtName}> {
// ${tab("constructor() {")}
// ${tab(tab(`super(${keywords.rootConfig}.types["${type.namespace || ""}"]["${type.name}"], ${keywords.rootConfig}.types)`))}
// ${tab("}")}
// }`;
//     }

//     function mapSimpleType(edmName: string, primitiveName: string) {
//         return `export type ${edmName} = ${primitiveName};
// export class ${getQueryBuilderName(edmName)} extends ${keywords.PrimitiveQueryBuilder}<${edmName}> { }`;
//     }
// }

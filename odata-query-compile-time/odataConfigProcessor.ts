
import { useNamespaces } from 'xpath'
import { ODataServiceTypes, ODataComplexType, ODataPropertyType, ODataTypeRef, ODataServiceConfig, ODataEntitySetNamespaces, ODataEntitySet } from 'odata-query-shared'
import { SupressWarnings } from './config.js';

const ns = {
    edmx: "http://docs.oasis-open.org/odata/ns/edmx",
    edm: "http://docs.oasis-open.org/odata/ns/edm"
};

function nsLookup(rootNode: Node, xpath: string) {
    return useNamespaces(ns)(xpath, rootNode)
}

export function processConfig(warningConfig: SupressWarnings, config: Document): ODataServiceConfig {

    checkVersion(warningConfig, config);

    return {
        types: processTypes(warningConfig, config),
        entitySets: processEntitySets(config)
    };
}

function processTypes(warningConfig: SupressWarnings, config: Document): ODataServiceTypes {

    return nsLookup(config, "edmx:Edmx/edmx:DataServices/edm:Schema/edm:EntityType")
        .concat(nsLookup(config, "edmx:Edmx/edmx:DataServices/edm:Schema/edm:ComplexType"))
        .map(x => mapEntityType(warningConfig, x as Node))
        .reduce(sortComplexTypesIntoNamespace, {});
}

function processEntitySets(config: Document): ODataEntitySetNamespaces {

    return nsLookup(config, "edmx:Edmx/edmx:DataServices/edm:Schema/edm:EntityContainer")
        .map(x => mapEntityContainer(x as Node))
        .reduce((s, x) => [...s, ...x], [])
        .reduce(sortEntitySetsIntoNamespace, {});
}

function mapEntityContainer(entityContainer: Node): ODataEntitySet[] {
    const namespaces = nsLookup(entityContainer, "@Name") as Attr[];
    if (namespaces.length > 1) {
        const names = namespaces.map(x => x.value).join(", ");
        console.warn(`Found more than one Name for EntityContianer: ${names}. Using first value.`);
    }

    const namespace = namespaces[0]?.value || "";
    return nsLookup(entityContainer, "edm:EntitySet")
        .map(node => mapEntitySet(namespace, node as Node));
}

function mapEntitySet(namespace: string, entitySet: Node): ODataEntitySet {
    const name = nsLookup(entitySet, "@Name") as Attr[];
    if (name.length > 1) {
        const names = name.map(x => x.value).join(", ");
        console.warn(`Found more than one Name for EntitySet: ${names}. Using first value.`);
    } else if (!name.length) {
        throw new Error(`Could not find name for entity set in collection ${namespace}`);
    }

    const type = nsLookup(entitySet, "@EntityType") as Attr[];
    if (type.length > 1) {
        const names = type.map(x => x.value).join(", ");
        console.warn(`Found more than one Name for EntityContianer: ${names}. Using first value.`);
    } else if (!type.length) {
        throw new Error(`Could not find type for entity set ${name[0].value} in collection ${namespace}`);
    }

    const lastDot = type[0].value.lastIndexOf(".");
    const forType: ODataTypeRef = lastDot === -1
        // TODO: can this be true???
        ? { isCollection: false, namespace: "", name: type[0].value }
        : { isCollection: false, namespace: type[0].value.substring(0, lastDot), name: type[0].value.substring(lastDot + 1) };

    return {
        namespace,
        name: name[0].value,
        forType
    };
}

const supressUnableToVerifyOdataVersionMessage = "To supress this warning, set warningSettings.suppressUnableToVerifyOdataVersion to false"
function checkVersion(warningConfig: SupressWarnings, config: Document) {
    if (warningConfig.suppressAll || warningConfig.suppressUnableToVerifyOdataVersion) {
        return;
    }

    try {
        const version = nsLookup(config, "edmx:Edmx");
        if (!version.length) {
            console.warn("Could not find element edmx:Edmx. Unable to check odata version. " + supressUnableToVerifyOdataVersionMessage)
        }

        for (let i = 0; i < version.length; i++) {
            const vs = nsLookup(version[i] as Node, "@Version");
            if (!vs.length) {
                console.warn("Could not find Version attribute of element edmx:Edmx. Unable to check odata version. " + supressUnableToVerifyOdataVersionMessage)
                return;
            }

            if (vs.length > 1) {
                console.warn("Multiple Version attributes found in element edmx:Edmx. Unable to check odata version. " + supressUnableToVerifyOdataVersionMessage)
            }

            const v = (vs[0] as Attr)?.value || "";
            if (!/^\s*4(\.|(\s*$))/.test(v)) {
                console.warn(`Unsupported odata version: ${v}. Only version 4 is suppoerted` + supressUnableToVerifyOdataVersionMessage)
            }
        }
    } catch {
        // TODO: verbosity
        console.warn("Error checking odata version. " + supressUnableToVerifyOdataVersionMessage)
    }
}

function sortComplexTypesIntoNamespace(root: ODataServiceTypes, type: ODataComplexType): ODataServiceTypes {
    const ns = root[type.namespace] || {};

    return {
        ...root,
        [type.namespace]: {
            ...ns,
            [type.name]: type
        }
    };
}

function sortEntitySetsIntoNamespace(root: ODataEntitySetNamespaces, type: ODataEntitySet): ODataEntitySetNamespaces {
    const ns = root[type.namespace] || {};

    return {
        ...root,
        [type.namespace]: {
            ...ns,
            [type.name]: type
        }
    };
}

function mapEntityType(warningConfig: SupressWarnings, node: Node): ODataComplexType {

    return {
        name: name(),
        keyProp: keyType(),
        baseType: baseType(),
        namespace: (nsLookup(node.parentNode!, "@Namespace")[0] as Attr)?.value || "",
        properties: nsLookup(node, "edm:Property")
            .map(prop => ({ navigationProp: false, prop: prop as Node }))
            .concat(nsLookup(node, "edm:NavigationProperty")
                .map(prop => ({ navigationProp: true, prop: prop as Node })))
            .map(x => mapProperty(x))
            .reduce((s, x) => ({ ...s, ...x }), {})
    };

    function keyType() {

        // TODO: is there another node other than PropertyRef
        return (nsLookup(node, "edm:Key/edm:PropertyRef/@Name")[0] as Attr)?.value || undefined
    }

    function baseType() {

        const baseType = nsLookup(node, "@BaseType") as Attr[];
        if (baseType.length > 1 && !warningConfig.suppressAll && !warningConfig.suppressMultiplBaseTypes) {
            console.warn(`Found multiple base types for ${name()}: ${baseType.map(x => x.value)}. Using first one found`);
        }

        if (!baseType.length) {
            return undefined;
        }

        const dot = baseType[0].value.lastIndexOf(".")
        return dot === -1
            ? { namespace: "", name: baseType[0].value }
            : { namespace: baseType[0].value.substring(0, dot), name: baseType[0].value.substring(dot + 1) };
    }

    function name() {
        const val = (nsLookup(node, "@Name")[0] as Attr)?.value;
        if (!val) {
            throw new Error("Found edm:EntityType with no @Name");
        }

        return val;
    }
}

function parseTypeStr(type: string | undefined): ODataPropertyType {
    const collectionType = /^Collection\((.+?)\)$/.exec(type || "");
    if (collectionType) {
        return {
            isCollection: true,
            collectionType: parseTypeStr(collectionType[1])
        };
    }

    // TODO: setting no type to string?
    type ??= "Edm.String";
    const nameI = type.lastIndexOf(".");
    const name = nameI === -1 ? type : type.substring(nameI + 1);
    const namespace = (nameI === -1 ? null : type.substring(0, nameI)) || "";

    return {
        name,
        namespace,
        isCollection: false
    }
}

function parseType(type: Attr | undefined) {
    return parseTypeStr(type?.value);
}

function mapProperty(x: { navigationProp: boolean, prop: Node }) {
    const name = nsLookup(x.prop, "@Name")[0] as Attr | undefined
    const type = nsLookup(x.prop, "@Type")[0] as Attr | undefined

    // TODO: ignore errors?
    if (!name) {
        throw new Error("Found edm:Property with no name");
    }

    // TODO: parse type correctly
    // TODO: setting default type to string

    return {
        [name.value]: {
            navigationProperty: x.navigationProp,
            type: parseType(type)
        }
    };
}
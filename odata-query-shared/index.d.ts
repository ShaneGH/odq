

export type ODataTypeName = {
    name: string,
    namespace: string
}

export type ODataComplexType = ODataTypeName & {
    // TODO: composite_keys (search whole proj for composite_keys)
    keyProp?: string | undefined
    baseType?: ODataTypeName
    properties: {
        [key: string]: {
            navigationProperty: boolean
            type: ODataPropertyType
        }
    }
}

export type ODataTypeRef = ODataTypeName & {
    isCollection: false
}

export type ODataCollectionType = {
    isCollection: true,
    collectionType: ODataPropertyType
}

export type ODataPropertyType = ODataCollectionType | ODataTypeRef

export type ODataServiceTypes = {
    [namespace: string]: {
        [typeName: string]: ODataComplexType
    }
}
export type ODataServiceConfig = {
    entitySets: ODataEntitySetNamespaces
    types: ODataServiceTypes
}

export type ODataEntitySet = {
    name: string,
    namespace: string,
    forType: ODataTypeRef
}

export type ODataEntitySetNamespaces = {
    [key: string]: ODataEntitySets
}

export type ODataEntitySets = {
    [key: string]: ODataEntitySet
}
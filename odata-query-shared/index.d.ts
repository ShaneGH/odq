

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
            type: ODataTypeRef
        }
    }
}

export type ODataSingleTypeRef = ODataTypeName & {
    isCollection: false
}

export type ODataCollectionTypeRef = {
    isCollection: true,
    collectionType: ODataTypeRef
}

export type ODataTypeRef = ODataCollectionTypeRef | ODataSingleTypeRef

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
    forType: ODataSingleTypeRef
}

export type ODataEntitySetNamespaces = {
    [key: string]: ODataEntitySets
}

export type ODataEntitySets = {
    [key: string]: ODataEntitySet
}
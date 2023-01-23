

export type ODataTypeName = {
    name: string,
    namespace: string
}

export type ODataComplexType = ODataTypeName & {
    keyProps?: string[] | undefined
    baseType?: ODataTypeName
    properties: {
        [key: string]: {
            nullable: boolean
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

export type TypeContainer<TCT extends string, T> = {
    containerType: TCT,
    type: T
}

export type ODataServiceTypes = {
    [namespace: string]: {
        [typeName: string]: TypeContainer<"ComplexType", ODataComplexType> | TypeContainer<"Enum", ODataEnum>
    }
}

export type ODataEnums = {
    [namespace: string]: {
        [enumName: string]: ODataEnum
    }
}

export type ODataEnum = ODataTypeName & {
    members: { [key: string]: number }
}

export type ODataServiceConfig = {
    entitySets: ODataEntitySetNamespaces
    types: ODataServiceTypes
    enums: ODataEnums
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
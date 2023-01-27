import { FileLocation, UriLocation, XmlString } from "./odataConfigLoader.js"

/**
 * Structure of a config file for code generation
 */
export type Config = {

    /**
     * Required
     * The location of the odata config file. This file is usually exposed from an endpoint: "/odata/$metadata"
     * Exactly one of the following properties must be entered
     */
    inputFileLocation: Partial<{
        fromFile: string,
        // TODO: bearer token???
        fromUri: string,
        fromString: string
    }>,

    /**
     * If set to true, will print the value of the odata $metadata used on screen
     */
    printODataConfig?: boolean,

    /**
     * Required
     * The name of the file to store the output in
     */
    outputFileLocation: string,

    /**
     * Settings for code generation
     */
    codeGenSettings?: CodeGenConfig,

    /**
     * Settings for code generation
     */
    warningSettings?: SupressWarnings
}

// TODO: double check that the "to supress this warning, set.... " messages are correct
/**
 * Structure of settings to supress warnings
 */
export type SupressWarnings = Partial<{
    /** 
     * @default false
     */
    suppressAll: boolean

    /** 
     * @default false
     */
    suppressUnableToVerifyOdataVersion: boolean

    /** 
     * @default false
     */
    suppressUnableToFindTypeForEntitySet: boolean

    /** 
     * @default false
     */
    suppressMultipleBaseTypes: boolean

    /** 
     * @default false
     */
    suppressTypeNameOverlap: boolean

    /** 
     * @default false
     */
    suppressEnumIssuesValue: boolean
}>

export enum TypeCaseSettings {
    /**
     * Use case rules from $metadata file
     */
    Follow$metadata = "Follow$metadata",

    /**
     * Convert property names to "PascalCase" (aka lower camel case)
     */
    PascalCase = "PascalCase",

    /**
     * Convert property names to "camelCase"
     */
    CamelCase = "CamelCase"
}

// TODO: settings from cmd
// TODO: test all
export type CodeGenConfig = Partial<{
    /** 
     * Specifies how to write the config json object. If true, will pretty print
     * @default false
     */
    prettyPrintJsonConfig: boolean,

    /** 
     * If true, the type definition json object will be exported as "rootConfigExporter". For debug purposes only
     * @default false
     */
    exportTypeDefinitionJsObject: boolean,

    /** 
     * Specifies how to name query builder classes. Use "{0}" to inject the name of the type
     * that this query builder is for
     * @default "{0}QueryBuilder"
     */
    // TODO: are query builders still classes? Have they been changed to functions?
    queryBuilderClassNameTemplate: string,

    /** 
     * Specifies how to name queryable types. Use "{0}" to inject the name of the type
     * that this queryable is for
     * @default "Queryable{0}"
     */
    queryableTypeNameTemplate: string,

    /** 
     * Specifies how to name caster types. Use "{0}" to inject the name of the type
     * that this caster is for
     * @default "{0}Caster"
     */
    casterTypeNameTemplate: string,

    /** 
     * Specifies how to name caster types. Use "{0}" to inject the name of the type
     * that this sub path is for
     * @default "{0}SubPath"
     */
    subPathTypeNameTemplate: string,

    /** 
     * If set, dictates how many spaces constitute a tab
     * @default 2
     */
    tabSize: number

    /** 
     * If set to true, will leave out properties of query objects where the type info cannot be found. 
     * Otherwise, throw an error
     * @default false
     */
    ignorePropertiesWithMissingTypeInfo: boolean

    /** 
     * A character to use instead of special characters when found in namespaces. 
     * Special characters are characters which will cause typesript build errors when part of a module name
     * @default "."
     */
    namespaceSpecialCharacter: string

    /** 
     * The name of the http client to export
     * @default "ODataClient"
     */
    oDataClientName: string

    /** 
     * If true, all properties in generated files with be postixed with "?"
     * @default false
     */
    makeAllPropsOptional: boolean

    /** 
     * Specifies whether enums should be represented by their name or their value
     * Specify the value "String" or "Number" to apply this rule to all enums
     * For more fine grained control, use an object with a default, and specify exceptions in the 
     * "stringEnums" or "numberEnums" properties
     * @default String
     */
    enumType:
    | "String"
    | "Number"
    | {
        default: "String" | "Number",
        stringEnums?: string[],
        numberEnums?: string[]
    }

    /** 
     * Specifies whether to change the names of properties or query properties
     * to upper or lower case, regardless of what is in the $metadata file
     * @default { serviceReturnTypes: "Follow$metadata", queryTypes: "Follow$metadata" }
     */
    propertyCasingRules: Partial<{
        serviceReturnTypes: TypeCaseSettings,
        queryTypes: TypeCaseSettings
    }>
}>
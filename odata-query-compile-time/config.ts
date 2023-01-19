import { FileLocation, UriLocation, XmlString } from "./odataConfigLoader.js"

/*
 * Structure of a config file for code generation
 */
export type Config = {

    /*
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

    /*
     * If set to true, will print the value of the odata $metadata used on screen
     */
    printODataConfig?: boolean,

    /*
     * Required
     * The name of the file to store the output in
     */
    outputFileLocation: string,

    /*
     * Settings for code generation
     */
    codeGenSettings?: CodeGenConfig,

    /*
     * Settings for code generation
     */
    warningSettings?: SupressWarnings
}

/*
 * Structure of settings to supress warnings
 */
export type SupressWarnings = Partial<{
    /* 
     * Default false
     */
    suppressAll: boolean

    /* 
     * Default false
     */
    suppressUnableToVerifyOdataVersion: boolean

    /* 
     * Default false
     */
    suppressUnableToFindTypeForEntitySet: boolean

    /* 
     * Default false
     */
    suppressMultiplBaseTypes: boolean
}>

// TODO: settings from cmd
// TODO: test all
export type CodeGenConfig = Partial<{
    /* 
     * Specifies how to write the config json object. If true, will pretty print
     * Default false
     */
    prettyPrintJsonConfig: boolean,

    /* 
     * Specifies how to name query builder classes. Use "{0}" to inject the name of the type
     * that this query builder is for
     * Default "{0}QueryBuilder"
     */
    // TODO: are query builders still classes? Have they been changed to functions?
    queryBuilderClassNameTemplate: string,

    /* 
     * Specifies how to name queryable types. Use "{0}" to inject the name of the type
     * that this queryable is for
     * Default "Queryable{0}"
     */
    queryableTypeNameTemplate: string,

    /* 
     * If set, dictates how many spaces constitute a tab
     * Default 2
     */
    tabSize: number

    /* 
     * If set to true, will leave out properties of query objects where the type info cannot be found. 
     * Otherwise, throw an error
     * Default false
     */
    ignorePropertiesWithMissingTypeInfo: boolean

    /* 
     * A character to use instead of special characters when found in namespaces. 
     * Special characters are characters which will cause typesript build errors when part of a module name
     * Default "."
     */
    namespaceSpecialCharacter: string

    /* 
     * The name of the http client to export
     * Default "ODataClient"
     */
    oDataClientName: string

    /* 
     * If true, all properties in generated files with be postixed with "?"
     * Default true
     */
    makeAllPropsOptional: boolean
}>
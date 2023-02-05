/**
 * Input args to components which build uris
 */
export type ODataUriParts = {
    /**
     * The URI specified in RequestTools
     */
    uriRoot: string,

    /**
     * The name of the container for the entity set being queried
     */
    entitySetContainerName: string | null;

    /**
     * The name of the entity set being queried
     */
    entitySetName: string;

    /**
     * The path generated by the odata-ts-client
     */
    relativePath: string,

    /**
     * The query params generated by the odata-ts-client
     */
    query: { [key: string]: string }
}

export type RootResponseInterceptor<TResult> = (input: TResult, uri: string, reqValues: RequestInit) => any

export type ResponseInterceptor<TResult> = (input: TResult, uri: string, reqValues: RequestInit, defaultInterceptor: RootResponseInterceptor<TResult>) => any

// TODO: document: Add article
// TODO: test all of these
/**
 * Input args to an ODataHttpClient
 */
export type RequestTools<TResult> = {
    /** 
     * A basic http client. Set this to a browser fetch, node18 fetch or a client from the the node-fetch npm module
     * You can also use this value to proxy requests
     */
    fetch(input: RequestInfo | URL, init?: RequestInit): TResult

    /** 
     * The root URI of all entity sets. Something like: https://my.service.com/my-odata",
     */
    uriRoot: string

    /** 
     * Interceptor for uri building
     * Optional
     */
    uriInterceptor?: (uri: ODataUriParts) => string

    /** 
     * Interceptor for http requests. Use this to add custom http headers
     */
    requestInterceptor?: (uri: string, reqValues: RequestInit) => RequestInit

    /** 
     * Interceptor for http responses. Use this to add custom error handling or deserialization
     */
    responseInterceptor?: ResponseInterceptor<TResult>
}
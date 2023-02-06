import { ODataServiceConfig } from "odata-ts-client-shared";
import { AngularHttpResultType, CodeGenConfig, SupressWarnings } from "../config.js";
import { httpClient } from "./httpClient.js";
import { Keywords } from "./keywords.js";
import { angularResultType, Tab } from "./utils.js";

// TODO: other angular response types
// (
//     Observable<HttpResponse<ArrayBuffer>>;
//     Observable<HttpResponse<Blob>>;
//     Observable<HttpResponse<string>>;
//     Observable<HttpResponse<Object>>;
//     Observable<HttpResponse<T>>;))
function parseBlob(keywords: Keywords, tab: Tab) {
    return ""
    return `function ${keywords.parseBlob}(blob: Blob): ${keywords.Observable}<string> {
${tab(`return new ${keywords.Observable}<string>(observer => {
${tab(`if (!blob) {
${tab(`observer.next("");
observer.complete();`)}
} else {
${tab(`const reader = new FileReader();
reader.onload = event => {
${tab(`if (!event.target?.result) {
${tab(`observer.next("");`)}
} else if (typeof event.target.result === "string") {
${tab(`observer.next(event.target.result);`)}
} else {
${tab(`throw new ${keywords.HttpError}("Error processing array buffer", event.target.result)`)}
}

observer.complete();`)}
};

reader.readAsText(blob);`)}
} `)}   
});`)}
}`
}

function parseResponse(keywords: Keywords, tab: Tab, config: CodeGenConfig | null) {
    return ""
    return `function ${keywords.parseResponse}(response: ${keywords.AngularHttpResponse}<${angularResultType(config)}>) {
${tab(`if (!response.ok) {
${tab(`throw new ${keywords.HttpError}("Error executing http request", response);`)}
}

if (!(response instanceof ${keywords.AngularHttpResponse})) {
${tab(`throw new ${keywords.HttpError}("Unexpected http resonse type. Expected HttpResonse", response);`)}
}

return ${keywords.parseBlob}(response.body)`)}
}`
}
/*

function parseResponse(response: HttpResponseBase) {
  if (!response.ok) {
    throw new HttpError("Error executing http request", response);
  }

  if (!(response instanceof HttpResponse)) {
    throw new HttpError("Unexpected http resonse type. Expected HttpResonse", response);
  }

  return parseBlob(response.body)
}

function parseBlob(blob: any): Observable<string> {
  return new Observable<string>((observer: any) => {
    if (!blob) {
      observer.next("");
      observer.complete();
    } else {
      let reader = new FileReader();
      reader.onload = event => {
        observer.next((event.target as any).result);
        observer.complete();
      };
      reader.readAsText(blob);
    }
  });
}


const responseParser: RootResponseInterceptor<Observable<HttpResponseBase>, Observable<any>> = response => response
  .pipe(mergeMap(parseResponse), map(x => JSON.parse(x))); */

function parseResponseFunctionBody(keywords: Keywords, resultType: AngularHttpResultType) {
    //return `return response.pipe(${keywords.mergeMap}(parseResponse), ${keywords.map}(x => JSON.parse(x)));`;
    if (resultType === AngularHttpResultType.String) {
        return `return response.pipe(${keywords.map}(x => x.body && JSON.parse(x.body)));`;
    }

    throw new Error("Invalid angular configuration");
}

export function angularHttpClient(
    serviceConfig: ODataServiceConfig,
    tab: Tab,
    keywords: Keywords,
    settings: CodeGenConfig | null,
    warnings: SupressWarnings | null | undefined) {

    const responseType = settings?.angularMode == null || settings.angularMode === false
        ? null
        : settings.angularMode === true
            ? AngularHttpResultType.String
            : settings.angularMode.httpResultType;

    if (responseType === null) {
        throw new Error("Invalid angular configuration");
    }

    const body = parseResponseFunctionBody(keywords, responseType)

    return [
        parseBlob(keywords, tab),
        parseResponse(keywords, tab, settings),
        httpClient(
            serviceConfig, tab, keywords,
            [`${keywords.Observable}<${keywords.AngularHttpResponse}<${angularResultType(settings)}>>`, `${keywords.Observable}<any>`],
            body, settings, warnings)
    ].join("\n\n")
}
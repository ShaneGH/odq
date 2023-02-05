import { ODataServiceConfig } from "odata-ts-client-shared";
import { CodeGenConfig, SupressWarnings } from "../config.js";
import { httpClient } from "./httpClient.js";
import { Keywords } from "./keywords.js";
import { Tab } from "./utils.js";

function blobToText(keywords: Keywords, tab: Tab) {
    return `function ${keywords.blobToText}(blob: Blob): ${keywords.Observable}<string> {
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

function parseResponse(keywords: Keywords, tab: Tab) {
    return `function ${keywords.parseResponse}(response: ${keywords.AngularHttpResponseBase}) {
${tab(`if (!response.ok) {
${tab(`throw new ${keywords.HttpError}("Error executing http request", response);`)}
}

if (!(response instanceof ${keywords.AngularHttpResponse})) {
${tab(`throw new ${keywords.HttpError}("Unexpected http resonse type. Expected HttpResonse", response);`)}
}

return ${keywords.blobToText}(response.body)`)}
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

  return blobToText(response.body)
}

function blobToText(blob: any): Observable<string> {
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

export function angularHttpClient(
    serviceConfig: ODataServiceConfig,
    tab: Tab,
    keywords: Keywords,
    settings: CodeGenConfig | null | undefined,
    warnings: SupressWarnings | null | undefined) {

    const parseResponseFunctionBody = `return response.pipe(${keywords.mergeMap}(parseResponse), ${keywords.map}(x => JSON.parse(x)));`

    return [
        blobToText(keywords, tab),
        parseResponse(keywords, tab),
        httpClient(serviceConfig, tab, keywords, [`${keywords.Observable}<${keywords.AngularHttpResponseBase}>`, `${keywords.Observable}<any>`], parseResponseFunctionBody, settings, warnings)
    ].join("\n\n")
}
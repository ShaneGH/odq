import { TestBed } from '@angular/core/testing';
import { ODataClient } from "../generatedCode-angular.js";
import { addUser } from "../utils/client.js";
import { catchError, tap } from "rxjs"
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { HttpClient } from "@angular/common/http";
// import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from "@angular/platform-browser-dynamic/testing";

// //TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
// TestBed.configureTestingModule({
//     imports: [HttpClientTestingModule]
// });

// const angularClient = TestBed.inject(HttpClient)

function toListRequestInterceptor(_: any, r: RequestInit): RequestInit {
    return {
        ...r,
        headers: {
            ...(r.headers || {}),
            ToList: "true"
        }
    }
}

function loggingFetcher(input: RequestInfo | URL, init?: RequestInit) {
    console.log(input, init)
    return fetch(input, init)
}

describe("Cast", function () {
    let httpMock: HttpTestingController;
    let client: ODataClient;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [],
        });

        httpMock = TestBed.inject(HttpTestingController);

        client = new ODataClient({
            fetch: (x, y) => {
                return TestBed.get(HttpClient).get(x.toString(), {
                    headers: y?.headers?.reduce((s, x) => ({
                        ...s,
                        [x[0]]: [...s[x[0] || [], x[1]]]
                    }), {} as { [k: string]: string[] }),
                    observe: "response",
                    responseType: "text"
                })
            },
            uriRoot: "http://localhost:5432/odata/test-entities",
            responseInterceptor: (result, uri, reqValues, defaultParser) => {
                return defaultParser(result, uri, reqValues)
                    .pipe(catchError(r => {
                        const err = {
                            uri,
                            code: r.status,
                            statusText: r.statusText,
                            headers: r.headers,
                            error: r,
                            reqValues
                        }

                        throw new Error(JSON.stringify(err, null, 2));
                    }))
            }
        });
    });

    afterEach(() => {
        httpMock.verify();
    });

    it("Should retrieve items of the correct type", async () => {
        const user = await addUser();
        const items = client.My.Odata.Container.HasIds
            .cast(x => x.User())
            .withQuery((u, { filter: { eq } }) => eq(u.Id, user.Id!))
            .get();

        return await new Promise((res, rej) => {
            const timeout = setTimeout(() => {
                rej(new Error("timeout"))
            }, 1000);

            items.pipe(tap(x => {
                clearTimeout(timeout)
                expect(x.value.length).toBe(1);
                res({});
            })).subscribe();
        })
    });
});
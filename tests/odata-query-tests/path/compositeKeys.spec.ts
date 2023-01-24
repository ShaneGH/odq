
import { ODataClient } from "../generatedCode.js";
import { addCompositeKeyItem } from "../utils/client.js";

const client = new ODataClient({
    fetch: (x, y) => {
        return fetch(x, y)
    },
    uriRoot: "http://localhost:5432/odata/test-entities",
    responseInterceptor: (result, uri, reqValues, defaultParser) => {
        return defaultParser(result)
            .catch(async _ => {

                const err = {
                    uri,
                    code: result.status,
                    statusText: result.statusText,
                    headers: result.headers,
                    error: await result.text(),
                    reqValues
                }

                throw new Error(JSON.stringify(err, null, 2));
            })
    }
}).My.Odata.Container;

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

type Recorder = { input: RequestInfo | URL, init?: RequestInit }
function recordingFetcher(recorder: Recorder[]) {
    return (input: RequestInfo | URL, init?: RequestInit) => {
        recorder.push({ input, init })
        return fetch(input, init)
    }
}

describe("Composite Keys", function () {

    it("Should retrieve items by key", async () => {
        const item = await addCompositeKeyItem();
        const result = await client.CompositeKeyItems
            .withKey({ Id1: item.Id1!, Id2: item.Id2! })
            .get();

        expect(result.Data).toBe(item.Data);
    });

    it("Should not retrieve items by invalid key", async () => {
        const item = await addCompositeKeyItem();
        const result = await client.CompositeKeyItems
            .withKey({ Id1: item.Id1! + "a", Id2: item.Id2! })
            .getAs<number>({ responseInterceptor: x => x.status });

        expect(result).toBe(404);
    });

    it("Should not retrieve items by swapped key", async () => {
        const item = await addCompositeKeyItem();
        const result = await client.CompositeKeyItems
            .withKey({ Id1: item.Id2!, Id2: item.Id1! })
            .getAs<number>({ responseInterceptor: x => x.status });

        expect(result).toBe(404);
    });

    it("Should thow error on missing key segment", async () => {
        const item = await addCompositeKeyItem();

        try {
            client.CompositeKeyItems
                .withKey({ Id1: item.Id1! } as any);

            expect(true).toBe(false);
        } catch {
            // GREAT SUCCESS!
        }
    });
});
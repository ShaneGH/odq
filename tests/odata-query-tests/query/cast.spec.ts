
import { My, ODataClient } from "../generatedCode.js";
import { FilterUtils as F, ExpandUtils as E } from "odata-query";
import { addUser } from "../utils/client.js";

const client = new ODataClient({
    fetch: (x, y) => {
        //console.log(x, y)
        return fetch(x, y)
    },
    uriRoot: "http://localhost:5432/odata/test-entities",
    responseParser: (result, uri, reqValues, defaultParser) => {
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
});

function toListRequestInterceptor(_: any, r: RequestInit): RequestInit {
    return {
        ...r,
        headers: {
            ...(r.headers || {}),
            ToList: "true"
        }
    }
}

describe("Cast", function () {

    it("Should retrieve items of the correct type", async () => {
        const user = await addUser();
        const items = await client.My.Odata.Container.HasIds
            .cast(x => x.User())
            .withQuery(q => q.filter(u => F.eq(u.Id, user.Id!)))
            .get();

        expect(items.value.length).toBe(1);
    });

    it("Should retrieve items of the correct type (with key)", async () => {

        const user = await addUser();
        const items = await client.My.Odata.Container.HasIds
            .withKey(user.Id!)
            .cast(i => i.User())
            .get();

        console.log(items)
        expect(items.value.length).toBe(1);
    });

    it("Should not retrieve items of the incorrect type", async () => {
        const user = await addUser();
        const items = await client.My.Odata.Container.HasIds
            .cast(x => x.Blog())
            .withQuery(q => q.filter(u => F.eq(u.Id, user.Id!)))
            .get();

        expect(items.value.length).toBe(0);
    });

    it("Should not retrieve items of the incorrect type (with key)", async () => {

        const user = await addUser();
        const items = await client.My.Odata.Container.HasIds
            .withKey(user.Id!)
            .cast(i => i.Blog())
            .get();

        expect(items.value.length).toBe(0);
    });

    it("Should retrieve correct values after cast", async () => {
        const user = await addUser();
        const items = await client.My.Odata.Container.HasIds
            .withKey(user.Id!)
            .cast(c => c.User())
            .get();

        expect(items.value.length).toBe(1);
        expect(items.value[0].Name).toBe(user.Name);
    });
});

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

    it("Should retrieve items of the correct type", executeSuccess);
    it("Should retrieve items of the correct type (with key)", executeWithKey.bind(null, "My.Odata.Entities.User", true));

    it("Should not retrieve items of the incorrect type", executeFailure);
    it("Should not retrieve items of the incorrect type (with key)", executeWithKey.bind(null, "My.Odata.Entities.Blog", false));

    it("Should retrieve correct values after cast", async () => {
        const user = await addUser();
        const items = await client.My.Odata.Container.HasIds
            .withKey(user.Id!)
            .cast<My.Odata.Entities.User, My.Odata.Entities.QueryableUser>("My.Odata.Entities.User")
            .get();

        expect(items.value.length).toBe(1);
        expect(items.value[0].Name).toBe(user.Name);
    });

    async function executeWithKey(typeName: string, result: boolean) {
        const user = await addUser();
        const items = await client.My.Odata.Container.HasIds
            .withKey(user.Id!)
            .cast<any, any>(typeName)
            .get();

        expect(items.value.length).toBe(result ? 1 : 0);
    }

    async function executeSuccess() {
        const user = await addUser();
        const items = await client.My.Odata.Container.HasIds
            .cast<My.Odata.Entities.User, My.Odata.Entities.QueryableUser>("My.Odata.Entities.User")
            .withQuery(q => q.filter(u => F.eq(u.Id, user.Id!)))
            .get();

        expect(items.value.length).toBe(1);
    }

    async function executeFailure() {
        const user = await addUser();
        const items = await client.My.Odata.Container.HasIds
            .cast<My.Odata.Entities.Blog, My.Odata.Entities.QueryableBlog>("My.Odata.Entities.Blog")
            .withQuery(q => q.filter(u => F.eq(u.Id, user.Id!)))
            .get();

        expect(items.value.length).toBe(0);
    }

    it("Should retrieve correct values after cast", async () => {
        const user = await addUser();
        const items = await client.My.Odata.Container.HasIds
            .withKey(user.Id!)
            .cast<My.Odata.Entities.User, My.Odata.Entities.QueryableUser>("My.Odata.Entities.User")
            .get();

        expect(items.value.length).toBe(1);
        expect(items.value[0].Name).toBe(user.Name);
    });
});
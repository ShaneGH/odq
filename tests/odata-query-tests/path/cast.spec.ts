
import { ODataClient } from "../generatedCode.js";
import { FilterUtils as F, ExpandUtils as E } from "odata-ts-client";
import { addFullUserChain, addUser } from "../utils/client.js";

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

function loggingFetcher(input: RequestInfo | URL, init?: RequestInit) {
    console.log(input, init)
    return fetch(input, init)
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

        expect(items.Name).toBe(user.Name);
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

        let err: Error | null = null;
        try {
            await client.My.Odata.Container.HasIds
                .withKey(user.Id!)
                .cast(i => i.Blog())
                .get()
        } catch (e: any) {
            err = e;
        }

        expect(err).toBeTruthy()
        expect(JSON.parse(err?.message || "{}").code).toBe(404)
    });

    it("Should retrieve correct values after cast", async () => {
        const user = await addUser();
        const items = await client.My.Odata.Container.HasIds
            .withKey(user.Id!)
            .cast(c => c.User())
            .get();

        expect(items.Name).toBe(user.Name);
    });

    describe("Path Cast Combos", () => {
        it("Is in the casting spec", () => {
            expect(true).toBeTruthy();
        });
    });
});

describe("Path Cast Combos", () => {

    // TODO: path -> cast
    it("Should retrieve correct values after cast and path (multi)", async () => {
        const ctxt = await addFullUserChain();
        const comments = await client.My.Odata.Container.HasIds
            .withKey(ctxt.commentUser.Id!)
            .cast(c => c.User())
            .subPath(u => u.BlogPostComments)
            .get();

        expect(comments.value.length).toBe(1);
        expect(comments.value[0].Text).toBe(ctxt.comment.Text);
    });

    it("Should retrieve correct values after cast and path (single)", async () => {
        const ctxt = await addFullUserChain();
        const user = await client.My.Odata.Container.HasIds
            .withKey(ctxt.blog.Id!)
            .cast(c => c.Blog())
            .subPath(u => u.User)
            .get();

        expect(user.Name).toBe(ctxt.blogUser.Name);
    });
});

import { addFullUserChain } from "../utils/client.js";
import { My, ODataClient, rootConfigExporter } from "../generatedCode.js";
import { FilterUtils as F, QueryBuilder, QueryComplexObject, queryUtils } from "odata-ts-client";
import { uniqueString } from "../utils/utils.js";
import { buildComplexTypeRef } from "odata-ts-client/dist/src/typeRefBuilder.js";
import { NonNumericTypes } from "odata-ts-client/dist/src/filterUtils.js";

const rootConfig = rootConfigExporter();

function loggingFetcher(input: RequestInfo | URL, init?: RequestInit) {
    console.log(input, init)
    return fetch(input, init)
}

const client = new ODataClient({
    fetch,
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

describe("Query.Expand", function () {

    afterAll(() => {
        const operations = Object.keys(queryUtils().expand);
        const missing = operations
            .filter(o => !testCases.filter(tc => tc === o).length);

        expect(missing).toEqual([]);
    });

    const testCases: string[] = [];
    function testCase(name: string, test: () => void) {

        testCases.push(name)
        return describe(name, test)
    }

    testCase("expandRaw", function () {
        it("Should work correctly with single entity", async () => {

            const ctxt = await addFullUserChain();
            const result = await client.BlogPosts
                .withKey(ctxt.blogPost.Id)
                .withQuery((q, { expand: { expandRaw } }) => q
                    .expand(p => expandRaw("Blog")))
                .get();

            expect(result.Blog!.Name).toBe(ctxt.blog.Name);
        });
    });

    testCase("expand", function () {
        it("Should work correctly with single entity", async () => {

            const ctxt = await addFullUserChain();
            const result = await client.BlogPosts
                .withKey(ctxt.blogPost.Id)
                .withQuery((q, { expand: { expand } }) => q
                    .expand(p => expand(p.Blog)))
                .get();

            expect(result.Blog!.Name).toBe(ctxt.blog.Name);
        });

        it("Should work correctly with multiple single entities", async () => {

            const ctxt = await addFullUserChain();
            const result = await client.BlogPosts
                .withKey(ctxt.blogPost.Id)
                .withQuery((q, { expand: { expand } }) => q
                    .expand(p => expand(p.Blog.User)))
                .get();

            expect(result.Blog!.Name).toBe(ctxt.blog.Name);
            expect(result.Blog!.User!.Name).toBe(ctxt.blogUser.Name);
        });

        it("Should work correctly with entity collection", async () => {

            const ctxt = await addFullUserChain();
            const result = await client.BlogPosts
                .withKey(ctxt.blogPost.Id)
                .withQuery((q, { expand: { expand } }) => q
                    .expand(p => expand(p.Comments)))
                .get();

            expect(result.Comments![0].Title).toBe(ctxt.comment.Title);
        });
    });

    testCase("expandAndTODO", () => {

        it("Should work correctly with multiple entity collections", async () => {

            const ctxt = await addFullUserChain();
            const result = await client.Users
                .withKey(ctxt.blogUser.Id)
                .withQuery((q, { expand: { expandAndTODO, expand } }) => q
                    .expand(p => expandAndTODO(p.Blogs, b => expand(b.Posts))))
                .get();

            expect(result.Blogs![0].Name).toBe(ctxt.blog.Name);
            expect(result.Blogs![0].Posts![0].Name).toBe(ctxt.blogPost.Name);
        });
    });

    testCase("combine", function () {
        it("Should work correctly", async () => {

            const ctxt = await addFullUserChain();
            const result = await client.BlogPosts
                .withKey(ctxt.blogPost.Id)
                .withQuery((q, { expand: { expand, combine } }) => q
                    .expand(p => combine(
                        expand(p.Blog),
                        expand(p.Comments))))
                .get();

            expect(result.Blog!.Name).toBe(ctxt.blog.Name);
            expect(result.Comments![0].Title).toBe(ctxt.comment.Title);
        });
    });
});



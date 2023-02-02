
import { addFullUserChain } from "../utils/client.js";
import { ODataClient, rootConfigExporter } from "../generatedCode.js";
import { queryUtils } from "odata-ts-client";

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

        describe("multiple single entities", () => {

            it("Should work correctly (1)", execute.bind(null, true));
            it("Should work correctly (2)", execute.bind(null, false));

            async function execute(twoCalls: boolean) {

                const ctxt = await addFullUserChain();
                const result = await client.BlogPosts
                    .withKey(ctxt.blogPost.Id)
                    .withQuery((q, { expand: { expand } }) => {
                        return twoCalls
                            ? q.expand(p => expand(p.Blog, b => expand(b.User)))
                            : q.expand(p => expand(p.Blog.User));
                    })
                    .get();

                expect(result.Blog!.Name).toBe(ctxt.blog.Name);
                expect(result.Blog!.User!.Name).toBe(ctxt.blogUser.Name);
            }
        });

        it("Should work correctly with entity collection", async () => {

            const ctxt = await addFullUserChain();
            const result = await client.BlogPosts
                .withKey(ctxt.blogPost.Id)
                .withQuery((q, { expand: { expand } }) => q
                    .expand(p => expand(p.Comments, _ => "$count")))
                .get();

            expect((result as any)["Comments@odata.count"]).toBe(1);
            expect(result.Comments![0].Title).toBe(ctxt.comment.Title);
        });

        it("Should work correctly with multiple entity collections", async () => {

            const ctxt = await addFullUserChain();
            const result = await client.Users
                .withKey(ctxt.blogUser.Id)
                .withQuery((q, { expand: { expand } }) => q
                    .expand(p => expand(p.Blogs, b => expand(b.Posts))))
                .get();

            expect(result.Blogs![0].Name).toBe(ctxt.blog.Name);
            expect(result.Blogs![0].Posts![0].Name).toBe(ctxt.blogPost.Name);
        });

        it("Should work correctly with single entity + expand", () => {
            // see: multiple single entities
        });

        it("Should work correctly with single entity + select", async () => {

            const ctxt = await addFullUserChain();
            const result = await client.BlogPosts
                .withKey(ctxt.blogPost.Id)
                .withQuery((q, { expand: { expand }, select: { select } }) => q
                    .expand(p => expand(p.Blog, b => select(b.Name))))
                .get();

            expect(result.Blog!.Name).toBe(ctxt.blog.Name);
            expect(result.Blog!.Id).toBeUndefined();
        });

        it("Should work correctly with multiple entities + select twice", async () => {

            const ctxt = await addFullUserChain();
            const result = await client.BlogPosts
                .withKey(ctxt.blogPost.Id)
                .withQuery((q, { expand: { expand }, select: { select } }) => q
                    .expand(p => expand(p.Comments, b => select(b.Title), _ => "$count")))
                .get();

            expect((result as any)["Comments@odata.count"]).toBe(1);
            expect(result.Comments![0].Title).toBe(ctxt.comment.Title);
            expect(result.Comments![0].Id).toBeUndefined();
        });

        describe("Single entity + filter", () => {
            // not sure this is possible

            // it("Should return something", execute.bind(null, true));
            // it("Should return nothing", execute.bind(null, false));

            // async function execute(returnSomething: boolean) {

            //     const ctxt = await addFullUserChain();
            //     const result = await client.BlogPosts
            //         .withKey(ctxt.blogPost.Id)
            //         .withQuery((q, { expand: { expand }, filter: { eq, ne } }) => q
            //             .expand(p => expand(p.Blog, c => returnSomething
            //                 ? eq(c.Name, ctxt.blog.Name)
            //                 : ne(c.Name, ctxt.blog.Name))))
            //         .get({ fetch: loggingFetcher });

            //     if (returnSomething) {
            //         expect(result.Blog!.Id).toBe(ctxt.blog.Id);
            //     } else {
            //         expect(result.Blog).toBeUndefined();
            //     }
            // }
        });

        it("Should work correctly with multiple entity + select", async () => {

            const ctxt = await addFullUserChain();
            const result = await client.BlogPosts
                .withKey(ctxt.blogPost.Id)
                .withQuery((q, { expand: { expand }, select: { select } }) => q
                    .expand(p => expand(p.Comments, b => select(b.Title))))
                .get();

            expect(result.Comments![0].Title).toBe(ctxt.comment.Title);
            expect(result.Comments![0].Id).toBeUndefined();
        });

        it("Should work correctly with multiple entity + orderBy", async () => {

            const ctxt = await addFullUserChain();
            const result = await client.BlogPosts
                .withKey(ctxt.blogPost.Id)
                .withQuery((q, { expand: { expand }, orderBy: { orderBy } }) => q
                    .expand(p => expand(p.Comments, b => orderBy(b.Title))))
                .get();

            expect(result.Comments![0].Title).toBe(ctxt.comment.Title);
        });

        it("Should work correctly with multiple entity + expand", async () => {

            // see: Should work correctly with multiple entity collections
        });

        describe("Multiple entities + filter", () => {
            it("Should return something", execute.bind(null, true));
            it("Should return nothing", execute.bind(null, false));

            async function execute(returnSomething: boolean) {

                const ctxt = await addFullUserChain();
                const result = await client.BlogPosts
                    .withKey(ctxt.blogPost.Id)
                    .withQuery((q, { expand: { expand }, filter: { eq, ne } }) => q
                        .expand(p => expand(p.Comments, c => returnSomething
                            ? eq(c.Title, ctxt.comment.Title)
                            : ne(c.Title, ctxt.comment.Title))))
                    .get();

                if (returnSomething) {
                    expect(result.Comments![0].Title).toBe(ctxt.comment.Title);
                } else {
                    expect(result.Comments?.length).toBe(0);
                }
            }
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




import { My, ODataClient } from "../generatedCode.js";
import { FilterUtils as F, ExpandUtils as E } from "odata-query";
import { addFullUserChain, addUser } from "../utils/client.js";
import { uniqueString } from "../utils/utils.js";
import { WithKeyType } from "odata-query/dist/src/httpClient.js";

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

type Recorder = { input: RequestInfo | URL, init?: RequestInit }
function recordingFetcher(recorder: Recorder[]) {
    return (input: RequestInfo | URL, init?: RequestInit) => {
        recorder.push({ input, init })
        return fetch(input, init)
    }
}

describe("SubPath", function () {

    describe("Singleton", () => {

        it("Should retrieve items in the path, 1 level", async () => {
            const user = await addFullUserChain();
            const blog = await client.My.Odata.Container.BlogPosts
                .withKey(user.blogPost.Id!)
                .subPath(x => x.Blog)
                .get();

            expect(blog.Name).toBe(user.blog.Name);
        });

        it("Should retrieve items in the path, 2 levels", async () => {
            const context = await addFullUserChain();
            const user = await client.My.Odata.Container.BlogPosts
                .withKey(context.blogPost.Id!)
                .subPath(x => x.Blog)
                .subPath(x => x.User)
                .get();

            expect(user.Name).toBe(context.blogUser.Name);
        });
    });

    describe("Collection", () => {

        it("Should retrieve items in the path, 1 level", async () => {
            const user = await addFullUserChain();
            const comments = await client.My.Odata.Container.BlogPosts
                .withKey(user.blogPost.Id!)
                .subPath(x => x.Comments)
                .get();

            expect(comments.value.length).toBe(1);
            expect(comments.value[0].Text).toBe(user.comment.Text);
        });

        it("Should retrieve items in the path, 2 levels", async () => {
            const context = await addFullUserChain({ addFullChainToCommentUser: {} });
            const comments = await client.My.Odata.Container.Blogs
                .withKey(context.commentUserChain!.blog.Id!)
                .subPath(x => x.User)
                .subPath(x => x.BlogPostComments)
                .get();

            expect(comments.value.length).toBe(1);
            expect(comments.value[0].Text).toBe(context.comment.Text);
        });

        it("Should retrieve items in the path, 3 levels", async () => {
            const context = await addFullUserChain({ addFullChainToCommentUser: {} });
            const comments = await client.My.Odata.Container.BlogPosts
                .withKey(context.commentUserChain!.blogPost.Id!)
                .subPath(x => x.Blog)
                .subPath(x => x.User)
                .subPath(x => x.BlogPostComments)
                .get();

            expect(comments.value.length).toBe(1);
            expect(comments.value[0].Text).toBe(context.comment.Text);
        });
    });

    describe("Path Cast Combos", () => {
        it("Is in the casting spec", () => {
            expect(true).toBeTruthy();
        });
    });

    describe("Collection, key combos", () => {

        describe("Collection, Key, Collection, Key", () => {
            it("Should work correctly with function key type", execute.bind(null, WithKeyType.FunctionCall));
            it("Should work correctly with path key type", execute.bind(null, WithKeyType.PathSegment));

            async function execute(keyType: WithKeyType) {

                const records: Recorder[] = []
                const user = await addFullUserChain();
                const comment = await client.My.Odata.Container.BlogPosts
                    .withKey(user.blogPost.Id!, keyType)
                    .subPath(x => x.Comments)
                    .withKey(user.comment.Id!, keyType)
                    .get({ fetch: recordingFetcher(records) });

                expect(comment.Text).toBe(user.comment.Text);
                expect(records.length).toBe(1);

                if (keyType === WithKeyType.FunctionCall) {
                    expect(records[0].input).toContain("(");
                } else {
                    expect((records[0].input.toString()).indexOf("(")).toBe(-1);
                }
            }
        });

        describe("Collection, Key, Collection, Key, Singleton", () => {
            it("Should work correctly", async () => {

                const user = await addFullUserChain();
                const comment = await client.My.Odata.Container.BlogPosts
                    .withKey(user.blogPost.Id!)
                    .subPath(x => x.Comments)
                    .withKey(user.comment.Id!)
                    .subPath(x => x.User)
                    .get();

                expect(comment.Name).toBe(user.commentUser.Name);
            });
        });
    });

    describe("Path to complex type", () => {
        it("Should work correctly", async () => {

            const tag = { Tag: uniqueString() }
            const user = await addFullUserChain({ commentTags: [tag] });
            const comment = await client.My.Odata.Container.Comments
                .withKey(user.comment.Id!)
                .subPath(x => x.Tags)
                .get();

            expect(comment.value.length).toBe(1);
            expect(comment.value[0].Tag).toBe(tag.Tag);
        });

        it("Should work correctly (with tag filter)", execute.bind(null, true));
        it("Should work correctly (with invalid tag filter)", execute.bind(null, false));

        async function execute(success: boolean) {

            const tag = { Tag: uniqueString() }
            const user = await addFullUserChain({ commentTags: [tag] });
            const comment = await client.My.Odata.Container.Comments
                .withKey(user.comment.Id!)
                .subPath(x => x.Tags)
                .withQuery(q => q.filter(t => F.eq(t.Tag, success ? tag.Tag : "invalid")))
                .get();

            if (success) {
                expect(comment.value.length).toBe(1);
                expect(comment.value[0].Tag).toBe(tag.Tag);
            } else {
                expect(comment.value.length).toBe(0);
            }
        };
    });
});
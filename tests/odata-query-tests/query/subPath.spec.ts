
import { My, ODataClient } from "../generatedCode.js";
import { FilterUtils as F, ExpandUtils as E } from "odata-query";
import { addFullUserChain, addUser } from "../utils/client.js";

const client = new ODataClient({
    fetch: (x, y) => {
        //console.log(x, y)
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

    describe("Collection, key combos", () => {

        describe("Collection, Key, Collection, Key", () => {
            it("Should work correctly", async () => {

                const user = await addFullUserChain();
                const comment = await client.My.Odata.Container.BlogPosts
                    .withKey(user.blogPost.Id!)
                    .subPath(x => x.Comments)
                    .withKey(user.comment.Id!)
                    .get();

                expect(comment.Text).toBe(user.comment.Text);
            });
        });

        // it("Should retrieve items in the path, 2 levels", async () => {
        //     const context = await addFullUserChain({ addFullChainToCommentUser: {} });
        //     const comments = await client.My.Odata.Container.Blogs
        //         .withKey(context.commentUserChain!.blog.Id!)
        //         .subPath(x => x.User)
        //         .subPath(x => x.BlogPostComments)
        //         .get();

        //     expect(comments.value.length).toBe(1);
        //     expect(comments.value[0].Text).toBe(context.comment.Text);
        // });

        // it("Should retrieve items in the path, 3 levels", async () => {
        //     const context = await addFullUserChain({ addFullChainToCommentUser: {} });
        //     const comments = await client.My.Odata.Container.BlogPosts
        //         .withKey(context.commentUserChain!.blogPost.Id!)
        //         .subPath(x => x.Blog)
        //         .subPath(x => x.User)
        //         .subPath(x => x.BlogPostComments)
        //         .get();

        //     expect(comments.value.length).toBe(1);
        //     expect(comments.value[0].Text).toBe(context.comment.Text);
        // });
    });
});

import { addFullUserChain, Blog, BlogComment, BlogPost, CommentTag, postBlog, postBlogPost, postComment, postUser, User } from "../utils/client.js";
import { My, ODataClient } from "../generatedCode.js";
import { FilterUtils as F, ExpandUtils as E } from "odata-query";
import { uniqueString } from "../utils/utils.js";
import { describeEntityRelationship as testCase, verifyEntityRelationships } from "../correctness/entityRelationships.js";

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

describe("Query.Filter", function () {

    afterAll(verifyEntityRelationships);

    // // BlogName -> BlogName
    // testCase("Simple -> Simple", function () {

    //     it("Should filter (success)", execute.bind(null, true));
    //     it("Should filter (failure)", execute.bind(null, false))

    //     async function execute(success: boolean) {

    //         const user = await addFullUserChain();
    //         const blogName = success
    //             ? user.blog.Name
    //             : "Not a valid name";

    //         const result = await getUserBlogPostNames(
    //             user.blogUser.Id!,
    //             q => q.filter(n => F.eq(n, blogName)));

    //         if (success) {
    //             expect(result.length).toBe(1);
    //             expect(result[0]).toBe(user.blog.Name);
    //         } else {
    //             expect(result.length).toBe(0);
    //         }
    //     }
    // });

    // BlogPost, Blog, Name
    testCase("Complex -> Complex -> Simple", function () {

        it("Should filter (success)", execute.bind(null, true));
        it("Should filter (failure)", execute.bind(null, false))

        async function execute(success: boolean) {

            const user = await addFullUserChain();
            const blogName = success
                ? user.blog.Name
                : "Not a valid name";

            const result = await client.My.Odata.Container.BlogPosts.withQuery(q => q
                .filter(bp => F.and(
                    F.eq(bp.Id, user.blogPost.Id),
                    F.eq(bp.Blog.Name, blogName))))
                .get();

            if (success) {
                expect(result.value.length).toBe(1);
                expect(result.value[0].Name).toBe(user.blogPost.Name);
            } else {
                expect(result.value.length).toBe(0);
            }
        }
    });

    // User, Blogs, Blog, Name
    testCase("Complex -> Array<Complex> -> Complex -> Simple", function () {

        it("Should filter (success)", execute.bind(null, true));
        it("Should filter (failure)", execute.bind(null, false))

        async function execute(success: boolean) {

            const user = await addFullUserChain();
            const userBlogName = success
                ? user.blog.Name
                : "Not a valid name";

            const result = await client.My.Odata.Container.Users.withQuery(q => q
                .filter(u => F.and(
                    F.eq(u.Id, user.blogUser.Id),
                    F.any(u.Blogs, b1 => F.eq(b1.Name, userBlogName)))))
                .get();

            if (success) {
                expect(result.value.length).toBe(1);
                expect(result.value[0].Name).toBe(user.blogUser.Name);
            } else {
                expect(result.value.length).toBe(0);
            }
        }
    });

    // User, Name
    testCase("Complex -> Simple", function () {

        it("Should filter (success)", execute.bind(null, true));
        it("Should filter (failure)", execute.bind(null, false))

        async function execute(success: boolean) {

            const user = await addFullUserChain();
            const userName = success
                ? user.blogUser.Name
                : "Not a valid name";

            const result = await client.My.Odata.Container.Users.withQuery(q => q
                .filter(u => F.and(
                    F.eq(u.Id, user.blogUser.Id),
                    F.eq(u.Name, userName))))
                .get();

            if (success) {
                expect(result.value.length).toBe(1);
                expect(result.value[0].Name).toBe(user.blogUser.Name);
            } else {
                expect(result.value.length).toBe(0);
            }
        }
    });

    // User -> Blogs -> Count
    testCase("Complex -> Array<Complex> -> Count", function () {

        it("Should filter (success)", execute.bind(null, true));
        it("Should filter (failure)", execute.bind(null, false))

        async function execute(success: boolean) {

            const user = await addFullUserChain();
            const expectedCount = success ? 1 : 111;

            const result = await client.My.Odata.Container.Users
                .withQuery(q => q
                    .filter(u => F.and(
                        F.eq(u.Id, user.blogUser.Id),
                        F.eq(F.count(u.Blogs), expectedCount))))
                .get();

            if (success) {
                expect(result.value.length).toBe(1);
                expect(result.value[0].Name).toBe(user.blogUser.Name);
            } else {
                expect(result.value.length).toBe(0);
            }
        }
    });

    // User -> Blogs -> Blog -> BlogPosts -> BlogPost -> Name
    testCase("Complex -> Array<Complex> -> Complex -> Array<Complex> -> Complex -> Simple", function () {

        it("Should filter (success)", execute.bind(null, true));
        it("Should filter (failure)", execute.bind(null, false))

        async function execute(success: boolean) {

            const user = await addFullUserChain();
            const postName = success
                ? user.blogPost.Name
                : "Not a valid name";

            const result = await client.My.Odata.Container.Users.withQuery(q => q
                .filter(u => F.and(
                    F.eq(u.Id, user.blogUser.Id),
                    F.any(u.Blogs, b => F.any(b.Posts, bp => F.eq(bp.Name, postName))))))
                .get();

            if (success) {
                expect(result.value.length).toBe(1);
                expect(result.value[0].Name).toBe(user.blogUser.Name);
            } else {
                expect(result.value.length).toBe(0);
            }
        }
    });

    // BlogPost -> Comments -> Comment -> User -> Name
    testCase("Complex -> Array<Complex> -> Complex -> Complex -> Simple", function () {

        it("Should filter (success)", execute.bind(null, true));
        it("Should filter (failure)", execute.bind(null, false))

        async function execute(success: boolean) {

            const user = await addFullUserChain();
            const userName = success
                ? user.commentUser.Name
                : "Not a valid name";

            const result = await client.My.Odata.Container.BlogPosts.withQuery(q => q
                .filter(bp => F.and(
                    F.eq(bp.Id, user.blogPost.Id),
                    F.any(bp.Comments, c => F.eq(c.User.Name, userName)))))
                .get();

            if (success) {
                expect(result.value.length).toBe(1);
                expect(result.value[0].Name).toBe(user.blogPost.Name);
            } else {
                expect(result.value.length).toBe(0);
            }
        }
    });

    // Blog -> User -> Comments -> Comment -> BlogPost -> Name
    testCase("Complex -> Complex -> Array<Complex> -> Complex -> Complex -> Simple", function () {

        it("Should filter (success)", execute.bind(null, true));
        it("Should filter (failure)", execute.bind(null, false))

        async function execute(success: boolean) {

            const user = await addFullUserChain({ addFullChainToCommentUser: {} });
            const blogPostName = success
                ? user.blogPost.Name
                : "Not a valid name";

            // blogs where the owner user has commented on a blog with a post name "blogPostName"
            const result = await client.My.Odata.Container.Blogs
                .withQuery(q => q
                    .filter(b => F.and(
                        F.eq(b.Id, user.commentUserChain!.blog.Id),
                        F.any(b.User.BlogPostComments, c => F.eq(c.BlogPost.Name, blogPostName)))))
                .get();

            if (success) {
                expect(result.value.length).toBe(1);
                expect(result.value[0].Name).toBe(user.commentUserChain!.blog.Name);
            } else {
                expect(result.value.length).toBe(0);
            }
        }
    });

    // Comment -> User -> Blogs -> Blog -> Name
    testCase("Complex -> Complex -> Array<Complex> -> Complex -> Simple", function () {

        it("Should filter (success)", execute.bind(null, true));
        it("Should filter (failure)", execute.bind(null, false))

        async function execute(success: boolean) {

            const user = await addFullUserChain({ addFullChainToCommentUser: {} });
            const blogName = success
                ? user.commentUserChain!.blog.Name
                : "Not a valid name";

            const result = await client.My.Odata.Container.Comments.withQuery(q => q
                .filter(c => F.and(
                    F.eq(c.Id, user.comment.Id),
                    F.any(c.User.Blogs, b => F.eq(b.Name, blogName)))))
                .get();

            if (success) {
                expect(result.value.length).toBe(1);
                expect(result.value[0].Title).toBe(user.comment.Title);
            } else {
                expect(result.value.length).toBe(0);
            }
        }
    });

    // BlogPost, Words, Word
    testCase("Complex -> Array<Simple> -> Simple", function () {

        it("Should filter (success)", execute.bind(null, true));
        it("Should filter (failure)", execute.bind(null, false))

        async function execute(success: boolean) {

            const blogPostText = uniqueString("custom_blog_post_")
            const user = await addFullUserChain({ blogPostContent: blogPostText });
            const blogPostWord = success
                ? blogPostText
                : "Not a valid name";

            const result = await client.My.Odata.Container.BlogPosts
                .withQuery(q => q
                    .filter(bp => F.and(
                        F.any(bp.Words, w => F.eq(w, blogPostWord)))))
                .get({ requestInterceptor: toListRequestInterceptor });

            if (success) {
                expect(result.value.length).toBe(1);
                expect(result.value[0].Name).toBe(user.blogPost.Name);
            } else {
                expect(result.value.length).toBe(0);
            }
        }
    });

    // TODO: not sure if HasSubset is a real thing
    // BlogPost, Words, HasSubset
    testCase("Complex -> Array<Simple> -> HasSubset", function () {

        it("Should build filter (server can't process)", () => {
            const q = new My.Odata.Entities.BlogPostQueryBuilder()
                .filter(bp => F.hasSubset(bp.Words, ["something"]))
                .toQueryParts(false);

            expect(q["$filter"]).toBe("hassubset(Words,['something'])");
        });

        // it("Should filter (success)", execute.bind(null, true));
        // it("Should filter (failure)", execute.bind(null, false))

        // async function execute(success: boolean) {

        //     const blogPostText = uniqueString("custom_blog_post_")
        //     const user = await addFullUserChain({ blogPostContent: blogPostText });
        //     const blogPostWord = success
        //         ? blogPostText
        //         : "Not a valid name";

        //     const result = await client.My.Odata.Container.BlogPosts
        //         .withQuery(q => q
        //             .filter(bp => F.and(
        //                 F.hasSubset(bp.Words, [blogPostWord]))))
        //         .get({ requestInterceptor: toListRequestInterceptor });

        //     if (success) {
        //         expect(result.value.length).toBe(1);
        //         expect(result.value[0].Name).toBe(user.blogPost.Name);
        //     } else {
        //         expect(result.value.length).toBe(0);
        //     }
        // }
    });

    // BlogPost, Comments, Comment, Words, Word
    testCase("Complex -> Array<Complex> -> Complex -> Array<Simple> -> Simple", function () {

        it("Should build filter (server can't process)", () => {
            const q = new My.Odata.Entities.BlogPostQueryBuilder()
                .filter(bp => F.any(bp.Comments, c => F.any(c.Words, w => F.eq(w, "something"))))
                .toQueryParts(false);

            expect(q["$filter"]).toBe("Comments/any(c:c/Words/any(w:w eq 'something'))");
        });
    });

    // Blog -> BlogPosts -> BlogPost -> Words -> Word
    testCase("Complex -> Array<Complex> -> Complex -> Array<Simple> -> Simple", function () {

        it("Should build filter (server can't process)", () => {
            const q = new My.Odata.Entities.BlogQueryBuilder()
                .filter(b => F.and(
                    F.any(b.Posts, b => F.any(b.Words, w => F.eq(w, "something")))))
                .toQueryParts(false);

            expect(q["$filter"]).toBe("Posts/any(p:p/Words/any(w:w eq 'something'))");
        });
    });

    // BlogPost -> Comments -> Comment -> Words -> HasSubset
    testCase("Complex -> Array<Complex> -> Complex -> Array<Simple> -> HasSubset", function () {

        it("Should build filter (server can't process)", () => {
            const q = new My.Odata.Entities.BlogPostQueryBuilder()
                .filter(bp => F.any(bp.Comments, c => F.any(c.Words, w => F.eq(w, "something"))))
                .toQueryParts(false);

            expect(q["$filter"]).toBe("Comments/any(c:c/Words/any(w:w eq 'something'))");
        });
    });

    // BlogPost -> Words -> Word
    testCase("Complex -> Array<Simple> -> Simple", function () {

        it("Should build filter (server can't process)", () => {
            const q = new My.Odata.Entities.BlogPostQueryBuilder()
                .filter(b => F.any(b.Words, w => F.eq(w, "something")))
                .toQueryParts(false);

            expect(q["$filter"]).toBe("Words/any(w:w eq 'something')");
        });
    });

    // Comment -> BlogPost -> Words -> Word
    testCase("Complex -> Complex -> Array<Simple> -> Simple", function () {

        it("Should build filter (server can't process)", () => {
            const q = new My.Odata.Entities.CommentQueryBuilder()
                .filter(c => F.any(c.BlogPost.Words, w => F.eq(w, "something")))
                .toQueryParts(false);

            expect(q["$filter"]).toBe("BlogPost/Words/any(w:w eq 'something')");
        });
    });

    // Comment -> BlogPost -> Words -> HasSubset
    testCase("Complex -> Complex -> Array<Simple> -> HasSubset", function () {

        it("Should build filter (server can't process)", () => {
            const q = new My.Odata.Entities.CommentQueryBuilder()
                .filter(c => F.hasSubset(c.BlogPost.Words, ["something"]))
                .toQueryParts(false);

            expect(q["$filter"]).toBe("hassubset(BlogPost/Words,['something'])");
        });
    });

    // User -> Comments -> Comment -> BlogPost -> Words -> HasSubset
    testCase("Complex -> Array<Complex> -> Complex -> Complex -> Array<Simple> -> HasSubset", function () {

        it("Should build filter (server can't process)", () => {
            const q = new My.Odata.Entities.UserQueryBuilder()
                .filter(u =>
                    F.any(u.BlogPostComments, c => F.hasSubset(c.BlogPost.Words, ["something"])))
                .toQueryParts(false);

            expect(q["$filter"]).toBe("BlogPostComments/any(bpc:hassubset(bpc/BlogPost/Words,['something']))");
        });
    });

    // User -> Comments -> Comment -> BlogPost -> Words -> Word
    testCase("Complex -> Array<Complex> -> Complex -> Complex -> Array<Simple> -> Simple", function () {

        it("Should build filter (server can't process)", () => {
            const q = new My.Odata.Entities.UserQueryBuilder()
                .filter(u =>
                    F.any(u.BlogPostComments, c => F.any(c.BlogPost.Words, w => F.eq(w, "something"))))
                .toQueryParts(false);

            expect(q["$filter"]).toBe("BlogPostComments/any(bpc:bpc/BlogPost/Words/any(w:w eq 'something'))");
        });
    });

    // 
    testCase("Complex -> Complex -> Array<Complex> -> Complex -> Array<Simple> -> HasSubset", function () {

        it("Should build filter (server can't process)", () => {
            const q = new My.Odata.Entities.CommentQueryBuilder()
                .filter(c => F.hasSubset(c.BlogPost.Words, ["something"]))
                .toQueryParts(false);

            expect(q["$filter"]).toBe("hassubset(BlogPost/Words,['something'])");
        });
    });

    // This one doesn't work in real life. Might need to amend it if there
    // is a server query working
    // Comment -> BlogPost -> Comments -> Comment -> Words -> Word 
    testCase("Complex -> Complex -> Array<Complex> -> Complex -> Array<Simple> -> Simple", function () {

        it("Should build filter (server can't process)", () => {
            const q = new My.Odata.Entities.CommentQueryBuilder()
                .filter(c1 => F.any(c1.BlogPost.Comments, c2 => F.any(c2.Words, w => F.eq(w, "something"))))
                .toQueryParts(false);

            expect(q["$filter"]).toBe("BlogPost/Comments/any(c:c/Words/any(w:w eq 'something'))");
        });
    });
});




// import { ODataClient } from "../generatedCode.js";
// import { addFullUserChain, addUser } from "../utils/client.js";

// const client = new ODataClient({
//     fetch: (x, y) => {
//         return fetch(x, y)
//     },
//     uriRoot: "http://localhost:5432/odata/test-entities",
//     responseInterceptor: (result, uri, reqValues, defaultParser) => {
//         return defaultParser(result)
//             .catch(async _ => {

//                 const err = {
//                     uri,
//                     code: result.status,
//                     statusText: result.statusText,
//                     headers: result.headers,
//                     error: await result.text(),
//                     reqValues
//                 }

//                 throw new Error(JSON.stringify(err, null, 2));
//             })
//     }
// }).My.Odata.Container;

// function toListRequestInterceptor(_: any, r: RequestInit): RequestInit {
//     return {
//         ...r,
//         headers: {
//             ...(r.headers || {}),
//             ToList: "true"
//         }
//     }
// }

// function loggingFetcher(input: RequestInfo | URL, init?: RequestInit) {
//     console.log(input, init)
//     return fetch(input, init)
// }

// describe("Cast", function () {

//     it("Should retrieve items of the correct type", async () => {
//         const user = await addUser();
//         const items = await client.HasIds
//             .cast(x => x.User())
//             .withQuery((q, { filter: { eq } }) => q.filter(u => eq(u.Id, user.Id!)))
//             .get();

//         expect(items.value.length).toBe(1);
//     });

//     it("Should retrieve items of the correct type (with key)", async () => {

//         const user = await addUser();
//         const items = await client.HasIds
//             .withKey(user.Id!)
//             .cast(i => i.User())
//             .get();

//         expect(items.Name).toBe(user.Name);
//     });

//     it("Should not retrieve items of the incorrect type", async () => {
//         const user = await addUser();
//         const items = await client.HasIds
//             .cast(x => x.Blog())
//             .withQuery((q, { filter: { eq } }) => q.filter(u => eq(u.Id, user.Id!)))
//             .get();

//         expect(items.value.length).toBe(0);
//     });

//     it("Should not retrieve items of the incorrect type (with key)", async () => {

//         const user = await addUser();

//         let err: Error | null = null;
//         try {
//             await client.HasIds
//                 .withKey(user.Id!)
//                 .cast(i => i.Blog())
//                 .get()
//         } catch (e: any) {
//             err = e;
//         }

//         expect(err).toBeTruthy()
//         expect(JSON.parse(err?.message || "{}").code).toBe(404)
//     });

//     it("Should retrieve correct values after cast", async () => {
//         const user = await addUser();
//         const items = await client.HasIds
//             .withKey(user.Id!)
//             .cast(c => c.User())
//             .get();

//         expect(items.Name).toBe(user.Name);
//     });

//     describe("Path Cast Combos", () => {

//         // TODO: path -> cast
//         it("Should retrieve correct values after cast and path (multi)", async () => {
//             const ctxt = await addFullUserChain();
//             const comments = await client.HasIds
//                 .withKey(ctxt.commentUser.Id!)
//                 .cast(c => c.User())
//                 .subPath(u => u.BlogPostComments)
//                 .get();

//             expect(comments.value.length).toBe(1);
//             expect(comments.value[0].Text).toBe(ctxt.comment.Text);
//         });

//         it("Should retrieve correct values after cast and path (single)", async () => {
//             const ctxt = await addFullUserChain();
//             const user = await client.HasIds
//                 .withKey(ctxt.blog.Id!)
//                 .cast(c => c.Blog())
//                 .subPath(u => u.User)
//                 .get();

//             expect(user.Name).toBe(ctxt.blogUser.Name);
//         });
//     });
// });

// describe("Cast (singleton)", function () {

//     it("Should retrieve items of the correct type", async () => {
//         const items = await client.AppDetailsBase
//             .cast(x => x.AppDetails())
//             .get();

//         expect(items.AppName).toBe("Blog app");
//     });

//     describe("Path Cast Combos", () => {

//         // TODO: path -> cast
//         it("Should retrieve correct values after cast and path", async () => {
//             const ctxt = await addFullUserChain();
//             const comments = await client.AppDetailsBase
//                 .cast(c => c.AppDetails())
//                 .subPath(u => u.AppName)
//                 .get();

//             expect(comments.value).toBe("Blog app");
//         });
//     });
// });
// TODO: reshape
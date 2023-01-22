import fetch, { Response } from 'node-fetch'
import { My } from '../generatedCode.js'
import { uniqueString } from './utils.js'

// for debug
export async function drain() {
    throw new Error("TODO")
    // const users = getUsers(x => x)
    // const blogs = getBlogs(x => x)
    // const blogPosts = getBlogPosts(x => x)
    // const comments = getComments(x => x)

    // return {
    //     users: await users,
    //     blogs: await blogs,
    //     blogPosts: await blogPosts,
    //     comments: await comments
    //     // not implemented correctly yet
    //     // tags: await getTags(x => x)
    // }
}

export type AddFullUserChainArgs = Partial<{
    userName: string
    blogPostContent: string
    commentTags: CommentTag[]
    addFullChainToCommentUser: AddFullUserChainArgs
}>

export type FullUserChain = {
    blogUser: User,
    commentUser: User,
    blog: Blog,
    blogPost: BlogPost,
    comment: BlogComment,
    commentUserChain?: FullUserChain
}

export async function addFullUserChain(settings?: AddFullUserChainArgs): Promise<FullUserChain> {

    settings ??= {};

    let commentUserP: Promise<User>;
    let commentUserChainP: Promise<FullUserChain> | undefined = undefined

    if (settings.addFullChainToCommentUser) {
        commentUserChainP = addFullUserChain(settings.addFullChainToCommentUser);
        commentUserP = commentUserChainP.then(x => x.blogUser);
    } else {
        commentUserP = addUser();
    }

    const blogUser = await addUser();
    const blog = await addBlog(blogUser.Id!);
    const blogPost = await addBlogPost(blog.Id!, settings?.blogPostContent);

    const commentUser = await commentUserP;
    const comment = await addComment(blogPost.Id!, commentUser.Id!, settings.commentTags || []);

    return {
        blogUser,
        commentUser,
        blog,
        blogPost,
        comment,
        commentUserChain: commentUserChainP && await commentUserChainP
    }
}

export type User = {
    Id?: string
    Name?: string
    Blogs?: Blog[]
    BlogPostComments?: Comment[]
}

export function postUser(val: User) {
    return post("Users", val);
}

export async function addUser(user?: Partial<User>) {

    const blogUser: User = { Name: user?.Name ?? uniqueString("User Name ") };
    blogUser.Id = (await postUser(blogUser)).Id;

    return blogUser;
}

export type Blog = {
    Id?: string
    Name?: string
    UserId?: string
    User?: User
    Posts?: BlogPost[]
    BlogPostNames?: string[]
    Comments?: Comment[][]
    CommentTitles?: string[][]
}

export function postBlog(val: Blog) {
    return post("Blogs", val);
}

export async function addBlog(userId: string) {

    const blog: Blog = { Name: uniqueString("Blog Name "), UserId: userId }
    blog.Id = (await postBlog(blog)).Id;

    return blog;
}

export type BlogPost = {
    Id?: string
    Name?: string
    Content?: string
    Date?: Date
    BlogId?: string
    Blog?: Blog
    Comments?: Comment[]
    Words?: string[]
    CommentTags?: CommentTag[][]
    CommentWords?: string[][]
}

export function postBlogPost(val: BlogPost) {
    return post("BlogPosts", val);
}

export async function addBlogPost(blogId: string, content?: string) {

    const blogPost: BlogPost = { Name: uniqueString("Blog Post Name "), BlogId: blogId, Content: content || uniqueString("Blog Content"), Date: new Date() }
    blogPost.Id = (await postBlogPost(blogPost)).Id;
    return blogPost;
}

export type BlogComment = {
    Id?: string
    Title?: string
    Text?: string
    BlogPostId?: string
    BlogPost?: BlogPost
    UserId?: string
    User?: User
    Words?: string[]
    Tags?: CommentTag[]
}

export function postComment(val: BlogComment) {
    return post<BlogComment>("Comments", val);
}

export async function addComment(blogPostId: string, userId: string, tags: CommentTag[]) {

    const blogComment: BlogComment = { Title: uniqueString("Comment Title "), Text: uniqueString("Comment text "), BlogPostId: blogPostId, UserId: userId, Tags: tags }
    blogComment.Id = (await postComment(blogComment)).Id;
    return blogComment;
}

export type CommentTag = {
    Tag?: string
    Comments?: BlogComment[]
}

export async function postTag(val: CommentTag) {
    await post("CommentTags", val);
}

export async function postCompositeKeyItem(val: My.Odata.Entities.CompositeKeyItem) {
    return await post("CompositeKeyItems", val);
}

export async function addCompositeKeyItem(compositeKeyItem?: Partial<My.Odata.Entities.CompositeKeyItem>) {

    return postCompositeKeyItem({
        Data: compositeKeyItem?.Data ?? uniqueString("Some data ")
    });
}

function post<T>(entityName: string, value: T) {
    const uri = `http://localhost:5432/odata/test-entities/${entityName}`;
    return fetch(uri, {
        method: "POST",
        body: JSON.stringify(value),
        headers: {
            "Content-Type": "application/json"
        }
    })
        .then(x => x.status < 200 || x.status >= 300
            ? x.text().then(err => handleError(uri, entityName, err, x, value)) as Promise<T>
            : x.json() as Promise<T>);
}

function handleError<T>(uri: string, entityName: string, error: any, resp: Response, reqPayload: any): T {
    throw new Error(JSON.stringify({ uri, entityName, error, status: resp.status, headers: resp.headers, reqPayload }, null, 2));
}
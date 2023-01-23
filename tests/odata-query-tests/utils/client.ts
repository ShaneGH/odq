import fetch, { Response } from 'node-fetch'
import { My } from '../generatedCode.js'
import { uniqueNumber, uniqueString } from './utils.js'

type User = My.Odata.Entities.User
type Blog = My.Odata.Entities.Blog
type BlogPost = My.Odata.Entities.BlogPost
type Comment = My.Odata.Entities.Comment
type CommentTag = My.Odata.Entities.CommentTag

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
    userType: My.Odata.Entities.UserType
    blogPostContent: string
    commentTags: CommentTag[]
    addFullChainToCommentUser: AddFullUserChainArgs
}>

export type FullUserChain = {
    blogUser: User,
    commentUser: User,
    blog: Blog,
    blogPost: BlogPost,
    comment: Comment,
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

    const blogUser = await addUser({ UserType: settings?.userType });
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

export function postUser(val: User) {
    return post("Users", val);
}

export async function addUser(user?: Partial<User>) {

    const blogUser: Partial<User> = {
        Name: uniqueString("User Name "),
        UserType: My.Odata.Entities.UserType.User,
        ...user || {}
    };

    return await postUser(blogUser as User);
}

export function postBlog(val: Blog) {
    return post("Blogs", val);
}

export async function addBlog(userId: string) {

    const blog: Partial<Blog> = { Name: uniqueString("Blog Name "), UserId: userId }
    return await postBlog(blog as Blog);
}

export function postBlogPost(val: Partial<BlogPost>) {
    return post("BlogPosts", val) as Promise<BlogPost>;
}

export async function addBlogPost(blogId: string, content?: string) {

    const blogPost: Partial<BlogPost> = {
        Name: uniqueString("Blog Post Name "),
        BlogId: blogId, Content: content || uniqueString("Blog Content"),
        Likes: uniqueNumber(),
        AgeRestriction: uniqueNumber(),
        Date: new Date()
    }

    return await postBlogPost(blogPost);
}

export function postComment(val: Partial<Comment>) {
    return post<Comment>("Comments", val as Comment);
}

export async function addComment(blogPostId: string, userId: string, tags: CommentTag[]) {

    const blogComment: Partial<Comment> = { Title: uniqueString("Comment Title "), Text: uniqueString("Comment text "), BlogPostId: blogPostId, UserId: userId, Tags: tags }
    return await postComment(blogComment)
}

export async function postTag(val: CommentTag) {
    await post("CommentTags", val);
}

export async function postCompositeKeyItem(val: Partial<My.Odata.Entities.CompositeKeyItem>) {
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
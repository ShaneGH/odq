using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData.Formatter;
using Microsoft.AspNetCore.OData.Query;
using Microsoft.AspNetCore.OData.Results;
using Microsoft.AspNetCore.OData.Routing.Controllers;
using TestServer.Model;

namespace TestServer.Controllers;

// [Route(Program.OdataRoot)]
// public abstract class ShapesController : ODataController
// {
//     private static IQueryable<Shape> Shapes = new Shape[]
//     {
//         new Square { Key = "Square", Length = 100 },
//         new Circle { Key = "Circle", Radius = 100 }
//     }.AsQueryable();

//     [EnableQuery(MaxAnyAllExpressionDepth = 100, MaxExpansionDepth = 100)]
//     public IQueryable<Shape> Get()
//     {
//         return Shapes;
//     }

//     [EnableQuery(MaxAnyAllExpressionDepth = 100, MaxExpansionDepth = 100)]
//     public SingleResult<Shape> Get([FromODataUri] string key)
//     {
//         return SingleResult.Create(Get().Where(p => p.Key == key));
//     }
// }

[Route(Program.OdataRoot)]
public abstract class ODataControllerBase<T> : ODataController
    where T : IHasMutableId
{
    private readonly EntityDbContext _inMemoryDb;

    public ODataControllerBase(EntityDbContext inMemoryDb)
    {
        _inMemoryDb = inMemoryDb;
    }

    [EnableQuery(MaxAnyAllExpressionDepth = 100, MaxExpansionDepth = 100)]
    public IQueryable<T> Get()
    {
        var es = AllEntities(_inMemoryDb);
        if (Request.Headers.ContainsKey("ToList"))
        {
            es = es.ToList().AsQueryable();
        }

        return es;
    }

    [EnableQuery(MaxAnyAllExpressionDepth = 100, MaxExpansionDepth = 100)]
    public SingleResult<T> Get([FromODataUri] string key)
    {
        return SingleResult.Create(Get().Where(p => p.Id == key));
    }

    protected abstract IQueryable<T> AllEntities(EntityDbContext db);

    protected abstract void AddEntity(EntityDbContext db, T entity);

    public ActionResult Post([FromBody] T item)
    {
        item.Id = Guid.NewGuid().ToString();
        AddEntity(_inMemoryDb, item);
        _inMemoryDb.SaveChanges();
        return Created(item);
    }
}

public class HasIdsController : ODataControllerBase<HasId>
{
    private readonly EntityDbContext _inMemoryDb;

    public HasIdsController(EntityDbContext inMemoryDb)
        : base(inMemoryDb)
    {
        this._inMemoryDb = inMemoryDb;
    }

    [HttpGet("HasIds({key})/My.Odata.Entities.User")]
    [EnableQuery(MaxAnyAllExpressionDepth = 100, MaxExpansionDepth = 100)]
    public SingleResult<User> GetUsersFromHasIds([FromRoute] string key)
    {
        return SingleResult.Create(_inMemoryDb.Users.Where(x => x.Id == key));
    }

    [HttpGet("HasIds/My.Odata.Entities.User")]
    [EnableQuery(MaxAnyAllExpressionDepth = 100, MaxExpansionDepth = 100)]
    public IQueryable<User> GetUsersFromHasIds()
    {
        return _inMemoryDb.Users;
    }

    [HttpGet("HasIds({key})/My.Odata.Entities.User/Blogs")]
    [EnableQuery(MaxAnyAllExpressionDepth = 100, MaxExpansionDepth = 100)]
    public IQueryable<Blog> GetUsersBlogsFromHasIds([FromRoute] string key)
    {
        return _inMemoryDb.Users
            .Where(x => x.Id == key)
            .SelectMany(x => x.Blogs);
    }

    [HttpGet("HasIds({key})/My.Odata.Entities.Blog")]
    [EnableQuery(MaxAnyAllExpressionDepth = 100, MaxExpansionDepth = 100)]
    public SingleResult<Blog> GetBlogsFromHasIds([FromRoute] string key)
    {
        return SingleResult.Create(_inMemoryDb.Blogs.Where(x => x.Id == key));
    }

    [HttpGet("HasIds/My.Odata.Entities.Blog")]
    [EnableQuery(MaxAnyAllExpressionDepth = 100, MaxExpansionDepth = 100)]
    public IQueryable<Blog> GetBlogsFromHasIds()
    {
        return _inMemoryDb.Blogs;
    }

    protected override void AddEntity(EntityDbContext db, HasId entity) => throw new InvalidOperationException();

    protected override IQueryable<HasId> AllEntities(EntityDbContext db) => db.Users
        .Cast<HasId>()
        .Concat(db.Blogs)
        .Concat(db.BlogPosts)
        .Concat(db.Comments);
}

public class UsersController : ODataControllerBase<User>
{
    private readonly EntityDbContext _inMemoryDb;

    public UsersController(EntityDbContext inMemoryDb)
        : base(inMemoryDb)
    {
        this._inMemoryDb = inMemoryDb;
    }

    protected override void AddEntity(EntityDbContext db, User entity) => db.Users.Add(entity);

    protected override IQueryable<User> AllEntities(EntityDbContext db) => db.Users;
}

public class BlogsController : ODataControllerBase<Blog>
{
    private readonly EntityDbContext _inMemoryDb;

    public BlogsController(EntityDbContext inMemoryDb)
        : base(inMemoryDb)
    {
        this._inMemoryDb = inMemoryDb;
    }

    [HttpGet("Blogs({key})/User")]
    [EnableQuery(MaxAnyAllExpressionDepth = 100, MaxExpansionDepth = 100)]
    public SingleResult<User> GetBlogUser([FromRoute] string key)
    {
        return SingleResult.Create(_inMemoryDb.Blogs.Where(x => x.Id == key).Select(x => x.User));
    }

    [HttpGet("Blogs({key})/Posts")]
    [EnableQuery(MaxAnyAllExpressionDepth = 100, MaxExpansionDepth = 100)]
    public IQueryable<BlogPost> GetBlogBlogPosts([FromRoute] string key)
    {
        return _inMemoryDb.Blogs.Where(x => x.Id == key).SelectMany(x => x.Posts);
    }

    protected override void AddEntity(EntityDbContext db, Blog entity) => db.Blogs.Add(entity);

    protected override IQueryable<Blog> AllEntities(EntityDbContext db) => db.Blogs;
}

public class BlogPostsController : ODataControllerBase<BlogPost>
{
    private readonly EntityDbContext _inMemoryDb;

    public BlogPostsController(EntityDbContext inMemoryDb)
        : base(inMemoryDb)
    {
        this._inMemoryDb = inMemoryDb;
    }

    protected override void AddEntity(EntityDbContext db, BlogPost entity) => db.BlogPosts.Add(entity);

    protected override IQueryable<BlogPost> AllEntities(EntityDbContext db) => db.BlogPosts;
}

public class CommentsController : ODataControllerBase<Comment>
{
    private readonly EntityDbContext _inMemoryDb;

    public CommentsController(EntityDbContext inMemoryDb)
        : base(inMemoryDb)
    {
        this._inMemoryDb = inMemoryDb;
    }

    protected override void AddEntity(EntityDbContext db, Comment entity) => db.Comments.Add(entity);

    protected override IQueryable<Comment> AllEntities(EntityDbContext db) => db.Comments;
}

public class CommentTagsController : ODataControllerBase<CommentTag>
{
    private readonly EntityDbContext _inMemoryDb;

    public CommentTagsController(EntityDbContext inMemoryDb)
        : base(inMemoryDb)
    {
        this._inMemoryDb = inMemoryDb;
    }

    protected override void AddEntity(EntityDbContext db, CommentTag entity) => db.Tags.Add(entity);

    protected override IQueryable<CommentTag> AllEntities(EntityDbContext db) => db.Tags;
}
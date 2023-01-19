using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData.Query;
using Microsoft.AspNetCore.OData.Routing.Controllers;
using TestServer.Model;

namespace TestServer.Controllers;

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
    public ActionResult Get()
    {
        IEnumerable<T> es = AllEntities(_inMemoryDb);
        if (Request.Headers.ContainsKey("ToList"))
        {
            es = es.ToList();
        }

        return Ok(es);
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

    [HttpGet("HasIds({key})")]
    [EnableQuery(MaxAnyAllExpressionDepth = 100, MaxExpansionDepth = 100)]
    public ActionResult GetByKey([FromRoute] string key)
    {
        return Ok(AllEntities(_inMemoryDb).Where(x => x.Id == key));
    }

    [HttpGet("HasIds({key})/My.Odata.Entities.User")]
    [EnableQuery(MaxAnyAllExpressionDepth = 100, MaxExpansionDepth = 100)]
    public ActionResult GetUsersFromHasIds([FromRoute] string key)
    {
        return Ok(_inMemoryDb.Users.Where(x => x.Id == key));
    }

    [HttpGet("HasIds/My.Odata.Entities.User")]
    [EnableQuery(MaxAnyAllExpressionDepth = 100, MaxExpansionDepth = 100)]
    public ActionResult GetUsersFromHasIds()
    {
        return Ok(_inMemoryDb.Users);
    }

    [HttpGet("HasIds({key})/My.Odata.Entities.Blog")]
    [EnableQuery(MaxAnyAllExpressionDepth = 100, MaxExpansionDepth = 100)]
    public ActionResult GetBlogsFromHasIds([FromRoute] string key)
    {
        return Ok(_inMemoryDb.Blogs.Where(x => x.Id == key));
    }

    [HttpGet("HasIds/My.Odata.Entities.Blog")]
    [EnableQuery(MaxAnyAllExpressionDepth = 100, MaxExpansionDepth = 100)]
    public ActionResult GetBlogsFromHasIds()
    {
        return Ok(_inMemoryDb.Blogs);
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

    [EnableQuery(MaxAnyAllExpressionDepth = 100, MaxExpansionDepth = 100)]
    [HttpGet("Users({key})")]
    public ActionResult GetByKey([FromRoute] string key)
    {
        return Ok(_inMemoryDb.Users.Where(x => x.Id == key));
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

    [EnableQuery(MaxAnyAllExpressionDepth = 100, MaxExpansionDepth = 100)]
    [HttpGet("Blogs({key})")]
    public ActionResult GetByKey([FromRoute] string key)
    {
        return Ok(_inMemoryDb.Blogs.Where(x => x.Id == key));
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

    [EnableQuery(MaxAnyAllExpressionDepth = 100, MaxExpansionDepth = 100)]
    [HttpGet("BlogPosts({key})")]
    public ActionResult GetByKey([FromRoute] string key)
    {
        return Ok(_inMemoryDb.BlogPosts.Where(x => x.Id == key));
    }

    protected override void AddEntity(EntityDbContext db, BlogPost entity) => db.BlogPosts.Add(entity);

    protected override IQueryable<BlogPost> AllEntities(EntityDbContext db) => db.BlogPosts;
}

// public class BlogPostNamesController : ODataController
// {
//     private readonly EntityDbContext _inMemoryDb;

//     public BlogPostNamesController(EntityDbContext inMemoryDb)
//     {
//         this._inMemoryDb = inMemoryDb;
//     }

//     [EnableQuery(MaxAnyAllExpressionDepth = 100, MaxExpansionDepth = 100)]
//     public ActionResult Get()
//     {
//         return Ok(_inMemoryDb.BlogPosts.Select(x => x.Name));
//     }
// }

public class CommentsController : ODataControllerBase<Comment>
{
    private readonly EntityDbContext _inMemoryDb;

    public CommentsController(EntityDbContext inMemoryDb)
        : base(inMemoryDb)
    {
        this._inMemoryDb = inMemoryDb;
    }

    [EnableQuery(MaxAnyAllExpressionDepth = 100, MaxExpansionDepth = 100)]
    [HttpGet("Comments({key})")]
    public ActionResult GetByKey([FromRoute] string key)
    {
        return Ok(_inMemoryDb.Comments.Where(x => x.Id == key));
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

    [EnableQuery(MaxAnyAllExpressionDepth = 100, MaxExpansionDepth = 100)]
    [HttpGet("CommentTags({key})")]
    public ActionResult GetByKey([FromRoute] string key)
    {
        return Ok(_inMemoryDb.Tags.Where(x => x.Tag == key));
    }

    protected override void AddEntity(EntityDbContext db, CommentTag entity) => db.Tags.Add(entity);

    protected override IQueryable<CommentTag> AllEntities(EntityDbContext db) => db.Tags;
}
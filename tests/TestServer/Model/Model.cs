using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;

namespace TestServer.Model;

# nullable disable

// public class Shape
// {
//     public string Key { get; set; }
// }

// public class Circle : Shape
// {
//     public int Radius { get; set; }
// }

// public class Square : Shape
// {
//     public int Length { get; set; }
// }

public interface IHasMutableId
{
    string Id { get; set; }
}

public class HasId : IHasMutableId
{
    [Key]
    public string Id { get; set; }
}

public class User : HasId
{
    [Required]
    public string Name { get; set; }

    public UserValueDump? UserValueDump { get; set; }

    public IList<Blog> Blogs { get; set; }
    public IList<Comment> BlogPostComments { get; set; }
}

/// another table hanging off user, that has blogs, but casted down
public class UserValueDump : HasId
{
    public User User { get; set; }
    public IList<HasId> Blogs { get; set; }
}

public class Blog : HasId
{
    [Required]
    public string Name { get; set; }

    [Required]
    public string UserId { get; set; }
    public User User { get; set; }
    public IList<BlogPost> Posts { get; set; }
    public IQueryable<string> BlogPostNames => GetBlogPostNames().AsQueryable();
    public IEnumerable<string> GetBlogPostNames() => Posts.OrEmpty().Select(x => x.Name);

    // TODO: List<List<SimpleType>>, List<List<CompleType>>
    // public IQueryable<IQueryable<Comment>> Comments => Posts.OrEmpty().Select(x => x.Comments.OrEmpty().AsQueryable()).AsQueryable();
    // public IQueryable<IQueryable<string>> CommentTitles => Posts.OrEmpty().Select(x => x.Comments.OrEmpty().Select(x => x.Title).AsQueryable()).AsQueryable();
}

public class BlogPost : HasId
{
    [Required]
    public string Name { get; set; }

    [Required]
    public string Content { get; set; }

    [Required]
    public DateTimeOffset Date { get; set; }

    [Required]
    public string BlogId { get; set; }
    public Blog Blog { get; set; }
    public IList<Comment> Comments { get; set; }
    public IQueryable<string> Words => Regex.Split(Content, @"\s").Where(x => !string.IsNullOrWhiteSpace(x)).AsQueryable();

    // TODO: List<List<SimpleType>>, List<List<CompleType>>
    // public IQueryable<IQueryable<CommentTag>> CommentTags => Comments.OrEmpty().Select(x => x.Tags.OrEmpty().AsQueryable()).AsQueryable();
    // public IQueryable<IQueryable<string>> CommentWords => Comments.OrEmpty().Select(x => x.Words.OrEmpty().AsQueryable()).AsQueryable();
}

public class Comment : HasId
{
    [Required]
    public string Title { get; set; }

    [Required]
    public string Text { get; set; }

    [Required]
    public string BlogPostId { get; set; }
    public BlogPost BlogPost { get; set; }

    [Required]
    public string UserId { get; set; }
    public User User { get; set; }
    public IQueryable<string> Words => Regex.Split(Text, @"\s").Where(x => !string.IsNullOrWhiteSpace(x)).AsQueryable();
    public IList<CommentTag> Tags { get; set; }
}

public class CommentTag : IHasMutableId
{
    [Key]
    public string Tag { get; set; }
    public IList<Comment> Comments { get; set; }
    string IHasMutableId.Id { get => Tag; set => Tag = value; }
}

public static class Utils
{
    public static IEnumerable<T> OrEmpty<T>(this IEnumerable<T> x) => x ?? Enumerable.Empty<T>();
}
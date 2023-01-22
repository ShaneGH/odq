using Microsoft.AspNetCore.OData;
using Microsoft.OData.Edm;
using Microsoft.OData.ModelBuilder;
using TestServer.Controllers;
using TestServer.Model;

public class Program
{
    public const string OdataRoot = "odata/test-entities";

    public static WebApplication App;

    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        // Add services to the container.

        builder.Services
            .AddControllers()
            .AddJsonOptions(o =>
            {
                o.JsonSerializerOptions.PropertyNamingPolicy = null;
                o.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
            })
            .AddOData(opt => opt
                .EnableQueryFeatures()
                .AddRouteComponents(OdataRoot, GetEdmModel()));

        // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
        // builder.Services.AddEndpointsApiExplorer(); // http://localhost:5432/swagger/index.html
        // builder.Services.AddSwaggerGen();

        builder.Services.AddScoped<EntityDbContext>();

        App = builder.Build();

        App.UseODataRouteDebug();
        App.UseRouting();

        App.UseEndpoints(endpoints => endpoints.MapControllers());

        // App.UseSwagger();
        // App.UseSwaggerUI();

        App.Run();
    }

    static IEdmModel GetEdmModel()
    {
        var builder = new ODataConventionModelBuilder();

        // TODO: test special characters in namespace
        // asp net lets you add multiple modles by calling .AddOData(...) more than once
        builder.Namespace = "My.Odata.Entities";
        builder.ContainerName = "My/Odata.Container";

        builder.EntitySet<HasId>("HasIds");
        builder.EntitySet<User>("Users");
        builder.EntitySet<Blog>("Blogs");
        builder.EntitySet<BlogPost>("BlogPosts");
        builder.EntitySet<BlogPost>("BlogPosts2");
        builder.EntitySet<Comment>("Comments");
        builder.ComplexType<CommentTag>();

        builder.EntitySet<CompositeKeyItem>("CompositeKeyItems");

        // builder.EntitySet<Shape>("Shapes");
        // builder.ComplexType<Square>().DerivesFrom<Shape>();
        // builder.ComplexType<Circle>().DerivesFrom<Shape>();

        return builder.GetEdmModel();
    }
}
using Microsoft.EntityFrameworkCore;
using VideoTravelManager.Data;
using VideoTravelManager.Services;

var builder = WebApplication.CreateBuilder(args);

var dataPath = Environment.GetEnvironmentVariable("DATA_PATH") ?? "./data";
Directory.CreateDirectory(dataPath);

builder.Configuration["VideoStoragePath"] = Environment.GetEnvironmentVariable("VIDEO_PATH") ?? "/videos";

var connectionString = $"Data Source={Path.Combine(dataPath, "videos.db")}";

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(connectionString)
);

builder.Services.AddScoped<IVideoStreamingService, VideoStreamingService>();
builder.Services.AddScoped<IVideoScannerService, VideoScannerService>();
builder.Services.AddScoped<IThumbnailService, ThumbnailService>();
builder.Services.AddScoped<IVideoRecommendationService, VideoRecommendationService>();

builder.Services.AddControllers();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

builder.Services.AddEndpointsApiExplorer();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    context.Database.EnsureCreated();
}

app.UseRouting();
app.UseCors("AllowAll");
app.MapControllers();

app.Run();

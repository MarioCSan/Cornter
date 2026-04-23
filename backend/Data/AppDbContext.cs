using Microsoft.EntityFrameworkCore;
using VideoTravelManager.Models;

namespace VideoTravelManager.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Video> Videos { get; set; }
    public DbSet<Category> Categories { get; set; }
    public DbSet<VideoCategory> VideoCategories { get; set; }
    public DbSet<VideoFolder> VideoFolders { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<VideoCategory>()
            .HasKey(vc => new { vc.VideoId, vc.CategoryId });

        modelBuilder.Entity<VideoCategory>()
            .HasOne(vc => vc.Video)
            .WithMany(v => v.VideoCategories)
            .HasForeignKey(vc => vc.VideoId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<VideoCategory>()
            .HasOne(vc => vc.Category)
            .WithMany(c => c.VideoCategories)
            .HasForeignKey(vc => vc.CategoryId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

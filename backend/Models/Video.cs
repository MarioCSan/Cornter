namespace VideoTravelManager.Models;

public class Video
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
    public int DurationSeconds { get; set; }
    public long FileSizeBytes { get; set; }
    public string? ThumbnailPath { get; set; }
    public DateTime ImportedAt { get; set; } = DateTime.UtcNow;
    public int PlayCount { get; set; }
    public DateTime? LastPlayedAt { get; set; }

    public ICollection<VideoCategory> VideoCategories { get; set; } = new List<VideoCategory>();
}

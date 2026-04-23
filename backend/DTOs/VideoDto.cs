namespace VideoTravelManager.DTOs;

public class VideoDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? ThumbnailPath { get; set; }
    public int PlayCount { get; set; }
    public DateTime ImportedAt { get; set; }
    public List<string> Categories { get; set; } = new();
}

public class VideoDetailDto : VideoDto
{
    public string FilePath { get; set; } = string.Empty;
    public int DurationSeconds { get; set; }
    public long FileSizeBytes { get; set; }
    public DateTime? LastPlayedAt { get; set; }
}

public class CreateVideoDto
{
    public string Title { get; set; } = string.Empty;
    public List<int>? CategoryIds { get; set; }
}

public class UpdateVideoCategoriesDto
{
    public List<int> CategoryIds { get; set; } = new();
}

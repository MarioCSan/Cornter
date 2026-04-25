namespace VideoTravelManager.DTOs;

public class ImportFolderDto
{
    public string Path { get; set; } = string.Empty;
}

public class VideoSearchDto
{
    public string? SearchText { get; set; }
    public List<int>? CategoryIds { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}

public class FolderItemDto
{
    public string Name { get; set; } = string.Empty;
    public string Path { get; set; } = string.Empty;
}

public class FolderBrowseDto
{
    public string CurrentPath { get; set; } = string.Empty;
    public string ParentPath { get; set; } = string.Empty;
    public List<FolderItemDto> Folders { get; set; } = new();
}

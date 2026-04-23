namespace VideoTravelManager.Models;

public class VideoFolder
{
    public int Id { get; set; }
    public string Path { get; set; } = string.Empty;
    public DateTime? LastScanAt { get; set; }
}

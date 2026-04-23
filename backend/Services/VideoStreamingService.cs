namespace VideoTravelManager.Services;

public class StreamingResult
{
    public Stream Stream { get; set; } = null!;
    public string ContentType { get; set; } = string.Empty;
    public int StatusCode { get; set; } = 200;
    public Dictionary<string, string> Headers { get; set; } = new();
    public long ContentLength { get; set; }
}

public interface IVideoStreamingService
{
    StreamingResult GetVideoStream(string filePath, HttpRequest request);
}

public class VideoStreamingService : IVideoStreamingService
{
    private static readonly string[] VideoExtensions = { ".mp4", ".mov", ".mkv", ".avi", ".webm" };

    public StreamingResult GetVideoStream(string filePath, HttpRequest request)
    {
        var file = new FileInfo(filePath);

        if (!file.Exists)
            throw new FileNotFoundException($"Video file not found: {filePath}");

        var contentType = GetContentType(filePath);
        var fileLength = file.Length;

        if (request.Headers.Range.Count > 0)
        {
            return HandleRangeRequest(filePath, contentType, fileLength, request);
        }

        var stream = new FileStream(filePath, FileMode.Open, FileAccess.Read, FileShare.Read);
        return new StreamingResult
        {
            Stream = stream,
            ContentType = contentType,
            StatusCode = 200,
            ContentLength = fileLength,
            Headers = new()
            {
                { "Accept-Ranges", "bytes" }
            }
        };
    }

    private StreamingResult HandleRangeRequest(string filePath, string contentType, long fileLength, HttpRequest request)
    {
        var rangeHeader = request.Headers.Range.FirstOrDefault()?.ToString() ?? "";
        var ranges = ParseRangeHeader(rangeHeader, fileLength);

        if (ranges.Count == 0)
        {
            var stream = new FileStream(filePath, FileMode.Open, FileAccess.Read, FileShare.Read);
            return new StreamingResult
            {
                Stream = stream,
                ContentType = contentType,
                StatusCode = 200,
                ContentLength = fileLength,
                Headers = new()
                {
                    { "Accept-Ranges", "bytes" }
                }
            };
        }

        var (start, end) = ranges[0];
        var stream206 = new FileStream(filePath, FileMode.Open, FileAccess.Read, FileShare.Read);
        stream206.Seek(start, SeekOrigin.Begin);

        var contentLength = end - start + 1;
        return new StreamingResult
        {
            Stream = stream206,
            ContentType = contentType,
            StatusCode = 206,
            ContentLength = contentLength,
            Headers = new()
            {
                { "Content-Range", $"bytes {start}-{end}/{fileLength}" },
                { "Accept-Ranges", "bytes" }
            }
        };
    }

    private List<(long start, long end)> ParseRangeHeader(string rangeHeader, long fileLength)
    {
        var result = new List<(long, long)>();

        if (!rangeHeader.StartsWith("bytes="))
            return result;

        var ranges = rangeHeader.Substring(6).Split(',');

        foreach (var range in ranges)
        {
            var parts = range.Trim().Split('-');

            if (parts.Length != 2)
                continue;

            if (!long.TryParse(parts[0], out var start))
                start = 0;

            if (!long.TryParse(parts[1], out var end))
                end = fileLength - 1;

            if (start > end || start < 0 || end >= fileLength)
                continue;

            result.Add((start, end));
        }

        return result;
    }

    private string GetContentType(string filePath)
    {
        var ext = Path.GetExtension(filePath).ToLower();
        return ext switch
        {
            ".mp4" => "video/mp4",
            ".webm" => "video/webm",
            ".mov" => "video/quicktime",
            ".mkv" => "video/x-matroska",
            ".avi" => "video/x-msvideo",
            _ => "video/mp4"
        };
    }
}

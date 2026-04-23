using System.Diagnostics;

namespace VideoTravelManager.Services;

public interface IThumbnailService
{
    Task<string?> GenerateThumbnailAsync(string videoPath, string outputDir);
}

public class ThumbnailService : IThumbnailService
{
    public async Task<string?> GenerateThumbnailAsync(string videoPath, string outputDir)
    {
        try
        {
            if (!File.Exists(videoPath))
                return null;

            Directory.CreateDirectory(outputDir);

            var videoName = Path.GetFileNameWithoutExtension(videoPath);
            var thumbnailPath = Path.Combine(outputDir, $"{videoName}_thumb.jpg");

            if (File.Exists(thumbnailPath))
                return thumbnailPath;

            var process = new Process
            {
                StartInfo = new ProcessStartInfo
                {
                    FileName = "ffmpeg",
                    Arguments = $"-ss 5 -i \"{videoPath}\" -frames:v 1 -q:v 2 \"{thumbnailPath}\" -y",
                    UseShellExecute = false,
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    CreateNoWindow = true
                }
            };

            process.Start();
            await process.WaitForExitAsync();

            return File.Exists(thumbnailPath) ? thumbnailPath : null;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Thumbnail generation failed for {videoPath}: {ex.Message}");
            return null;
        }
    }
}

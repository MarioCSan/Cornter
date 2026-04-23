using System.Security.Cryptography;
using Microsoft.EntityFrameworkCore;
using VideoTravelManager.Data;
using VideoTravelManager.Models;

namespace VideoTravelManager.Services;

public interface IVideoScannerService
{
    Task<List<Video>> ScanFolderAsync(string folderPath, AppDbContext context);
    Task<string> CalculateSha256Async(string filePath);
}

public class VideoScannerService : IVideoScannerService
{
    private static readonly string[] SupportedExtensions = { ".mp4", ".mov", ".mkv", ".avi", ".webm" };

    public async Task<List<Video>> ScanFolderAsync(string folderPath, AppDbContext context)
    {
        var importedVideos = new List<Video>();
        var directoryInfo = new DirectoryInfo(folderPath);

        if (!directoryInfo.Exists)
            throw new DirectoryNotFoundException($"Folder not found: {folderPath}");

        var videoFiles = directoryInfo.GetFiles("*.*", SearchOption.AllDirectories)
            .Where(f => SupportedExtensions.Contains(f.Extension.ToLower()))
            .ToList();

        foreach (var file in videoFiles)
        {
            if (VideoExists(file, context))
                continue;

            var video = new Video
            {
                Title = Path.GetFileNameWithoutExtension(file.Name),
                FilePath = file.FullName,
                FileSizeBytes = file.Length,
                ImportedAt = DateTime.UtcNow,
                PlayCount = 0,
                DurationSeconds = 0
            };

            context.Videos.Add(video);
            importedVideos.Add(video);
        }

        await context.SaveChangesAsync();
        return importedVideos;
    }

    public async Task<string> CalculateSha256Async(string filePath)
    {
        using (var sha256 = SHA256.Create())
        {
            using (var stream = File.OpenRead(filePath))
            {
                var hash = await Task.Run(() => sha256.ComputeHash(stream));
                return Convert.ToHexString(hash);
            }
        }
    }

    private bool VideoExists(FileInfo file, AppDbContext context)
    {
        return context.Videos.Any(v =>
            v.FilePath == file.FullName ||
            (v.Title == Path.GetFileNameWithoutExtension(file.Name) &&
             v.FileSizeBytes == file.Length &&
             v.ImportedAt.Date == DateTime.UtcNow.Date)
        );
    }
}

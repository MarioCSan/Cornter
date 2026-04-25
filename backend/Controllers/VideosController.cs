using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VideoTravelManager.Data;
using VideoTravelManager.DTOs;
using VideoTravelManager.Models;
using VideoTravelManager.Services;

namespace VideoTravelManager.Controllers;

[ApiController]
[Route("api/[controller]")]
public class VideosController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IVideoStreamingService _streamingService;
    private readonly IVideoScannerService _scannerService;
    private readonly IThumbnailService _thumbnailService;
    private readonly IVideoRecommendationService _recommendationService;
    private readonly IConfiguration _configuration;
    private readonly string _videoDir;

    public VideosController(
        AppDbContext context,
        IVideoStreamingService streamingService,
        IVideoScannerService scannerService,
        IThumbnailService thumbnailService,
        IVideoRecommendationService recommendationService,
        IConfiguration configuration)
    {
        _context = context;
        _streamingService = streamingService;
        _scannerService = scannerService;
        _thumbnailService = thumbnailService;
        _recommendationService = recommendationService;
        _configuration = configuration;
        _videoDir = configuration["VideoStoragePath"] ?? "/videos";
    }

    [HttpGet]
    public async Task<ActionResult<List<VideoDto>>> GetVideos([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var videos = await _context.Videos
            .Include(v => v.VideoCategories)
            .ThenInclude(vc => vc.Category)
            .OrderByDescending(v => v.ImportedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return Ok(videos.Select(MapToDto).ToList());
    }

    [HttpGet("top")]
    public async Task<ActionResult<List<VideoDto>>> GetTopVideos()
    {
        var videos = await _context.Videos
            .Include(v => v.VideoCategories)
            .ThenInclude(vc => vc.Category)
            .OrderByDescending(v => v.PlayCount)
            .Take(8)
            .ToListAsync();

        return Ok(videos.Select(MapToDto).ToList());
    }

    [HttpGet("latest")]
    public async Task<ActionResult<List<VideoDto>>> GetLatestVideos()
    {
        var videos = await _context.Videos
            .Include(v => v.VideoCategories)
            .ThenInclude(vc => vc.Category)
            .OrderByDescending(v => v.ImportedAt)
            .Take(8)
            .ToListAsync();

        return Ok(videos.Select(MapToDto).ToList());
    }

    [HttpGet("random")]
    public async Task<ActionResult<List<VideoDto>>> GetRandomVideos([FromQuery] int count = 20)
    {
        var totalCount = await _context.Videos.CountAsync();

        if (totalCount == 0)
            return Ok(new List<VideoDto>());

        var skip = new Random().Next(0, Math.Max(1, totalCount - count));

        var videos = await _context.Videos
            .Include(v => v.VideoCategories)
            .ThenInclude(vc => vc.Category)
            .OrderBy(v => v.Id)
            .Skip(skip)
            .Take(count)
            .ToListAsync();

        return Ok(videos.Select(MapToDto).ToList());
    }

    [HttpGet("search")]
    public async Task<ActionResult<List<VideoDto>>> SearchVideos([FromQuery] string? text, [FromQuery] string? categories)
    {
        var query = _context.Videos
            .Include(v => v.VideoCategories)
            .ThenInclude(vc => vc.Category)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(text))
        {
            query = query.Where(v => v.Title.Contains(text));
        }

        if (!string.IsNullOrWhiteSpace(categories))
        {
            var categoryIds = new List<int>();
            foreach (var catId in categories.Split(','))
            {
                if (int.TryParse(catId.Trim(), out var id))
                {
                    categoryIds.Add(id);
                }
            }

            if (categoryIds.Count > 0)
            {
                query = query.Where(v =>
                    v.VideoCategories.Any(vc => categoryIds.Contains(vc.CategoryId))
                );
            }
        }

        var videos = await query.OrderByDescending(v => v.ImportedAt).ToListAsync();
        return Ok(videos.Select(MapToDto).ToList());
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<VideoDetailDto>> GetVideo(int id)
    {
        var video = await _context.Videos
            .Include(v => v.VideoCategories)
            .ThenInclude(vc => vc.Category)
            .FirstOrDefaultAsync(v => v.Id == id);

        if (video == null)
            return NotFound();

        return Ok(MapToDetailDto(video));
    }

    [HttpPost("{id}/play")]
    public async Task<IActionResult> RecordPlay(int id)
    {
        var video = await _context.Videos.FindAsync(id);

        if (video == null)
            return NotFound();

        video.PlayCount++;
        video.LastPlayedAt = DateTime.UtcNow;

        _context.Videos.Update(video);
        await _context.SaveChangesAsync();

        return Ok();
    }

    [HttpGet("{id}/stream")]
    public async Task<IActionResult> StreamVideo(int id)
    {
        var video = await _context.Videos.FindAsync(id);

        if (video == null)
            return NotFound();

        if (!System.IO.File.Exists(video.FilePath))
            return NotFound();

        var result = _streamingService.GetVideoStream(video.FilePath, Request);

        Response.StatusCode = result.StatusCode;
        foreach (var header in result.Headers)
        {
            Response.Headers[header.Key] = header.Value;
        }
        Response.Headers["Content-Length"] = result.ContentLength.ToString();

        return File(result.Stream, result.ContentType);
    }

    [HttpPost("upload")]
    public async Task<ActionResult<VideoDto>> UploadVideo(IFormFile file, [FromForm] List<int>? categoryIds)
    {
        if (file == null || file.Length == 0)
            return BadRequest("No file provided");

        var supportedExtensions = new[] { ".mp4", ".mov", ".mkv", ".avi", ".webm" };
        var fileExt = Path.GetExtension(file.FileName).ToLower();
        if (!supportedExtensions.Contains(fileExt))
            return BadRequest($"Unsupported file type: {fileExt}");

        Directory.CreateDirectory(_videoDir);

        var fileName = Path.GetFileName(file.FileName);
        var filePath = Path.Combine(_videoDir, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        var video = new Video
        {
            Title = Path.GetFileNameWithoutExtension(fileName),
            FilePath = filePath,
            FileSizeBytes = file.Length,
            ImportedAt = DateTime.UtcNow,
            PlayCount = 0,
            DurationSeconds = 0
        };

        _context.Videos.Add(video);
        await _context.SaveChangesAsync();

        if (categoryIds != null && categoryIds.Count > 0)
        {
            foreach (var categoryId in categoryIds)
            {
                var category = await _context.Categories.FindAsync(categoryId);
                if (category != null)
                {
                    video.VideoCategories.Add(new VideoCategory { VideoId = video.Id, CategoryId = categoryId });
                }
            }
            await _context.SaveChangesAsync();
        }

        var thumbnailDir = Path.Combine(_videoDir, "thumbnails");
        var thumbnailPath = await _thumbnailService.GenerateThumbnailAsync(filePath, thumbnailDir);
        if (thumbnailPath != null)
        {
            video.ThumbnailPath = thumbnailPath;
            _context.Videos.Update(video);
            await _context.SaveChangesAsync();
        }

        return CreatedAtAction(nameof(GetVideo), new { id = video.Id }, MapToDto(video));
    }

    [HttpPost("import-folder")]
    public async Task<ActionResult<List<VideoDto>>> ImportFolder([FromBody] ImportFolderDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Path))
            return BadRequest("Folder path is required");

        if (!Directory.Exists(dto.Path))
            return BadRequest("Folder path does not exist");

        var importedVideos = await _scannerService.ScanFolderAsync(dto.Path, _context);

        var thumbnailDir = Path.Combine(_videoDir, "thumbnails");

        foreach (var video in importedVideos)
        {
            var thumbnailPath = await _thumbnailService.GenerateThumbnailAsync(video.FilePath, thumbnailDir);
            if (thumbnailPath != null)
            {
                video.ThumbnailPath = thumbnailPath;
                _context.Videos.Update(video);
            }
        }
        await _context.SaveChangesAsync();

        return Ok(importedVideos.Select(MapToDto).ToList());
    }

    [HttpPost("import-default-folder")]
    public async Task<ActionResult<List<VideoDto>>> ImportDefaultFolder()
    {
        var defaultPath = _videoDir;

        if (!Directory.Exists(defaultPath))
            return BadRequest("Videos folder does not exist");

        var importedVideos = await _scannerService.ScanFolderAsync(defaultPath, _context);

        var thumbnailDir = Path.Combine(_videoDir, "thumbnails");

        foreach (var video in importedVideos)
        {
            var thumbnailPath = await _thumbnailService.GenerateThumbnailAsync(video.FilePath, thumbnailDir);
            if (thumbnailPath != null)
            {
                video.ThumbnailPath = thumbnailPath;
                _context.Videos.Update(video);
            }
        }
        await _context.SaveChangesAsync();

        return Ok(importedVideos.Select(MapToDto).ToList());
    }

    [HttpGet("folders/browse")]
    public ActionResult<FolderBrowseDto> BrowseFolders([FromQuery] string? path)
    {
        try
        {
            var startPath = string.IsNullOrWhiteSpace(path) ? Path.GetPathRoot(Directory.GetCurrentDirectory()) ?? "/" : path;

            if (!Directory.Exists(startPath))
                return BadRequest("Path does not exist");

            var parentPath = Directory.GetParent(startPath)?.FullName ?? startPath;
            var directories = Directory.GetDirectories(startPath)
                .OrderBy(d => new DirectoryInfo(d).Name)
                .Select(d => new FolderItemDto
                {
                    Name = new DirectoryInfo(d).Name,
                    Path = d
                })
                .ToList();

            return Ok(new FolderBrowseDto
            {
                CurrentPath = startPath,
                ParentPath = parentPath,
                Folders = directories
            });
        }
        catch
        {
            return BadRequest("Unable to browse folder");
        }
    }

    [HttpPut("{id}/categories")]
    public async Task<IActionResult> UpdateVideoCategories(int id, [FromBody] UpdateVideoCategoriesDto dto)
    {
        var video = await _context.Videos
            .Include(v => v.VideoCategories)
            .FirstOrDefaultAsync(v => v.Id == id);

        if (video == null)
            return NotFound();

        _context.VideoCategories.RemoveRange(video.VideoCategories);

        foreach (var categoryId in dto.CategoryIds)
        {
            var category = await _context.Categories.FindAsync(categoryId);
            if (category != null)
            {
                video.VideoCategories.Add(new VideoCategory { VideoId = id, CategoryId = categoryId });
            }
        }

        _context.Videos.Update(video);
        await _context.SaveChangesAsync();

        return Ok(MapToDto(video));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteVideo(int id)
    {
        var video = await _context.Videos.FindAsync(id);

        if (video == null)
            return NotFound();

        if (System.IO.File.Exists(video.FilePath))
        {
            System.IO.File.Delete(video.FilePath);
        }

        if (!string.IsNullOrEmpty(video.ThumbnailPath) && System.IO.File.Exists(video.ThumbnailPath))
        {
            System.IO.File.Delete(video.ThumbnailPath);
        }

        _context.Videos.Remove(video);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private VideoDto MapToDto(Video video)
    {
        return new VideoDto
        {
            Id = video.Id,
            Title = video.Title,
            ThumbnailPath = video.ThumbnailPath,
            PlayCount = video.PlayCount,
            ImportedAt = video.ImportedAt,
            Categories = video.VideoCategories.Select(vc => vc.Category?.Name ?? "").ToList()
        };
    }

    private VideoDetailDto MapToDetailDto(Video video)
    {
        return new VideoDetailDto
        {
            Id = video.Id,
            Title = video.Title,
            ThumbnailPath = video.ThumbnailPath,
            PlayCount = video.PlayCount,
            ImportedAt = video.ImportedAt,
            FilePath = video.FilePath,
            DurationSeconds = video.DurationSeconds,
            FileSizeBytes = video.FileSizeBytes,
            LastPlayedAt = video.LastPlayedAt,
            Categories = video.VideoCategories.Select(vc => vc.Category?.Name ?? "").ToList()
        };
    }
}

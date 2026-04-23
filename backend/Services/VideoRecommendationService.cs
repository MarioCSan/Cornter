using Microsoft.EntityFrameworkCore;
using VideoTravelManager.Data;
using VideoTravelManager.Models;

namespace VideoTravelManager.Services;

public interface IVideoRecommendationService
{
    Task<List<Video>> GetRelatedVideosAsync(int videoId, AppDbContext context, int count = 8);
}

public class VideoRecommendationService : IVideoRecommendationService
{
    public async Task<List<Video>> GetRelatedVideosAsync(int videoId, AppDbContext context, int count = 8)
    {
        var currentVideo = await context.Videos
            .Include(v => v.VideoCategories)
            .ThenInclude(vc => vc.Category)
            .FirstOrDefaultAsync(v => v.Id == videoId);

        if (currentVideo == null)
            return new List<Video>();

        var currentCategories = currentVideo.VideoCategories
            .Select(vc => vc.CategoryId)
            .ToList();

        var relatedVideos = await context.Videos
            .Where(v => v.Id != videoId)
            .Include(v => v.VideoCategories)
            .ThenInclude(vc => vc.Category)
            .ToListAsync();

        var scored = relatedVideos
            .Select(v => new
            {
                Video = v,
                Score = CalculateRelevanceScore(v, currentVideo, currentCategories)
            })
            .OrderByDescending(x => x.Score)
            .ThenByDescending(x => x.Video.PlayCount)
            .Take(count)
            .Select(x => x.Video)
            .ToList();

        return scored;
    }

    private int CalculateRelevanceScore(Video video, Video currentVideo, List<int> currentCategories)
    {
        int score = 0;

        var videoCategories = video.VideoCategories
            .Select(vc => vc.CategoryId)
            .ToList();

        var sharedCategories = videoCategories.Intersect(currentCategories).Count();
        score += sharedCategories * 100;

        var titleKeywords = currentVideo.Title.Split(new[] { ' ', '-', '_' }, StringSplitOptions.RemoveEmptyEntries);
        var matchingKeywords = titleKeywords.Count(kw =>
            video.Title.Contains(kw, StringComparison.OrdinalIgnoreCase)
        );
        score += matchingKeywords * 10;

        return score;
    }
}

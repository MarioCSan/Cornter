import { useEffect, useState } from 'react';
import { Video } from '../types/video';
import { videoService } from '../services/api';
import { VideoCard } from './VideoCard';

interface RelatedVideosProps {
  videoId: number;
  categories: string[];
}

export function RelatedVideos({ videoId, categories }: RelatedVideosProps) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const allVideos = await videoService.getAll(1, 100);
        const related = allVideos
          .filter(v => v.id !== videoId)
          .filter(v =>
            v.categories.some(cat => categories.includes(cat)) ||
            categories.length === 0
          )
          .slice(0, 4);

        if (related.length === 0) {
          const random = await videoService.getRandom(4);
          setVideos(random.filter(v => v.id !== videoId));
        } else {
          setVideos(related);
        }
      } catch (error) {
        console.error('Failed to load related videos:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [videoId, categories]);

  if (loading) {
    return <div className="text-gray-400">Loading related videos...</div>;
  }

  if (videos.length === 0) {
    return null;
  }

  return (
    <div>
      <h3 className="text-lg font-bold mb-4 text-white">Related Videos</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {videos.map(video => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
    </div>
  );
}

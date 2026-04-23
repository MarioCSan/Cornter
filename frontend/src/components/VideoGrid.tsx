import { Video } from '../types/video';
import { VideoCard } from './VideoCard';

interface VideoGridProps {
  videos: Video[];
  title?: string;
}

export function VideoGrid({ videos, title }: VideoGridProps) {
  if (videos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">No videos found</p>
      </div>
    );
  }

  return (
    <div className="mb-8">
      {title && <h2 className="text-xl font-bold mb-4 text-white">{title}</h2>}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {videos.map(video => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
    </div>
  );
}

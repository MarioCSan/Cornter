import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { VideoPlayer } from '../components/VideoPlayer';
import { RelatedVideos } from '../components/RelatedVideos';
import { VideoDetail } from '../types/video';
import { videoService } from '../services/api';

export function VideoPage() {
  const { id } = useParams<{ id: string }>();
  const videoId = parseInt(id || '0');

  const [video, setVideo] = useState<VideoDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const v = await videoService.getById(videoId);
        setVideo(v);
      } catch (err) {
        setError('Failed to load video');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [videoId]);

  const handlePlay = async () => {
    try {
      await videoService.recordPlay(videoId);
      if (video) {
        setVideo({ ...video, playCount: video.playCount + 1 });
      }
    } catch (error) {
      console.error('Failed to record play:', error);
    }
  };

  const handleDeleteVideo = async () => {
    if (!confirm('Are you sure you want to delete this video?')) return;

    try {
      await videoService.delete(videoId);
      window.location.href = '/';
    } catch (error) {
      console.error('Failed to delete video:', error);
      alert('Failed to delete video');
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-400">Loading...</div>;
  }

  if (error || !video) {
    return <div className="text-center py-12 text-red-400">{error || 'Video not found'}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <VideoPlayer videoId={videoId} onPlay={handlePlay} />

      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-white">{video.title}</h1>

        <div className="flex items-center gap-6 text-sm text-gray-400">
          <div>
            <span className="font-semibold text-white">{video.playCount}</span> plays
          </div>
          <div>
            Imported {new Date(video.importedAt).toLocaleDateString()}
          </div>
          {video.lastPlayedAt && (
            <div>
              Last played {new Date(video.lastPlayedAt).toLocaleDateString()}
            </div>
          )}
        </div>

        {video.categories.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {video.categories.map((cat, idx) => (
              <span key={idx} className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm">
                {cat}
              </span>
            ))}
          </div>
        )}

        <div className="flex gap-2 pt-4">
          <button
            onClick={handleDeleteVideo}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
          >
            Delete Video
          </button>
        </div>
      </div>

      <hr className="border-dark-700" />

      <RelatedVideos videoId={videoId} categories={video.categories} />
    </div>
  );
}

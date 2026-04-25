import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { VideoPlayer } from '../components/VideoPlayer';
import { RelatedVideos } from '../components/RelatedVideos';
import { VideoDetail } from '../types/video';
import { Category } from '../types/category';
import { videoService, categoryService } from '../services/api';

export function VideoPage() {
  const { id } = useParams<{ id: string }>();
  const videoId = parseInt(id || '0');

  const [video, setVideo] = useState<VideoDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditCategories, setShowEditCategories] = useState(false);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [savingCategories, setSavingCategories] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [v, categories] = await Promise.all([
          videoService.getById(videoId),
          categoryService.getAll()
        ]);
        setVideo(v);
        setAllCategories(categories);
        setSelectedCategoryIds(
          categories
            .filter(cat => v.categories.includes(cat.name))
            .map(cat => cat.id)
        );
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

  const handleSaveCategories = async () => {
    setSavingCategories(true);
    try {
      await videoService.updateCategories(videoId, selectedCategoryIds);
      const updatedVideo = await videoService.getById(videoId);
      setVideo(updatedVideo);
      setShowEditCategories(false);
    } catch (error) {
      console.error('Failed to update categories:', error);
      alert('Failed to update categories');
    } finally {
      setSavingCategories(false);
    }
  };

  const toggleCategory = (categoryId: number) => {
    setSelectedCategoryIds(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
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
            onClick={() => setShowEditCategories(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
          >
            {video.categories.length > 0 ? 'Edit Categories' : 'Add Categories'}
          </button>
          <button
            onClick={handleDeleteVideo}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
          >
            Delete Video
          </button>
        </div>
      </div>

      {showEditCategories && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 rounded-lg max-w-md w-full p-6 space-y-4">
            <h2 className="text-2xl font-bold text-white">Edit Categories</h2>

            {allCategories.length === 0 ? (
              <p className="text-gray-400">No categories available. Create some first.</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {allCategories.map(category => (
                  <label key={category.id} className="flex items-center gap-3 p-2 hover:bg-dark-700 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedCategoryIds.includes(category.id)}
                      onChange={() => toggleCategory(category.id)}
                      className="w-4 h-4"
                    />
                    <span className="text-white">{category.name}</span>
                  </label>
                ))}
              </div>
            )}

            <div className="flex gap-2 pt-4 border-t border-dark-700">
              <button
                onClick={() => setShowEditCategories(false)}
                className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCategories}
                disabled={savingCategories}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded transition-colors"
              >
                {savingCategories ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      <hr className="border-dark-700" />

      <RelatedVideos videoId={videoId} categories={video.categories} />
    </div>
  );
}

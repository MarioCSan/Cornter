import { useState, useEffect } from 'react';
import { SearchBar } from '../components/SearchBar';
import { CategoryFilter } from '../components/CategoryFilter';
import { RandomButton } from '../components/RandomButton';
import { VideoGrid } from '../components/VideoGrid';
import { Video } from '../types/video';
import { videoService } from '../services/api';

export function HomePage() {
  const [mostViewed, setMostViewed] = useState<Video[]>([]);
  const [latest, setLatest] = useState<Video[]>([]);
  const [allVideos, setAllVideos] = useState<Video[]>([]);
  const [filtered, setFiltered] = useState<Video[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [randomVideos, setRandomVideos] = useState<Video[] | null>(null);
  const [loadingRandom, setLoadingRandom] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const load = async () => {
      try {
        const [top, recent, all] = await Promise.all([
          videoService.getTop(),
          videoService.getLatest(),
          videoService.getAll(page, 20)
        ]);
        setMostViewed(top);
        setLatest(recent);
        setAllVideos(all);
        setFiltered(all);
      } catch (error) {
        console.error('Failed to load videos:', error);
      }
    };
    load();
  }, [page]);

  useEffect(() => {
    const applyFilters = async () => {
      if (!searchQuery && selectedCategories.length === 0) {
        setFiltered(allVideos);
        return;
      }

      try {
        const results = await videoService.search(
          searchQuery || undefined,
          selectedCategories.length > 0 ? selectedCategories : undefined
        );
        setFiltered(results);
      } catch (error) {
        console.error('Search failed:', error);
      }
    };

    applyFilters();
  }, [searchQuery, selectedCategories]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  const handleCategoriesChange = (categoryIds: number[]) => {
    setSelectedCategories(categoryIds);
    setPage(1);
  };

  const handleShowRandom = async () => {
    setLoadingRandom(true);
    try {
      const random = await videoService.getRandom(20);
      setRandomVideos(random);
    } catch (error) {
      console.error('Failed to load random videos:', error);
    } finally {
      setLoadingRandom(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <SearchBar onSearch={handleSearch} />
        <CategoryFilter onCategoriesChange={handleCategoriesChange} />
        <RandomButton onClick={handleShowRandom} loading={loadingRandom} />
      </div>

      {randomVideos && (
        <>
          <VideoGrid videos={randomVideos} title="🎲 Random Videos" />
          <button
            onClick={() => setRandomVideos(null)}
            className="px-4 py-2 bg-dark-700 hover:bg-dark-600 text-white rounded-lg transition-colors"
          >
            Back to All Videos
          </button>
        </>
      )}

      {!randomVideos && (
        <>
          <VideoGrid videos={mostViewed} title="Most Viewed" />
          <VideoGrid videos={latest} title="Recently Added" />

          {searchQuery || selectedCategories.length > 0 ? (
            <VideoGrid videos={filtered} title="Search Results" />
          ) : (
            <VideoGrid videos={filtered} title="All Videos" />
          )}

          <div className="flex gap-2 justify-center mt-8">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-dark-700 hover:bg-dark-600 disabled:opacity-50 text-white rounded transition-colors"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-gray-400">Page {page}</span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={filtered.length < 20}
              className="px-4 py-2 bg-dark-700 hover:bg-dark-600 disabled:opacity-50 text-white rounded transition-colors"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}

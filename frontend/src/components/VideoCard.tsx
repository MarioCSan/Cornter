import { Link } from 'react-router-dom';
import { Video } from '../types/video';

interface VideoCardProps {
  video: Video;
}

export function VideoCard({ video }: VideoCardProps) {
  const date = new Date(video.importedAt).toLocaleDateString();

  return (
    <Link to={`/watch/${video.id}`}>
      <div className="group cursor-pointer">
        <div className="relative bg-dark-700 rounded-lg overflow-hidden h-40 mb-3 flex items-center justify-center">
          {video.thumbnailPath ? (
            <img
              src={video.thumbnailPath}
              alt={video.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-dark-600 to-dark-800 flex items-center justify-center">
              <svg className="w-12 h-12 text-dark-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5h3V7h4v5h3l-5 5z" />
              </svg>
            </div>
          )}
        </div>

        <h3 className="font-semibold text-sm text-white truncate group-hover:text-blue-400 transition-colors">
          {video.title}
        </h3>

        <p className="text-xs text-gray-400 mt-1">{video.playCount} plays</p>
        <p className="text-xs text-gray-500 mt-0.5">{date}</p>

        {video.categories.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {video.categories.slice(0, 2).map((cat, idx) => (
              <span key={idx} className="text-xs bg-dark-600 text-gray-300 px-2 py-1 rounded">
                {cat}
              </span>
            ))}
            {video.categories.length > 2 && (
              <span className="text-xs text-gray-400 px-2 py-1">
                +{video.categories.length - 2}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}

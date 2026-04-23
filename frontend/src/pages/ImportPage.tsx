import { useState } from 'react';
import { Video } from '../types/video';
import { videoService } from '../services/api';

export function ImportPage() {
  const [method, setMethod] = useState<'upload' | 'folder'>('upload');
  const [uploading, setUploading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [folderPath, setFolderPath] = useState('');
  const [importedVideos, setImportedVideos] = useState<Video[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleFileUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fileInput = form.querySelector('input[type="file"]') as HTMLInputElement;

    if (!fileInput.files?.length) {
      setMessage({ type: 'error', text: 'Please select a file' });
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      const file = fileInput.files[0];
      const uploaded = await videoService.upload(file);
      setImportedVideos([uploaded]);
      setMessage({ type: 'success', text: 'Video uploaded successfully!' });
      fileInput.value = '';
    } catch (error) {
      setMessage({ type: 'error', text: 'Upload failed' });
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleFolderImport = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!folderPath.trim()) {
      setMessage({ type: 'error', text: 'Please enter a folder path' });
      return;
    }

    setImporting(true);
    setMessage(null);

    try {
      const videos = await videoService.importFolder(folderPath);
      setImportedVideos(videos);
      setMessage({ type: 'success', text: `Imported ${videos.length} video(s)!` });
      setFolderPath('');
    } catch (error) {
      setMessage({ type: 'error', text: 'Import failed' });
      console.error(error);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-8">Import Videos</h1>

      {message && (
        <div className={`mb-6 p-4 rounded ${
          message.type === 'success'
            ? 'bg-green-900 text-green-200'
            : 'bg-red-900 text-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <div className="space-y-6">
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setMethod('upload')}
            className={`px-6 py-2 rounded font-medium transition-colors ${
              method === 'upload'
                ? 'bg-blue-600 text-white'
                : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
            }`}
          >
            Upload File
          </button>
          <button
            onClick={() => setMethod('folder')}
            className={`px-6 py-2 rounded font-medium transition-colors ${
              method === 'folder'
                ? 'bg-blue-600 text-white'
                : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
            }`}
          >
            Import Folder
          </button>
        </div>

        {method === 'upload' ? (
          <form onSubmit={handleFileUpload} className="bg-dark-800 p-6 rounded-lg space-y-4">
            <div>
              <label className="block text-white font-medium mb-2">Select Video File</label>
              <input
                type="file"
                accept="video/*"
                className="w-full px-4 py-2 bg-dark-700 text-white rounded border border-dark-600 focus:border-blue-500 focus:outline-none"
              />
              <p className="text-xs text-gray-400 mt-2">
                Supported: mp4, mov, mkv, avi, webm
              </p>
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded font-medium transition-colors"
            >
              {uploading ? 'Uploading...' : 'Upload Video'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleFolderImport} className="bg-dark-800 p-6 rounded-lg space-y-4">
            <div>
              <label className="block text-white font-medium mb-2">Folder Path</label>
              <input
                type="text"
                value={folderPath}
                onChange={(e) => setFolderPath(e.target.value)}
                placeholder="/path/to/videos or D:\Videos"
                className="w-full px-4 py-2 bg-dark-700 text-white rounded border border-dark-600 focus:border-blue-500 focus:outline-none"
              />
              <p className="text-xs text-gray-400 mt-2">
                Absolute path to a folder containing videos. Scans recursively.
              </p>
            </div>

            <button
              type="submit"
              disabled={importing}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded font-medium transition-colors"
            >
              {importing ? 'Importing...' : 'Import Folder'}
            </button>
          </form>
        )}

        {importedVideos.length > 0 && (
          <div className="bg-dark-800 p-6 rounded-lg">
            <h3 className="text-lg font-bold text-white mb-4">
              Imported Videos ({importedVideos.length})
            </h3>
            <ul className="space-y-2">
              {importedVideos.map(video => (
                <li key={video.id} className="text-gray-300 flex items-center gap-2">
                  <span>✓</span>
                  {video.title}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

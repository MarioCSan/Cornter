import { useState, useEffect } from 'react';
import { Video } from '../types/video';
import { videoService } from '../services/api';

interface FolderItem {
  name: string;
  path: string;
}

interface FolderBrowse {
  currentPath: string;
  parentPath: string;
  folders: FolderItem[];
}

export function ImportPage() {
  const [method, setMethod] = useState<'upload' | 'folder'>('upload');
  const [uploading, setUploading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importedVideos, setImportedVideos] = useState<Video[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Folder picker state
  const [browsing, setBrowsing] = useState(false);
  const [browseLoading, setBrowseLoading] = useState(false);
  const [folderData, setFolderData] = useState<FolderBrowse | null>(null);
  const [selectedPath, setSelectedPath] = useState('');

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

      const supportedTypes = ['video/mp4', 'video/quicktime', 'video/x-matroska', 'video/x-msvideo', 'video/webm'];
      if (!supportedTypes.includes(file.type) && !file.name.match(/\.(mp4|mov|mkv|avi|webm)$/i)) {
        setMessage({ type: 'error', text: 'Unsupported file type. Supported: mp4, mov, mkv, avi, webm' });
        setUploading(false);
        return;
      }

      const uploaded = await videoService.upload(file);
      setImportedVideos([uploaded]);
      setMessage({ type: 'success', text: 'Video uploaded successfully!' });
      fileInput.value = '';
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Upload failed';
      setMessage({ type: 'error', text: errorMsg });
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    if (browsing && !folderData) {
      loadFolders();
    }
  }, [browsing]);

  const loadFolders = async (path?: string) => {
    setBrowseLoading(true);
    try {
      const data = await videoService.browseFolders(path);
      setFolderData(data);
      setSelectedPath(data.currentPath);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load folder list' });
      console.error(error);
    } finally {
      setBrowseLoading(false);
    }
  };

  const handleNavigateFolder = async (path: string) => {
    await loadFolders(path);
  };

  const handleSelectFolder = async () => {
    if (!selectedPath) {
      setMessage({ type: 'error', text: 'Please select a folder' });
      return;
    }

    setBrowsing(false);
    setImporting(true);
    setMessage(null);

    try {
      const videos = await videoService.importFolder(selectedPath);
      setImportedVideos(videos);
      setMessage({ type: 'success', text: `Imported ${videos.length} video(s)!` });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Import failed';
      setMessage({ type: 'error', text: errorMsg });
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
                accept=".mp4,.mov,.mkv,.avi,.webm,video/*"
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
          <div className="bg-dark-800 p-6 rounded-lg space-y-4">
            {!browsing ? (
              <>
                <div>
                  <label className="block text-white font-medium mb-2">Select Folder</label>
                  <input
                    type="text"
                    value={selectedPath}
                    readOnly
                    placeholder="Click 'Browse' to select a folder"
                    className="w-full px-4 py-2 bg-dark-700 text-white rounded border border-dark-600 focus:outline-none cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    Choose a folder containing videos. Scans recursively.
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setBrowsing(true)}
                    className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded font-medium transition-colors"
                  >
                    Browse
                  </button>
                  <button
                    type="button"
                    onClick={handleSelectFolder}
                    disabled={importing || !selectedPath}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded font-medium transition-colors"
                  >
                    {importing ? 'Importing...' : 'Import Folder'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="mb-4">
                  <h3 className="text-white font-medium mb-2">Current: {selectedPath || 'Loading...'}</h3>
                </div>

                {browseLoading ? (
                  <div className="text-gray-400 py-8 text-center">Loading folders...</div>
                ) : folderData ? (
                  <>
                    {selectedPath !== folderData.parentPath && (
                      <button
                        type="button"
                        onClick={() => handleNavigateFolder(folderData.parentPath)}
                        className="w-full text-left px-4 py-3 bg-dark-700 hover:bg-dark-600 text-blue-400 rounded transition-colors flex items-center gap-2"
                      >
                        <span>↑</span> Go Up
                      </button>
                    )}

                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {folderData.folders.length === 0 ? (
                        <div className="text-gray-400 text-sm py-4">No folders found</div>
                      ) : (
                        folderData.folders.map(folder => (
                          <button
                            key={folder.path}
                            type="button"
                            onClick={() => handleNavigateFolder(folder.path)}
                            className="w-full text-left px-4 py-3 bg-dark-700 hover:bg-dark-600 text-white rounded transition-colors flex items-center gap-2"
                          >
                            <span>📁</span> {folder.name}
                          </button>
                        ))
                      )}
                    </div>

                    <div className="flex gap-2 pt-4 border-t border-dark-600">
                      <button
                        type="button"
                        onClick={() => setBrowsing(false)}
                        className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded font-medium transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSelectFolder}
                        disabled={importing}
                        className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded font-medium transition-colors"
                      >
                        {importing ? 'Importing...' : 'Import from Here'}
                      </button>
                    </div>
                  </>
                ) : null}
              </>
            )}
          </div>
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

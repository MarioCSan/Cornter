import { useState, useEffect } from 'react';
import { Video } from '../types/video';
import { Category } from '../types/category';
import { videoService, categoryService } from '../services/api';

export function ImportPage() {
  const [method, setMethod] = useState<'upload' | 'folder'>('upload');
  const [uploading, setUploading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importingDefault, setImportingDefault] = useState(false);
  const [importedVideos, setImportedVideos] = useState<Video[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<FileList | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showCategories, setShowCategories] = useState(false);
  const [deletingCategoryId, setDeletingCategoryId] = useState<number | null>(null);

  useEffect(() => {
    if (showCategories) {
      loadCategories();
    }
  }, [showCategories]);

  const loadCategories = async () => {
    try {
      const cats = await categoryService.getAll();
      setCategories(cats);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    setDeletingCategoryId(id);
    try {
      await categoryService.delete(id);
      setMessage({ type: 'success', text: 'Category deleted!' });
      setCategories(categories.filter(c => c.id !== id));
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to delete category';
      setMessage({ type: 'error', text: errorMsg });
      console.error(error);
    } finally {
      setDeletingCategoryId(null);
    }
  };

  const handleImportDefaultFolder = async () => {
    setImportingDefault(true);
    setMessage(null);

    try {
      const videos = await videoService.importDefaultFolder();
      setImportedVideos(videos);
      setMessage({ type: 'success', text: `Imported ${videos.length} video(s) from server!` });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Import failed';
      setMessage({ type: 'error', text: errorMsg });
      console.error(error);
    } finally {
      setImportingDefault(false);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      setMessage({ type: 'error', text: 'Category name cannot be empty' });
      return;
    }

    setCreatingCategory(true);
    setMessage(null);

    try {
      await categoryService.create(newCategoryName);
      setMessage({ type: 'success', text: `Category "${newCategoryName}" created!` });
      setNewCategoryName('');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to create category';
      setMessage({ type: 'error', text: errorMsg });
      console.error(error);
    } finally {
      setCreatingCategory(false);
    }
  };

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

      const supportedExts = ['.mp4', '.mov', '.mkv', '.avi', '.webm'];
      const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      if (!supportedExts.includes(fileExt)) {
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

  const handleFolderSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      setSelectedFolder(e.target.files);
    }
  };

  const handleImportFolder = async () => {
    if (!selectedFolder?.length) {
      setMessage({ type: 'error', text: 'Please select a folder with videos' });
      return;
    }

    setImporting(true);
    setMessage(null);

    try {
      const videos: Video[] = [];
      for (let i = 0; i < selectedFolder.length; i++) {
        const file = selectedFolder[i];
        const supportedExts = ['.mp4', '.mov', '.mkv', '.avi', '.webm'];
        const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

        if (supportedExts.includes(fileExt)) {
          try {
            const video = await videoService.upload(file);
            videos.push(video);
          } catch (err) {
            console.error(`Failed to import ${file.name}:`, err);
          }
        }
      }

      if (videos.length === 0) {
        setMessage({ type: 'error', text: 'No valid video files found in the selected folder' });
      } else {
        setImportedVideos(videos);
        setMessage({ type: 'success', text: `Imported ${videos.length} video(s)!` });
        setSelectedFolder(null);
      }
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
        <div className="bg-dark-800 p-6 rounded-lg space-y-4">
          <h2 className="text-xl font-bold text-white">Create Category</h2>
          <form onSubmit={handleCreateCategory} className="flex gap-2">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="e.g., Sports, Boat, Zurich..."
              className="flex-1 px-4 py-2 bg-dark-700 text-white rounded border border-dark-600 focus:border-blue-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={creatingCategory}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded font-medium transition-colors whitespace-nowrap"
            >
              {creatingCategory ? 'Creating...' : 'Create'}
            </button>
          </form>
          <p className="text-xs text-gray-400">
            Create categories first, then you can assign them to your videos.
          </p>

          <button
            onClick={() => setShowCategories(!showCategories)}
            className="w-full px-4 py-2 bg-dark-700 hover:bg-dark-600 text-white rounded font-medium transition-colors"
          >
            {showCategories ? 'Hide Categories' : 'Manage Categories'}
          </button>

          {showCategories && (
            <div className="border-t border-dark-600 pt-4 space-y-2">
              {categories.length === 0 ? (
                <p className="text-gray-400 text-sm">No categories created yet</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {categories.map(cat => (
                    <div
                      key={cat.id}
                      className="flex items-center justify-between bg-dark-700 p-3 rounded"
                    >
                      <span className="text-white">{cat.name}</span>
                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        disabled={deletingCategoryId === cat.id}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white text-sm rounded transition-colors"
                      >
                        {deletingCategoryId === cat.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <button
          onClick={handleImportDefaultFolder}
          disabled={importingDefault}
          className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:bg-gray-600 text-white rounded font-medium transition-colors"
        >
          {importingDefault ? 'Importing...' : '📂 Import Videos from Server (/videos)'}
        </button>

        <div className="border-t border-dark-700 pt-6">
          <p className="text-gray-400 text-sm mb-4">Or choose another method:</p>
          <div className="flex gap-4">
            <button
              onClick={() => setMethod('upload')}
              className={`flex-1 px-6 py-2 rounded font-medium transition-colors ${
                method === 'upload'
                  ? 'bg-blue-600 text-white'
                  : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
              }`}
            >
              Upload File
            </button>
            <button
              onClick={() => setMethod('folder')}
              className={`flex-1 px-6 py-2 rounded font-medium transition-colors ${
                method === 'folder'
                  ? 'bg-blue-600 text-white'
                  : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
              }`}
            >
              Import Folder
            </button>
          </div>
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
            <div>
              <label className="block text-white font-medium mb-2">Select Folder with Videos</label>
              <input
                type="file"
                multiple
                onChange={handleFolderSelect}
                className="w-full px-4 py-2 bg-dark-700 text-white rounded border border-dark-600 focus:border-blue-500 focus:outline-none"
                {...({ webkitdirectory: true } as any)}
              />
              <p className="text-xs text-gray-400 mt-2">
                Select a folder to import all video files. Supports: mp4, mov, mkv, avi, webm
              </p>
            </div>

            {selectedFolder && (
              <div className="bg-dark-700 p-3 rounded">
                <p className="text-sm text-gray-300">
                  📁 {selectedFolder.length} file(s) selected
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={handleImportFolder}
              disabled={importing || !selectedFolder?.length}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded font-medium transition-colors"
            >
              {importing ? 'Importing...' : 'Import Videos'}
            </button>
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

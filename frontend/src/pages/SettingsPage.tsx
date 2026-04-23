export function SettingsPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-8">Settings</h1>

      <div className="bg-dark-800 p-6 rounded-lg space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">About</h2>
          <div className="space-y-2 text-gray-300">
            <p>
              <strong>Video Travel Manager</strong> v0.1.0
            </p>
            <p>
              A private, self-hosted video streaming application for your personal travel videos.
            </p>
          </div>
        </div>

        <hr className="border-dark-700" />

        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Storage</h2>
          <div className="space-y-2 text-gray-300 text-sm">
            <p>Videos are stored in Docker volumes:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Database: <code className="bg-dark-700 px-2 py-1 rounded">/app/data</code></li>
              <li>Videos: <code className="bg-dark-700 px-2 py-1 rounded">/videos</code></li>
            </ul>
          </div>
        </div>

        <hr className="border-dark-700" />

        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Documentation</h2>
          <p className="text-gray-300 text-sm">
            See the README for setup and usage instructions.
          </p>
        </div>
      </div>
    </div>
  );
}

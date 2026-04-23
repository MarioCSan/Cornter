import { Link } from 'react-router-dom';

export function Header() {
  return (
    <header className="bg-dark-800 border-b border-dark-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded flex items-center justify-center">
            <span className="text-white font-bold text-sm">VTM</span>
          </div>
          <h1 className="text-xl font-bold text-white">Video Travel Manager</h1>
        </Link>

        <nav className="flex items-center gap-6">
          <Link to="/" className="text-gray-300 hover:text-white transition-colors text-sm">
            Home
          </Link>
          <Link to="/import" className="text-gray-300 hover:text-white transition-colors text-sm">
            Import
          </Link>
          <Link to="/settings" className="text-gray-300 hover:text-white transition-colors text-sm">
            Settings
          </Link>
        </nav>
      </div>
    </header>
  );
}

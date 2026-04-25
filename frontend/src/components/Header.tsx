import { Link } from 'react-router-dom';

export function Header() {
  return (
    <header className="bg-gradient-to-r from-[#0a0e27] to-[#16213e] border-b border-[#ff006e] sticky top-0 z-50 shadow-lg shadow-[#ff006e]/20">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 bg-gradient-to-br from-[#ff006e] to-[#8338ec] rounded flex items-center justify-center">
            <span className="text-white font-bold text-sm">VTM</span>
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-[#ff006e] to-[#3a86ff] bg-clip-text text-transparent">Video Travel Manager</h1>
        </Link>

        <nav className="flex items-center gap-6">
          <Link to="/" className="text-[#b0aaff] hover:text-[#ff006e] transition-colors text-sm font-medium">
            Home
          </Link>
          <Link to="/import" className="text-[#b0aaff] hover:text-[#ff006e] transition-colors text-sm font-medium">
            Import
          </Link>
          <Link to="/settings" className="text-[#b0aaff] hover:text-[#ff006e] transition-colors text-sm font-medium">
            Settings
          </Link>
        </nav>
      </div>
    </header>
  );
}

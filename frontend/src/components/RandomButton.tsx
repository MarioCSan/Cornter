interface RandomButtonProps {
  onClick: () => void;
  loading?: boolean;
}

export function RandomButton({ onClick, loading = false }: RandomButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
    >
      <span>🎲</span>
      <span>Show 20 Random Videos</span>
      {loading && <span className="animate-spin">⏳</span>}
    </button>
  );
}

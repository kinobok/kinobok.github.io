"use client";

interface SearchBarProps {
  onMenuToggle: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export default function SearchBar({
  onMenuToggle,
  searchQuery,
  onSearchChange,
}: SearchBarProps) {
  return (
    <div className="search-bar-container">
      <button className="icon-button" onClick={onMenuToggle}>
        ☰
      </button>
      <div className="search-input-wrapper">
        🔍
        <input
          type="text"
          placeholder="Search movies or cinemas..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </div>
  );
}

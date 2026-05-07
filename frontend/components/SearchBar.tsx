"use client";

import { Menu, Search } from "lucide-react";

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
        <Menu size={24} />
      </button>
      <div className="search-input-wrapper">
        <Search size={20} className="search-icon" />
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

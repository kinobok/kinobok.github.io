"use client";

import { Search } from "lucide-react";

interface SearchBarProps {
  onMenuToggle: () => void;
  onDashboardToggle: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export default function SearchBar({
  onMenuToggle,
  onDashboardToggle,
  searchQuery,
  onSearchChange,
}: SearchBarProps) {
  return (
    <div className="search-bar-container">
      <button className="icon-button" onClick={onMenuToggle} title="Settings">
        ☰
      </button>
      <div className="search-input-wrapper">
        <Search></Search>
        <input
          type="text"
          placeholder="Search movies or cinemas..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <button
        className="icon-button"
        onClick={onDashboardToggle}
        title="Scrape Dashboard"
      >
        📊
      </button>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Cinema } from "../utils/matching_logic";

interface SearchBarProps {
  onMenuToggle: () => void;
  onDashboardToggle: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  allCinemas?: Cinema[];
  onSelectCinema?: (cinemaId: string | null) => void;
}

export default function SearchBar({
  onMenuToggle,
  onDashboardToggle,
  searchQuery,
  onSearchChange,
  allCinemas,
  onSelectCinema,
}: SearchBarProps) {
  const [suggestions, setSuggestions] = useState<Cinema[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (searchQuery.length > 1 && allCinemas) {
      const hasExactMatch = allCinemas.some(
        (cinema) => cinema.name.toLowerCase() === searchQuery.toLowerCase(),
      );

      if (hasExactMatch) {
        setSuggestions([]);
        setShowSuggestions(false);
      } else {
        const filtered = allCinemas.filter((cinema) =>
          cinema.name.toLowerCase().includes(searchQuery.toLowerCase()),
        );
        setSuggestions(filtered);
        setShowSuggestions(true);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery, allCinemas]);

  return (
    <div className="search-bar-container">
      <button
        className="icon-button"
        onClick={onMenuToggle}
        title="Settings"
        style={{ pointerEvents: "auto" }}
      >
        ☰
      </button>
      <div
        className="search-input-wrapper"
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          flex: 1,
          pointerEvents: "auto",
        }}
      >
        <input
          type="text"
          placeholder="Find your cinema..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{ paddingRight: searchQuery ? "35px" : "10px", width: "100%" }}
        />
        {searchQuery && (
          <button
            className="icon-button"
            onClick={(e) => {
              e.stopPropagation();
              onSearchChange("");
              if (onSelectCinema) onSelectCinema(null);
            }}
            title="Clear search"
            style={{
              position: "absolute",
              right: "8px",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={16} />
          </button>
        )}

        {showSuggestions && suggestions.length > 0 && (
          <div
            className="search-suggestions-dropdown"
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              background: "var(--lb-sidebar, #14181c)",
              border: "1px solid var(--lb-card, #2c3440)",
              borderRadius: "4px",
              marginTop: "5px",
              zIndex: 1500,
              maxHeight: "200px",
              overflowY: "auto",
              boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
              pointerEvents: "auto",
            }}
          >
            {suggestions.map((cinema) => (
              <div
                key={cinema.id}
                className="suggestion-item"
                onClick={(e) => {
                  e.stopPropagation();
                  onSearchChange(cinema.name);
                  if (onSelectCinema) onSelectCinema(cinema.id);
                  setShowSuggestions(false);
                }}
                style={{
                  padding: "10px 15px",
                  cursor: "pointer",
                  color: "var(--lb-text-primary, #fff)",
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                  textAlign: "left",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "var(--lb-card, #2c3440)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                {cinema.name}
              </div>
            ))}
          </div>
        )}
      </div>
      <button
        className="icon-button"
        onClick={onDashboardToggle}
        title="Scrape Dashboard"
        style={{ pointerEvents: "auto" }}
      >
        📊
      </button>
    </div>
  );
}

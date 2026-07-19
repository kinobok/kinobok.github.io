"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Cinema, Movie } from "../utils/matching_logic";

interface SearchSuggestion {
  id: string;
  name: string;
  type: "cinema" | "movie";
}

interface SearchBarProps {
  onMenuToggle: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  allCinemas?: Cinema[];
  allMovies?: Movie[];
  onSelectCinema?: (cinemaId: string | null) => void;
  onSelectMovie?: (movieId: string | null) => void;
}

export default function SearchBar({
  onMenuToggle,
  searchQuery,
  onSearchChange,
  allCinemas,
  allMovies,
  onSelectCinema,
  onSelectMovie,
}: SearchBarProps) {
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (searchQuery.length > 1) {
      const query = searchQuery.toLowerCase();

      // Check if we have an exact match in either cinemas or movies to avoid showing dropdown
      const hasExactCinema = allCinemas?.some(
        (c) => c.name.toLowerCase() === query,
      );
      const hasExactMovie = allMovies?.some(
        (m) => m.title.toLowerCase() === query,
      );

      if (hasExactCinema || hasExactMovie) {
        setSuggestions([]);
        setShowSuggestions(false);
      } else {
        const list: SearchSuggestion[] = [];

        if (allCinemas) {
          allCinemas
            .filter((c) => c.name.toLowerCase().includes(query))
            .forEach((c) => {
              list.push({ id: c.id, name: c.name, type: "cinema" });
            });
        }

        if (allMovies) {
          allMovies
            .filter((m) => m.title.toLowerCase().includes(query))
            .forEach((m) => {
              list.push({ id: m.id, name: m.title, type: "movie" });
            });
        }

        setSuggestions(list);
        setShowSuggestions(true);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery, allCinemas, allMovies]);

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
          placeholder="Find cinema or movie..."
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
              if (onSelectMovie) onSelectMovie(null);
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
            {suggestions.map((item) => (
              <div
                key={`${item.type}-${item.id}`}
                className="suggestion-item"
                onClick={(e) => {
                  e.stopPropagation();
                  onSearchChange(item.name);
                  if (item.type === "cinema") {
                    if (onSelectCinema) onSelectCinema(item.id);
                  } else {
                    if (onSelectMovie) onSelectMovie(item.id);
                  }
                  setShowSuggestions(false);
                }}
                style={{
                  padding: "10px 15px",
                  cursor: "pointer",
                  color: "var(--lb-text-primary, #fff)",
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                  textAlign: "left",
                  transition: "background 0.2s",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "var(--lb-card, #2c3440)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <span>{item.name}</span>
                <span
                  style={{
                    fontSize: "0.75em",
                    padding: "2px 6px",
                    borderRadius: "3px",
                    background:
                      item.type === "cinema"
                        ? "rgba(255, 128, 0, 0.2)"
                        : "rgba(0, 224, 84, 0.2)",
                    color:
                      item.type === "cinema"
                        ? "var(--lb-orange)"
                        : "var(--lb-green)",
                    border:
                      item.type === "cinema"
                        ? "1px solid rgba(255, 128, 0, 0.3)"
                        : "1px solid rgba(0, 224, 84, 0.3)",
                  }}
                >
                  {item.type === "cinema" ? "Cinema" : "Movie"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

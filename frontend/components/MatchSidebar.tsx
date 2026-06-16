"use client";

import { useState, useEffect } from "react";
import { Match } from "../utils/matching_logic";

interface MatchSidebarProps {
  matches: Match[];
  isExpanded: boolean;
  onToggleExpand: (expanded: boolean) => void;
  sortBy?: string;
  onSortChange?: (newSortBy: string) => void;
  onExcludeMovie?: (movieId: string) => void;
  excludedCount?: number;
  onRestoreAllMovies?: () => void;
}

export default function MatchSidebar({
  matches,
  isExpanded,
  onToggleExpand,
  sortBy,
  onSortChange,
  onExcludeMovie,
  excludedCount = 0,
  onRestoreAllMovies,
}: MatchSidebarProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const containerStyle: React.CSSProperties = isMobile
    ? {
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: isExpanded ? "100%" : "200px",
        zIndex: 1200,
        background: "var(--lb-sidebar)",
        color: "var(--lb-text-primary)",
        overflowY: isExpanded ? "auto" : "hidden",
        borderRadius: isExpanded ? "0" : "12px 12px 0 0",
        transition: "height 0.3s ease-in-out",
        boxShadow: "0 -2px 10px rgba(0,0,0,0.4)",
        borderTop: "1px solid var(--lb-card)",
      }
    : {
        width: "350px",
        height: "100%",
        background: "var(--lb-sidebar)",
        color: "var(--lb-text-primary)",
        overflowY: "auto",
        borderRight: "1px solid var(--lb-card)",
        flexShrink: 0,
      };

  const handleBarClick = () => {
    if (isMobile && !isExpanded) {
      onToggleExpand(true);
    }
  };

  return (
    <div style={containerStyle} onClick={handleBarClick}>
      <div style={{ padding: "15px 20px" }}>
        {isMobile && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
            }}
          >
            {isExpanded ? (
              <button
                className="icon-button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleExpand(false);
                }}
                style={{ position: "absolute", left: "15px", top: "15px" }}
              >
                <span style={{ fontSize: 20 }}>⌄</span> {/*ChevronDown*/}
              </button>
            ) : (
              <div
                style={{
                  width: "40px",
                  height: "4px",
                  background: "var(--lb-card)",
                  borderRadius: "2px",
                  marginBottom: 20,
                }}
              />
            )}
          </div>
        )}

        <div
          style={{
            marginTop: isMobile ? (isExpanded ? "40px" : "0px") : "0px",
            textAlign: "left",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "15px",
            }}
          >
            <h3
              style={{
                fontSize: "1.1em",
                color: "var(--lb-text-primary)",
                margin: 0,
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              Matches Found
              <span
                style={{
                  background: "var(--lb-green)",
                  color: "#000",
                  padding: "2px 8px",
                  borderRadius: "10px",
                  fontSize: "0.8em",
                }}
              >
                {matches.length}
              </span>
            </h3>

            {onSortChange && matches.length > 0 && (
              <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                style={{
                  background: "var(--lb-card)",
                  color: "var(--lb-text-primary)",
                  border: "1px solid #444",
                  borderRadius: "4px",
                  padding: "4px 8px",
                  margin: "0 0 0 4px",
                  fontSize: "0.85em",
                  cursor: "pointer",
                }}
              >
                <option value="rare-week">Rare Screenings</option>
                <option value="rare-day">Rare Today</option>
                <option value="most-screenings">Most Screenings</option>
                <option value="alpha-asc">Title (A-Z)</option>
                <option value="alpha-desc">Title (Z-A)</option>
              </select>
            )}
          </div>

          <div style={{ marginTop: "10px" }}>
            {matches.length === 0 ? (
              <p
                style={{
                  color: "var(--lb-text-secondary)",
                  fontSize: "0.9em",
                }}
              >
                No matches found yet. Try uploading your watchlist in the menu
                or adjusting filters.
              </p>
            ) : (
              matches.map((match) => (
                <div
                  key={match.id}
                  style={{
                    position: "relative",
                    display: "flex",
                    gap: "12px",
                    marginBottom: "16px",
                    padding: "8px",
                    background: "var(--lb-card)",
                    borderRadius: "4px",
                    border: "1px solid transparent",
                    transition: "border-color 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.borderColor = "var(--lb-green)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.borderColor = "transparent")
                  }
                >
                  {onExcludeMovie && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onExcludeMovie(match.id);
                      }}
                      title="Hide this movie"
                      style={{
                        position: "absolute",
                        top: "4px",
                        right: "4px",
                        background: "rgba(0, 0, 0, 0.6)",
                        color: "var(--lb-text-secondary)",
                        border: "none",
                        borderRadius: "50%",
                        width: "26px",
                        height: "26px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = "#fff")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color =
                          "var(--lb-text-secondary)")
                      }
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                        <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                        <line x1="2" y1="2" x2="22" y2="22" />
                      </svg>
                    </button>
                  )}
                  <img
                    src={match.poster || "/poster-placeholder.svg"}
                    alt={match.title}
                    loading="lazy"
                    style={{
                      width: "45px",
                      height: "67px",
                      objectFit: "cover",
                      borderRadius: "2px",
                      background: "#333",
                      flexShrink: 0,
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "/poster-placeholder.svg";
                    }}
                  />
                  <div style={{ overflow: "hidden", paddingRight: "20px" }}>
                    <div
                      style={{
                        fontWeight: "bold",
                        fontSize: "0.95em",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      <a
                        href={match.boxd_uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: "var(--lb-text-primary)",
                          textDecoration: "none",
                        }}
                      >
                        {match.title}
                      </a>
                    </div>
                    <div
                      style={{
                        fontSize: "0.85em",
                        color: "var(--lb-text-secondary)",
                        marginTop: "4px",
                      }}
                    >
                      {match.showtimes.map((s, idx) => (
                        <div key={idx} style={{ marginBottom: "2px" }}>
                          <span style={{ color: "var(--lb-orange)" }}>
                            {s.cinema}
                          </span>
                          : {s.times.join(", ")}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          {onRestoreAllMovies && excludedCount > 0 && (
            <div style={{ marginBottom: "15px" }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRestoreAllMovies();
                }}
                style={{
                  background: "none",
                  color: "var(--lb-orange)",
                  border: "1px solid var(--lb-card)",
                  borderRadius: "4px",
                  padding: "6px 12px",
                  fontSize: "0.85em",
                  cursor: "pointer",
                  fontWeight: "light",
                  width: "100%",
                  textAlign: "center",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--lb-orange)";
                  e.currentTarget.style.color = "#000";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "none";
                  e.currentTarget.style.color = "var(--lb-orange)";
                }}
              >
                Restore {excludedCount} Hidden{" "}
                {excludedCount === 1 ? "Movie" : "Movies"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

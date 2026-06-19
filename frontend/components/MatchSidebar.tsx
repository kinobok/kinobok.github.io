"use client";

import { useState, useEffect, useRef } from "react";
import { Match, Cinema } from "../utils/matching_logic";
import Image from "next/image";
import DateSelector from "./DateSelector";
import { ChevronDown, Search, ChevronUp } from "lucide-react";

interface MatchSidebarProps {
  matches: Match[];
  isExpanded: boolean;
  onToggleExpand: (expanded: boolean) => void;
  onExcludeMovie?: (movieId: string) => void;
  excludedCount?: number;
  onRestoreAllMovies?: () => void;
  dates?: string[];
  selectedDate?: string;
  onDateChange?: (date: string) => void;
  matchCounts?: Record<string, number>;
  showAllScreenings?: boolean;
  onToggleShowAllScreenings?: (val: boolean) => void;
  isMinimized?: boolean;
  onToggleMinimize?: (minimized: boolean) => void;
  selectedCinema?: Cinema | null;
}

export default function MatchSidebar({
  matches,
  isExpanded,
  onToggleExpand,
  onExcludeMovie,
  excludedCount = 0,
  onRestoreAllMovies,
  dates,
  selectedDate,
  onDateChange,
  matchCounts,
  showAllScreenings,
  onToggleShowAllScreenings,
  isMinimized = false,
  onToggleMinimize,
  selectedCinema,
}: MatchSidebarProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const touchStartY = useRef<number | null>(null);
  const touchCurrentY = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile) return;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isMobile) return;
    touchCurrentY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = () => {
    if (
      !isMobile ||
      touchStartY.current === null ||
      touchCurrentY.current === null
    )
      return;
    const deltaY = touchCurrentY.current - touchStartY.current;

    if (deltaY < -50) {
      if (isMinimized) {
        if (onToggleMinimize) onToggleMinimize(false);
      } else if (!isExpanded) {
        onToggleExpand(true);
      }
    } else if (deltaY > 50) {
      if (isExpanded) {
        onToggleExpand(false);
      } else if (!isMinimized) {
        if (onToggleMinimize) onToggleMinimize(true);
      }
    }

    touchStartY.current = null;
    touchCurrentY.current = null;
  };

  const handleSearchFocus = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleExpand(false);
    const searchInput = document.querySelector(
      ".search-input-wrapper input",
    ) as HTMLInputElement;
    if (searchInput) {
      searchInput.focus();
    }
  };

  const containerStyle: React.CSSProperties = isMobile
    ? {
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: isExpanded ? "100%" : isMinimized ? "60px" : "200px",
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
    if (isMobile) {
      if (isMinimized) {
        if (onToggleMinimize) onToggleMinimize(false);
      } else if (!isExpanded) {
        onToggleExpand(true);
      }
    }
  };

  return (
    <div
      style={containerStyle}
      onClick={handleBarClick}
      onTouchStart={!isExpanded || isMinimized ? handleTouchStart : undefined}
      onTouchMove={!isExpanded || isMinimized ? handleTouchMove : undefined}
      onTouchEnd={!isExpanded || isMinimized ? handleTouchEnd : undefined}
    >
      {isMobile && isMinimized ? (
        <div
          onClick={(e) => {
            e.stopPropagation();
            if (onToggleMinimize) onToggleMinimize(false);
          }}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            padding: "15px",
            cursor: "pointer",
            height: "60px",
            width: "100%",
            boxSizing: "border-box",
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <ChevronUp size={20} style={{ color: "var(--lb-green)" }} />
          <span
            style={{
              fontSize: "14px",
              fontWeight: "bold",
              color: "var(--lb-text-primary)",
            }}
          >
            Tap to see screenings
          </span>
        </div>
      ) : (
        <div style={{ padding: "15px 20px" }}>
          {isMobile && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
              }}
            >
              {isExpanded ? (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "100%",
                    cursor: "ns-resize",
                  }}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  <button
                    className="icon-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleExpand(false);
                    }}
                    style={{ display: "flex", alignItems: "center" }}
                    title="Hide sidebar"
                  >
                    <ChevronDown></ChevronDown>
                  </button>
                  <button
                    className="icon-button"
                    onClick={handleSearchFocus}
                    style={{ display: "flex", alignItems: "center" }}
                    title="Search map"
                  >
                    <Search></Search>
                  </button>
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    width: "100%",
                    marginBottom: "15px",
                  }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "4px",
                      background: "var(--lb-card)",
                      borderRadius: "2px",
                      marginBottom: 10,
                    }}
                  />
                </div>
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
              style={{ display: isMobile ? "none" : "block", padding: "10px" }}
            >
              <div
                style={{
                  display: "block",
                  justifyContent: "center",
                  textAlign: "center",
                  alignItems: "center",
                  gap: "12px",
                  width: "-moz-available",
                }}
              >
                <svg
                  width="100px"
                  height="100px"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ flexShrink: 0 }}
                >
                  <path
                    fill="var(--lb-blue)"
                    stroke="var(--lb-orange)"
                    fillRule="evenodd"
                    d="M12.6577283,22.7532553 L12,23.3275712 L11.3422717,22.7532553 C5.81130786,17.9237218 3,13.70676 3,10 C3,4.7506636 7.09705254,1 12,1 C16.9029475,1 21,4.7506636 21,10 C21,13.70676 18.1886921,17.9237218 12.6577283,22.7532553 Z M5,10 C5,12.8492324 7.30661202,16.4335466 12,20.6634039 C16.693388,16.4335466 19,12.8492324 19,10 C19,5.8966022 15.8358849,3 12,3 C8.16411512,3 5,5.8966022 5,10 Z"
                  />
                  <g
                    transform="translate(8.2, 6.2) scale(0.32)"
                    stroke="var(--lb-green)"
                    fill="var(--lb-sidebar)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect
                      x="2"
                      y="2"
                      width="20"
                      height="20"
                      rx="2.18"
                      ry="2.18"
                    />
                    <line x1="7" y1="2" x2="7" y2="22" />
                    <line x1="17" y1="2" x2="17" y2="22" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <line x1="2" y1="7" x2="7" y2="7" />
                    <line x1="2" y1="17" x2="7" y2="17" />
                    <line x1="17" y1="17" x2="22" y2="17" />
                    <line x1="17" y1="7" x2="22" y2="7" />
                  </g>
                </svg>
                <h2
                  style={{
                    margin: 0,
                    color: "var(--lb-text-primary)",
                    fontSize: "24px",
                    fontWeight: "bold",
                  }}
                >
                  kin<span style={{ color: "var(--lb-orange" }}>o</span>
                  <span style={{ color: "var(--lb-green" }}>o</span>
                  <span style={{ color: "var(--lb-blue" }}>o</span>bok
                </h2>
              </div>
            </div>

            {/* Timeline Selector Relocation */}
            {dates && selectedDate && onDateChange && (
              <div style={{ marginBottom: "20px" }}>
                <DateSelector
                  dates={dates}
                  selectedDate={selectedDate}
                  onDateChange={onDateChange}
                  matchCounts={matchCounts}
                  isInline={true}
                />
              </div>
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "15px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px",
                  alignItems: "flex-start",
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
                </h3>
                {selectedCinema && (
                  <span
                    style={{
                      fontSize: "0.8em",
                      color: "var(--lb-text-secondary)",
                    }}
                  >
                    at{" "}
                    <strong style={{ color: "var(--lb-green)" }}>
                      {selectedCinema.name}
                    </strong>
                    , Warsaw, Poland
                  </span>
                )}
              </div>

              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                {onToggleShowAllScreenings && (
                  <div
                    title="Toggle show all screenings"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      pointerEvents: "auto",
                      marginRight: "4px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.75em",
                        color: "var(--lb-text-secondary)",
                      }}
                    >
                      {showAllScreenings ? "All" : "Watchlist"}
                    </span>
                    <label
                      style={{
                        position: "relative",
                        display: "inline-block",
                        width: "32px",
                        height: "18px",
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={showAllScreenings}
                        onChange={(e) => {
                          e.stopPropagation();
                          onToggleShowAllScreenings(!showAllScreenings);
                        }}
                        style={{ opacity: 0, width: 0, height: 0 }}
                      />
                      <span
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          backgroundColor: showAllScreenings
                            ? "var(--lb-green)"
                            : "#444",
                          transition: "0.3s",
                          borderRadius: "18px",
                        }}
                      >
                        <span
                          style={{
                            position: "absolute",
                            height: "12px",
                            width: "12px",
                            left: showAllScreenings ? "17px" : "3px",
                            bottom: "3px",
                            backgroundColor: showAllScreenings
                              ? "#000"
                              : "#fff",
                            transition: "0.3s",
                            borderRadius: "50%",
                          }}
                        />
                      </span>
                    </label>
                  </div>
                )}
              </div>
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
                    <Image
                      src={match.poster || "/poster-placeholder.svg"}
                      alt={match.title}
                      width={45}
                      height={67}
                      loading="lazy"
                      style={{
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
      )}
    </div>
  );
}

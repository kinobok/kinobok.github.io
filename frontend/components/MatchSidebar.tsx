"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import {
  Match,
  Cinema,
  isScreeningPast,
  groupMatchesByCity,
  formatRating,
  formatVoteCount,
  formatRuntime,
  getTmdbUrl,
} from "../utils/matching_logic";
import Image from "next/image";
import DateSelector from "./DateSelector";
import { ChevronDown, Search, ChevronUp } from "lucide-react";

interface MatchSidebarProps {
  matches: Match[];
  allCinemas?: Cinema[];
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
  isDatePast?: (date: string) => boolean;
}

function TmdbLogo({
  width = 28,
  height = 14,
}: {
  width?: number;
  height?: number;
}) {
  return (
    <svg
      role="img"
      viewBox="0 0 32 16"
      width={width}
      height={height}
      style={{ display: "block", flexShrink: 0 }}
    >
      <title>TMDB</title>
      <defs>
        <linearGradient id="tmdb-badge-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#90cea1" />
          <stop offset="100%" stopColor="#01b4e4" />
        </linearGradient>
      </defs>
      <rect width="32" height="16" rx="3.5" fill="url(#tmdb-badge-grad)" />
      <text
        x="16"
        y="11.5"
        fontSize="8.5"
        fontWeight="800"
        fontFamily="Inter, -apple-system, sans-serif"
        fill="#0d253f"
        textAnchor="middle"
        letterSpacing="0.4"
      >
        TMDB
      </text>
    </svg>
  );
}

function LetterboxdLogo({ size = 16 }: { size?: number }) {
  return (
    <svg
      role="img"
      viewBox="0 0 512 512"
      width={size}
      height={size}
      style={{ display: "block", flexShrink: 0 }}
    >
      <title>Letterboxd</title>
      <rect width="512" height="512" rx="110" fill="#14181c" />
      <path
        fill="#ff8000"
        fillRule="evenodd"
        d="M184.2 256c0-13.9 4-26.9 10.9-37.9c-12.7-20.3-35.2-33.7-60.9-33.7c-39.6 0-71.8 32.1-71.8 71.7s32.1 71.7 71.8 71.7c25.7 0 48.2-13.5 60.9-33.7c-6.9-11.2-10.9-24.2-10.9-38.1"
      />
      <path
        fill="#00e054"
        fillRule="evenodd"
        d="M316.9 218.1c-12.7-20.3-35.2-33.7-60.9-33.7s-48.2 13.5-60.9 33.7C202 229 206 242 206 256c0 13.9-4 26.9-10.9 37.9c12.7 20.3 35.2 33.7 60.9 33.7s48.2-13.5 60.9-33.7c-6.9-11-10.9-24-10.9-37.9c0-14 4-27 10.9-37.9"
      />
      <path
        fill="#40bcf4"
        fillRule="evenodd"
        d="M377.8 184.3c-25.7 0-48.2 13.5-60.9 33.7c6.9 11 10.9 24 10.9 37.9s-4 26.9-10.9 37.9c12.7 20.3 35.2 33.7 60.9 33.7c39.6 0 71.8-32.1 71.8-71.7c-.1-39.4-32.2-71.5-71.8-71.5"
      />
    </svg>
  );
}

export default function MatchSidebar({
  matches,
  allCinemas = [],
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
  isDatePast,
}: MatchSidebarProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const cityGroups = useMemo(() => {
    if (!allCinemas || allCinemas.length === 0) return [];
    return groupMatchesByCity(matches, allCinemas);
  }, [matches, allCinemas]);

  const [foldedCities, setFoldedCities] = useState<Record<string, boolean>>({});

  const toggleFoldCity = (city: string) => {
    setFoldedCities((prev) => ({
      ...prev,
      [city]: !prev[city],
    }));
  };

  const allCitiesFolded = useMemo(() => {
    if (cityGroups.length <= 1) return false;
    return cityGroups.every((g) => !!foldedCities[g.city]);
  }, [cityGroups, foldedCities]);

  const toggleFoldAllCities = () => {
    if (allCitiesFolded) {
      setFoldedCities({});
    } else {
      const allFolded: Record<string, boolean> = {};
      cityGroups.forEach((g) => {
        allFolded[g.city] = true;
      });
      setFoldedCities(allFolded);
    }
  };

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

  const renderMovieCard = (match: Match, keyPrefix?: string) => (
    <div
      key={`${keyPrefix ? keyPrefix + "-" : ""}${match.id}`}
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
        (e.currentTarget.style.borderColor = "var(--lb-blue)")
      }
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "transparent")}
    >
      {onExcludeMovie && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onExcludeMovie(match.id);
          }}
          className="hide-movie-button"
          title="Hide this movie"
          style={{
            position: "absolute",
            bottom: "6px",
            right: "6px",
            background: "var(--lb-bg)",
            color: "var(--lb-text-secondary)",
            border: "none",
            borderRadius: "50%",
            width: "24px",
            height: "24px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
            transition: "color 0.15s ease",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.color = "var(--lb-orange)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.color = "var(--lb-text-secondary)")
          }
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="13"
            height="13"
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
      <a
        href={match.boxd_uri}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          color: "var(--lb-text-primary)",
          textDecoration: "none",
        }}
      >
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
            (e.target as HTMLImageElement).src = "/poster-placeholder.svg";
          }}
        />
      </a>

      <div
        style={{
          overflow: "hidden",
          flex: 1,
          minWidth: 0,
          paddingRight: "4px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontWeight: "bold",
            fontSize: "0.95em",
            minWidth: 0,
          }}
        >
          <a
            href={match.boxd_uri}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "var(--lb-text-primary)",
              textDecoration: "none",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              minWidth: 0,
            }}
          >
            {match.title}
          </a>
          {match.year !== undefined && match.year > 0 && (
            <span
              style={{
                color: "var(--lb-text-secondary)",
                fontWeight: "normal",
                fontSize: "0.85em",
                flexShrink: 0,
              }}
            >
              {match.year}
            </span>
          )}
          <a
            href={match.boxd_uri}
            target="_blank"
            rel="noopener noreferrer"
            title="View on Letterboxd"
            className="letterboxd-link"
            onClick={(e) => e.stopPropagation()}
            style={{
              display: "inline-flex",
              alignItems: "center",
              flexShrink: 0,
              transition: "transform 0.15s ease",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "scale(1.15)")
            }
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <LetterboxdLogo size={16} />
          </a>
        </div>
        <div
          className="movie-metadata-row"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "0.8em",
            color: "var(--lb-text-secondary)",
            marginTop: "2px",
            marginBottom: "3px",
            flexWrap: "wrap",
          }}
        >
          <a
            href={getTmdbUrl(match.tmdb_url, match.tmdb_id, match.title)}
            target="_blank"
            rel="noopener noreferrer"
            title="View on TMDB"
            className="tmdb-link"
            onClick={(e) => e.stopPropagation()}
            style={{
              display: "inline-flex",
              alignItems: "center",
              flexShrink: 0,
              transition: "transform 0.15s ease",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "scale(1.1)")
            }
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <TmdbLogo width={28} height={14} />
          </a>
          {match.rating !== undefined && match.rating > 0 && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "3px",
                color: "var(--lb-green)",
                fontWeight: 600,
              }}
            >
              <span>★</span>
              <span>{formatRating(match.rating)}</span>
              {match.vote_count !== undefined && match.vote_count > 0 && (
                <span
                  style={{
                    color: "var(--lb-text-secondary)",
                    fontWeight: "normal",
                    fontSize: "0.9em",
                  }}
                >
                  ({formatVoteCount(match.vote_count)})
                </span>
              )}
            </span>
          )}
          {match.rating !== undefined &&
            match.rating > 0 &&
            match.runtime !== undefined &&
            match.runtime > 0 && <span style={{ opacity: 0.4 }}>•</span>}
          {match.runtime !== undefined && match.runtime > 0 && (
            <span>{formatRuntime(match.runtime)}</span>
          )}
        </div>
        <div
          style={{
            fontSize: "0.85em",
            color: "var(--lb-text-secondary)",
            marginTop: "4px",
            paddingRight: "26px",
          }}
        >
          {match.showtimes.map((s, idx) => (
            <div key={idx} style={{ marginBottom: "2px" }}>
              <a
                style={{
                  textDecoration: "none",
                  color: "var(--lb-text-secondary)",
                }}
                href={`https://www.google.com/search?q=cinema+${s.cinema}`}
              >
                <span style={{ color: "var(--lb-orange)" }}>{s.cinema}</span>:{" "}
                {s.times.map((t, tIdx) => {
                  const isPast = isScreeningPast(t, selectedDate);
                  return (
                    <span key={tIdx}>
                      <span
                        style={{
                          color: isPast
                            ? "rgba(255, 255, 255, 0.3)"
                            : "var(--lb-text-secondary)",
                          textDecoration: isPast ? "line-through" : "none",
                        }}
                      >
                        {t}
                      </span>
                      {tIdx < s.times.length - 1 && ", "}
                    </span>
                  );
                })}
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

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
                  isDatePast={isDatePast}
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
              ) : cityGroups.length > 1 ? (
                <>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "12px",
                      padding: "0 2px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.8em",
                        color: "var(--lb-text-secondary)",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        fontWeight: "bold",
                      }}
                    >
                      {cityGroups.length} cities
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFoldAllCities();
                      }}
                      className="fold-all-button"
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--lb-blue, #40bcf4)",
                        cursor: "pointer",
                        fontSize: "0.8em",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        fontWeight: "bold",
                      }}
                    >
                      {allCitiesFolded ? "Unfold all" : "Fold all"}
                    </button>
                  </div>
                  {cityGroups.map((group) => {
                    const isFolded = !!foldedCities[group.city];
                    return (
                      <div key={group.city} style={{ marginBottom: "16px" }}>
                        <div
                          className="city-section-header"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFoldCity(group.city);
                          }}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "6px 10px",
                            background: "rgba(255, 255, 255, 0.05)",
                            borderRadius: "6px",
                            marginBottom: isFolded ? "0px" : "10px",
                            fontSize: "0.85em",
                            fontWeight: "bold",
                            color: "var(--lb-green)",
                            cursor: "pointer",
                            userSelect: "none",
                          }}
                        >
                          <span>{group.city}</span>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                            }}
                          >
                            <span
                              style={{
                                color: "var(--lb-text-secondary)",
                                fontWeight: "normal",
                                fontSize: "0.9em",
                              }}
                            >
                              ({group.matches.length})
                            </span>
                            {isFolded ? (
                              <ChevronDown
                                size={14}
                                style={{ color: "var(--lb-text-secondary)" }}
                              />
                            ) : (
                              <ChevronUp
                                size={14}
                                style={{ color: "var(--lb-text-secondary)" }}
                              />
                            )}
                          </div>
                        </div>
                        {!isFolded &&
                          group.matches.map((match) =>
                            renderMovieCard(match, group.city),
                          )}
                      </div>
                    );
                  })}
                </>
              ) : (
                matches.map((match) => renderMovieCard(match))
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

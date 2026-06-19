"use client";

import React, { useMemo } from "react";
import { Cinema, Movie } from "../utils/matching_logic";

interface ConfigMenuProps {
  isOpen: boolean;
  onClose: () => void;
  visibleChains: string[];
  onToggleChain: (chain: string) => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  allCinemas?: Cinema[];
  excludedCinemaIds?: string[];
  onToggleCinema?: (cinemaId: string) => void;
  excludedMovieIds?: string[];
  allMovies?: Movie[];
  onRestoreMovie?: (movieId: string) => void;
  showAllScreenings?: boolean;
  onToggleShowAllScreenings?: (val: boolean) => void;
  sortBy?: string;
  onSortChange?: (newSortBy: string) => void;
}

export default function ConfigMenu({
  isOpen,
  onClose,
  visibleChains,
  onToggleChain,
  handleFileUpload,
  allCinemas = [],
  excludedCinemaIds = [],
  onToggleCinema,
  excludedMovieIds = [],
  allMovies = [],
  onRestoreMovie,
  showAllScreenings = false,
  onToggleShowAllScreenings,
  sortBy,
  onSortChange,
}: ConfigMenuProps) {
  const chains = ["Multikino", "Cinema City", "Helios"];

  // Group cinemas for display
  const cinemasByChain = useMemo(() => {
    const grouped: Record<string, Cinema[]> = {
      Multikino: [],
      "Cinema City": [],
      Helios: [],
      Independent: [],
    };
    allCinemas.forEach((c) => {
      const name = c.name.toLowerCase();
      if (name.startsWith("multikino")) grouped.Multikino.push(c);
      else if (name.startsWith("cinema city") || name.startsWith("imax"))
        grouped["Cinema City"].push(c);
      else if (name.startsWith("helios")) grouped.Helios.push(c);
      else grouped.Independent.push(c);
    });
    return grouped;
  }, [allCinemas]);

  if (!isOpen) return null;

  return (
    <div className="config-menu-overlay" onClick={onClose}>
      <div
        className="config-menu-content"
        onClick={(e) => e.stopPropagation()}
        style={{ overflowY: "auto" }}
      >
        <div className="config-menu-header">
          <h2 style={{ margin: 0 }}>kinꚘbok Warsaw</h2>
          <button className="icon-button" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="config-section">
          <h3>Upload Watchlist</h3>
          Download your data:
          <ul>
            <li>
              <a
                href="https://letterboxd.com/data/export/"
                target="_blank"
                rel="noopener noreferrer"
                className="modal-export-link"
              >
                from a direct Letterboxd data export url
              </a>{" "}
            </li>
            <li>
              {" "}
              <a
                href="https://letterboxd.com/settings/data/"
                target="_blank"
                rel="noopener noreferrer"
                className="modal-export-link"
              >
                from Letterboxd settings/data page
              </a>
            </li>
          </ul>
          <div
            style={{
              background: "var(--lb-card)",
              padding: "10px",
              borderRadius: "4px",
              marginTop: "10px",
            }}
          >
            <input
              type="file"
              accept=".csv,.zip"
              onChange={handleFileUpload}
              style={{ fontSize: "0.8em", width: "100%" }}
            />
          </div>
        </div>

        <div className="config-section">
          <h3>Screening Settings</h3>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "10px",
              background: "var(--lb-card)",
              padding: "10px 12px",
              borderRadius: "4px",
              marginTop: "8px",
            }}
          >
            <span style={{ fontSize: "0.95em", fontWeight: "bold" }}>
              Show All Screenings
            </span>
            <label
              style={{
                position: "relative",
                display: "inline-block",
                width: "44px",
                height: "24px",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={showAllScreenings}
                onChange={(e) =>
                  onToggleShowAllScreenings &&
                  onToggleShowAllScreenings(e.target.checked)
                }
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
                  borderRadius: "24px",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    height: "18px",
                    width: "18px",
                    left: showAllScreenings ? "23px" : "3px",
                    bottom: "3px",
                    backgroundColor: showAllScreenings ? "#000" : "#fff",
                    transition: "0.3s",
                    borderRadius: "50%",
                  }}
                />
              </span>
            </label>
          </div>
          <p
            style={{
              fontSize: "0.8em",
              color: "var(--lb-text-secondary)",
              marginTop: "4px",
            }}
          >
            Enable to see every movie playing. Disable to focus strictly on your
            Letterboxd watchlist.
          </p>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "10px",
              background: "var(--lb-card)",
              padding: "10px 12px",
              borderRadius: "4px",
              marginTop: "12px",
            }}
          >
            <span style={{ fontSize: "0.95em", fontWeight: "bold" }}>
              Sort Screenings By
            </span>
            {onSortChange && (
              <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value)}
                style={{
                  background: "var(--lb-sidebar, #14181c)",
                  color: "var(--lb-text-primary, #fff)",
                  border: "1px solid var(--lb-card, #2c3440)",
                  borderRadius: "4px",
                  padding: "6px 12px",
                  fontSize: "0.9em",
                  cursor: "pointer",
                  outline: "none",
                }}
              >
                <option value="rare-week">Rare Screenings (Weekly)</option>
                <option value="rare-day">Rare Screenings (Today)</option>
                <option value="most-screenings">Most Screenings First</option>
                <option value="alpha-asc">Title (A-Z)</option>
                <option value="alpha-desc">Title (Z-A)</option>
              </select>
            )}
          </div>
        </div>

        <div className="config-section">
          <h3>Chain Visibility</h3>
          <p style={{ fontSize: "0.9em", color: "var(--lb-text-secondary)" }}>
            Include big chains globally:
          </p>
          {chains.map((chain) => (
            <label key={chain} className="checkbox-label">
              <input
                type="checkbox"
                checked={visibleChains.includes(chain)}
                onChange={() => onToggleChain(chain)}
                style={{ accentColor: "var(--lb-green)" }}
              />
              {chain === "Cinema City" ? "Cinema City / IMAX" : chain}
            </label>
          ))}
          <p
            style={{
              fontSize: "0.8em",
              color: "var(--lb-text-secondary)",
              marginTop: "10px",
            }}
          >
            Independent cinemas are always visible unless manually disabled
            below.
          </p>
        </div>

        {allCinemas.length > 0 && onToggleCinema && (
          <div className="config-section">
            <h3>Individual Cinemas</h3>
            <p
              style={{
                fontSize: "0.9em",
                color: "var(--lb-text-secondary)",
                marginBottom: "10px",
              }}
            >
              Toggle specific locations on/off:
            </p>
            {Object.entries(cinemasByChain).map(([groupName, groupCinemas]) => {
              // Only show group if the chain is visible, or if it's independent
              const isChainVisible =
                groupName === "Independent" ||
                visibleChains.includes(groupName);
              if (!isChainVisible || groupCinemas.length === 0) return null;

              return (
                <div key={groupName} style={{ marginBottom: "10px" }}>
                  <strong
                    style={{ fontSize: "0.85em", color: "var(--lb-orange)" }}
                  >
                    {groupName}
                  </strong>
                  <div style={{ paddingLeft: "10px", marginTop: "4px" }}>
                    {groupCinemas.map((c) => (
                      <label
                        key={c.id}
                        className="checkbox-label"
                        style={{ fontSize: "0.85em" }}
                      >
                        <input
                          type="checkbox"
                          checked={!excludedCinemaIds.includes(c.id)}
                          onChange={() => onToggleCinema(c.id)}
                          style={{ accentColor: "var(--lb-green)" }}
                        />
                        {c.name}
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {excludedMovieIds.length > 0 && onRestoreMovie && (
          <div className="config-section">
            <h3>Excluded Movies</h3>
            <p
              style={{
                fontSize: "0.9em",
                color: "var(--lb-text-secondary)",
                marginBottom: "10px",
              }}
            >
              Movies you have hidden:
            </p>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              {excludedMovieIds.map((id) => {
                const movie = allMovies.find((m) => m.id === id);
                return (
                  <div
                    key={id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      background: "var(--lb-card)",
                      padding: "6px 10px",
                      borderRadius: "4px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.85em",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: "160px",
                      }}
                    >
                      {movie ? movie.title : `Unknown ID: ${id}`}
                    </span>
                    <button
                      onClick={() => onRestoreMovie(id)}
                      style={{
                        background: "var(--lb-green)",
                        color: "#000",
                        border: "none",
                        borderRadius: "4px",
                        padding: "4px 8px",
                        fontSize: "0.75em",
                        cursor: "pointer",
                        fontWeight: "bold",
                      }}
                    >
                      Restore
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

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
          <p style={{ fontSize: "0.9em", color: "var(--lb-text-secondary)" }}>
            Letterboxd export ZIP or CSV
          </p>
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
          <label className="checkbox-label" style={{ fontSize: "0.95em" }}>
            <input
              type="checkbox"
              checked={showAllScreenings}
              onChange={(e) =>
                onToggleShowAllScreenings &&
                onToggleShowAllScreenings(e.target.checked)
              }
              style={{ accentColor: "var(--lb-green)" }}
            />
            Show All Screenings
          </label>
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

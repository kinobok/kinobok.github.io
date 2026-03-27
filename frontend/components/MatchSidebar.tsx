"use client";

import { useState } from "react";
import { parseWatchlist } from "../utils/csv_parser";

interface MatchSidebarProps {
  matches: any[];
  visibleChains: string[];
  onWatchlistUpload: (uris: string[]) => void;
  onToggleChain: (chain: string) => void;
}

export default function MatchSidebar({
  matches,
  visibleChains,
  onWatchlistUpload,
  onToggleChain,
}: MatchSidebarProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const watchlistUris = parseWatchlist(text);
    onWatchlistUpload(watchlistUris);
  };

  const chains = ["Multikino", "Cinema City", "Helios"];

  return (
    <div
      style={{
        width: "350px",
        height: "100%",
        background: "#fff",
        padding: "20px",
        overflowY: "auto",
        borderRight: "1px solid #ccc",
      }}
    >
      <h2>kinꚘbok Warsaw</h2>
      <p style={{ fontSize: "0.9em", color: "#666" }}>
        Upload your Letterboxd watchlist (CSV) to find matches in Warsaw.
      </p>

      <input type="file" accept=".csv" onChange={handleFileUpload} />

      <div style={{ marginTop: "20px" }}>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          style={{
            background: "none",
            border: "none",
            color: "#0070f3",
            cursor: "pointer",
            padding: 0,
            fontSize: "0.9em",
            textDecoration: "underline",
          }}
        >
          {showAdvanced ? "Hide" : "Show"} Advanced Filters
        </button>

        {showAdvanced && (
          <div
            style={{
              marginTop: "10px",
              padding: "10px",
              background: "#f9f9f9",
              borderRadius: "4px",
              fontSize: "0.9em",
            }}
          >
            <strong>Include big chains:</strong>
            {chains.map((chain) => (
              <div key={chain} style={{ marginTop: "5px" }}>
                <label style={{ display: "flex", alignItems: "center" }}>
                  <input
                    type="checkbox"
                    checked={visibleChains.includes(chain)}
                    onChange={() => onToggleChain(chain)}
                    style={{ marginRight: "8px" }}
                  />
                  {chain === "Cinema City" ? "Cinema City / IMAX" : chain}
                </label>
              </div>
            ))}
            <p style={{ fontSize: "0.8em", color: "#888", marginTop: "10px" }}>
              Independent cinemas are always visible.
            </p>
          </div>
        )}
      </div>

      {!showAdvanced && (
        <p style={{ fontSize: "0.8em", color: "#888", marginTop: "10px" }}>
          Showing local independent cinemas {visibleChains.includes("Helios") && "& Helios"}.
        </p>
      )}

      {matches.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h3>Matches Found ({matches.length})</h3>
          {matches.map((match) => (
            <div
              key={match.id}
              style={{
                marginBottom: "15px",
                borderBottom: "1px solid #eee",
                paddingBottom: "10px",
              }}
            >
              <strong>{match.title}</strong>
              <div style={{ fontSize: "0.9em", color: "#666" }}>
                {match.showtimes.map((s: any, idx: number) => (
                  <div key={idx}>
                    {s.cinema}: {s.times.join(", ")}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

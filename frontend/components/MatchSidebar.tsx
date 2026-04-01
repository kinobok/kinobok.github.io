"use client";

import { useState, useEffect } from "react";
import { parseWatchlist } from "../utils/csv_parser";
import { Match } from "../utils/matching_logic";

interface MatchSidebarProps {
  matches: Match[];
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
  const [sheetState, setSheetState] = useState<'collapsed' | 'partial' | 'expanded'>('partial');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleCycleState = () => {
    if (!isMobile) return;
    setSheetState(prev => {
      if (prev === 'collapsed') return 'partial';
      if (prev === 'partial') return 'expanded';
      return 'collapsed';
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const watchlistUris = parseWatchlist(text);
    onWatchlistUpload(watchlistUris);
  };

  const chains = ["Multikino", "Cinema City", "Helios"];

  const sheetClass = isMobile ? `bottom-sheet ${sheetState}` : "";

  return (
    <div
      className={sheetClass}
      style={{
        width: isMobile ? "100%" : "350px",
        height: "100%",
        background: "#fff",
        padding: "20px",
        overflowY: "auto",
        borderRight: isMobile ? "none" : "1px solid #ccc",
      }}
    >
      <div className="drag-handle" onClick={handleCycleState} />
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

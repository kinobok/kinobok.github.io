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
        background: "var(--lb-sidebar)",
        color: "var(--lb-text-primary)",
        padding: "20px",
        overflowY: "auto",
        borderRight: isMobile ? "none" : "1px solid var(--lb-card)",
      }}
    >
      <div className="drag-handle" onClick={handleCycleState} />
      <h2 style={{ color: "var(--lb-text-primary)", borderBottom: "1px solid var(--lb-card)", paddingBottom: "10px" }}>kinꚘbok Warsaw</h2>
      <p style={{ fontSize: "0.9em", color: "var(--lb-text-secondary)" }}>
        Upload your Letterboxd watchlist (CSV) to find matches in Warsaw.
      </p>

      <div style={{ background: "var(--lb-card)", padding: "10px", borderRadius: "4px", marginBottom: "20px" }}>
        <input 
          type="file" 
          accept=".csv" 
          onChange={handleFileUpload}
          style={{ fontSize: "0.8em", width: "100%" }}
        />
      </div>

      <div style={{ marginTop: "10px" }}>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          style={{
            background: "none",
            border: "none",
            color: "var(--lb-blue)",
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
              background: "var(--lb-card)",
              borderRadius: "4px",
              fontSize: "0.9em",
            }}
          >
            <strong style={{ color: "var(--lb-orange)" }}>Include big chains:</strong>
            {chains.map((chain) => (
              <div key={chain} style={{ marginTop: "5px" }}>
                <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={visibleChains.includes(chain)}
                    onChange={() => onToggleChain(chain)}
                    style={{ marginRight: "8px", accentColor: "var(--lb-green)" }}
                  />
                  {chain === "Cinema City" ? "Cinema City / IMAX" : chain}
                </label>
              </div>
            ))}
            <p style={{ fontSize: "0.8em", color: "var(--lb-text-secondary)", marginTop: "10px" }}>
              Independent cinemas are always visible.
            </p>
          </div>
        )}
      </div>

      {!showAdvanced && (
        <p style={{ fontSize: "0.8em", color: "var(--lb-text-secondary)", marginTop: "10px" }}>
          Showing local independent cinemas {visibleChains.includes("Helios") && "& Helios"}.
        </p>
      )}

      {matches.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h3 style={{ fontSize: "1.1em", color: "var(--lb-text-primary)", marginBottom: "15px" }}>
            Matches Found ({matches.length})
          </h3>
          {matches.map((match) => (
            <div
              key={match.id}
              style={{
                display: "flex",
                gap: "12px",
                marginBottom: "16px",
                padding: "8px",
                background: "var(--lb-card)",
                borderRadius: "4px",
                border: "1px solid transparent",
                transition: "border-color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--lb-green)")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "transparent")}
            >
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
                  flexShrink: 0 
                }}
                onError={(e) => { (e.target as HTMLImageElement).src = "/poster-placeholder.svg"; }}
              />
              <div style={{ overflow: "hidden" }}>
                <div style={{ fontWeight: "bold", fontSize: "0.95em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  <a href={match.boxd_uri} target="_blank" rel="noopener noreferrer" style={{ color: "var(--lb-text-primary)", textDecoration: "none" }}>
                    {match.title}
                  </a>
                </div>
                <div style={{ fontSize: "0.85em", color: "var(--lb-text-secondary)", marginTop: "4px" }}>
                  {match.showtimes.map((s, idx) => (
                    <div key={idx} style={{ marginBottom: "2px" }}>
                      <span style={{ color: "var(--lb-orange)" }}>{s.cinema}</span>: {s.times.join(", ")}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

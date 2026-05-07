"use client";

import { useState, useEffect } from "react";
import { Match } from "../utils/matching_logic";

interface MatchSidebarProps {
  matches: Match[];
  isExpanded: boolean;
  onToggleExpand: (expanded: boolean) => void;
}

export default function MatchSidebar({
  matches,
  isExpanded,
  onToggleExpand,
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
                <span style={{fontSize: 20}}>⌄</span> {/*ChevronDown*/}
              </button>
            ) : (
              <div
                style={{
                  width: "40px",
                  height: "4px",
                  background: "var(--lb-card)",
                  borderRadius: "2px",
                  marginBottom: 20
                }}
              />
            )}
          </div>
        )}

        <div
          style={{
            marginTop: isMobile && isExpanded ? "40px" : !isMobile && !isExpanded ? "70px" : "0px",
            textAlign: "left",
          }}
        >
          <h3
            style={{
              fontSize: "1.1em",
              color: "var(--lb-text-primary)",
              margin: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: isMobile ? "center" : "flex-start",
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

          
            <div style={{ marginTop: "20px" }}>
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
                    <div style={{ overflow: "hidden" }}>
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

        </div>
      </div>
    </div>
  );
}

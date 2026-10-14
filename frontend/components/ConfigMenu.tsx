"use client";

import React, { useMemo, useState } from "react";
import { Cinema, Movie } from "../utils/matching_logic";
import { ChevronDown, ChevronUp, Search } from "lucide-react";

interface ConfigMenuProps {
  isOpen: boolean;
  onClose: () => void;
  visibleChains: string[];
  onToggleChain: (chain: string) => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  allCinemas?: Cinema[];
  excludedCinemaIds?: string[];
  onToggleCinema?: (cinemaId: string) => void;
  onToggleCinemas?: (cinemaIds: string[]) => void;
  excludedMovieIds?: string[];
  allMovies?: Movie[];
  onRestoreMovie?: (movieId: string) => void;
  showAllScreenings?: boolean;
  onToggleShowAllScreenings?: (val: boolean) => void;
  sortBy?: string;
  onSortChange?: (newSortBy: string) => void;
  onDashboardToggle?: () => void;
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
  onToggleCinemas,
  excludedMovieIds = [],
  allMovies = [],
  onRestoreMovie,
  showAllScreenings = false,
  onToggleShowAllScreenings,
  sortBy,
  onSortChange,
  onDashboardToggle,
}: ConfigMenuProps) {
  const [activeTab, setActiveTab] = useState<string>("Upload");
  const [cinemaSearchQuery, setCinemaSearchQuery] = useState<string>("");
  const [expandedCities, setExpandedCities] = useState<Record<string, boolean>>(
    {},
  );
  const chains = ["Multikino", "Cinema City", "Helios"];

  const toggleCityExpand = (city: string) => {
    setExpandedCities((prev) => ({
      ...prev,
      [city]: prev[city] === false ? true : false,
    }));
  };

  // Group cinemas by city for display
  const cinemasByCity = useMemo(() => {
    const grouped: Record<string, Cinema[]> = {};
    allCinemas.forEach((c) => {
      const city = c.city || "Other";
      if (!grouped[city]) {
        grouped[city] = [];
      }
      grouped[city].push(c);
    });
    return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b, "pl"));
  }, [allCinemas]);

  const filteredCinemasByCity = useMemo(() => {
    const q = cinemaSearchQuery.trim().toLowerCase();
    if (!q) return cinemasByCity;

    const result: [string, Cinema[]][] = [];
    for (const [city, cityCinemas] of cinemasByCity) {
      if (city.toLowerCase().includes(q)) {
        result.push([city, cityCinemas]);
      } else {
        const matched = cityCinemas.filter((c) =>
          c.name.toLowerCase().includes(q),
        );
        if (matched.length > 0) {
          result.push([city, matched]);
        }
      }
    }
    return result;
  }, [cinemasByCity, cinemaSearchQuery]);

  const allCitiesCollapsed = useMemo(() => {
    if (filteredCinemasByCity.length === 0) return false;
    return filteredCinemasByCity.every(
      ([city]) => expandedCities[city] === false,
    );
  }, [filteredCinemasByCity, expandedCities]);

  const toggleFoldAllCities = () => {
    if (allCitiesCollapsed) {
      setExpandedCities({});
    } else {
      const allCollapsed: Record<string, boolean> = {};
      filteredCinemasByCity.forEach(([city]) => {
        allCollapsed[city] = false;
      });
      setExpandedCities(allCollapsed);
    }
  };

  return (
    <div
      className={`config-menu-drawer-overlay ${isOpen ? "active" : ""}`}
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: isOpen ? "rgba(0, 0, 0, 0.5)" : "rgba(0, 0, 0, 0)",
        zIndex: 1300,
        pointerEvents: isOpen ? "auto" : "none",
        transition: "background 0.3s ease-in-out",
      }}
    >
      <div
        className={`config-menu-drawer ${isOpen ? "open" : ""}`}
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          width: "390px",
          maxWidth: "100%",
          background: "var(--lb-sidebar)",
          padding: "20px",
          boxShadow: "2px 0 10px rgba(0, 0, 0, 0.5)",
          transform: isOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.3s ease-in-out",
          overflowY: "auto",
          boxSizing: "border-box",
        }}
      >
        <div className="config-menu-header">
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              textAlign: "center",
              alignItems: "center",
              gap: "12px",
              width: "100%",
            }}
          >
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
          <button className="icon-button" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Tab Bar */}
        <div
          style={{
            display: "flex",
            gap: "5px",
            marginBottom: "15px",
            borderBottom: "1px solid var(--lb-card, #2c3440)",
            paddingBottom: "10px",
          }}
        >
          {["Upload", "Cinemas", "Excluded Movies", "Other"].map((tab) => (
            <button
              key={tab}
              className={`tab-button ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1,
                padding: "8px 4px",
                background:
                  activeTab === tab ? "var(--lb-blue)" : "var(--lb-card)",
                color: activeTab === tab ? "#000" : "var(--lb-text-primary)",
                border: "none",
                borderRadius: "4px",
                fontSize: "0.8em",
                cursor: "pointer",
                fontWeight: "bold",
                transition: "background 0.2s, color 0.2s",
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Panel Content */}
        {activeTab === "Upload" && (
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
            Upload your data:
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
        )}

        {activeTab === "Cinemas" && (
          <>
            <div className="config-section">
              <h3>Chain Visibility</h3>
              <p
                style={{
                  fontSize: "0.9em",
                  color: "var(--lb-text-secondary)",
                }}
              >
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
                <h3>Cinemas by City</h3>
                <p
                  style={{
                    fontSize: "0.9em",
                    color: "var(--lb-text-secondary)",
                    marginBottom: "10px",
                  }}
                >
                  Toggle entire cities or individual locations on/off:
                </p>

                {/* City/Cinema search input */}
                <div style={{ position: "relative", marginBottom: "12px" }}>
                  <input
                    type="text"
                    placeholder="Search city or cinema..."
                    value={cinemaSearchQuery}
                    onChange={(e) => setCinemaSearchQuery(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      paddingLeft: "32px",
                      paddingRight: cinemaSearchQuery ? "28px" : "12px",
                      background: "var(--lb-card)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: "6px",
                      color: "var(--lb-text-primary)",
                      fontSize: "0.85em",
                      boxSizing: "border-box",
                    }}
                  />
                  <Search
                    size={14}
                    style={{
                      position: "absolute",
                      left: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "var(--lb-text-secondary)",
                      pointerEvents: "none",
                    }}
                  />
                  {cinemaSearchQuery && (
                    <button
                      onClick={() => setCinemaSearchQuery("")}
                      style={{
                        position: "absolute",
                        right: "8px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        color: "var(--lb-text-secondary)",
                        cursor: "pointer",
                        fontSize: "0.85em",
                        padding: "2px",
                      }}
                    >
                      ✕
                    </button>
                  )}
                </div>

                {filteredCinemasByCity.length > 1 && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "8px",
                      padding: "0 2px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.8em",
                        color: "var(--lb-text-secondary)",
                      }}
                    >
                      {filteredCinemasByCity.length} cities
                    </span>
                    <button
                      onClick={toggleFoldAllCities}
                      className="fold-all-button"
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--lb-blue, #40bcf4)",
                        cursor: "pointer",
                        fontSize: "0.8em",
                        padding: "2px 4px",
                        borderRadius: "4px",
                        fontWeight: "bold",
                      }}
                    >
                      {allCitiesCollapsed ? "Unfold all" : "Fold all"}
                    </button>
                  </div>
                )}

                {filteredCinemasByCity.map(([city, cityCinemas]) => {
                  const cityCinemaIds = cityCinemas.map((c) => c.id);
                  const activeCount = cityCinemaIds.filter(
                    (id) => !excludedCinemaIds.includes(id),
                  ).length;
                  const isAllActive = activeCount === cityCinemaIds.length;
                  const isNoneActive = activeCount === 0;
                  const isExpanded =
                    !!cinemaSearchQuery || expandedCities[city] !== false;

                  const handleCityToggle = () => {
                    if (onToggleCinemas) {
                      onToggleCinemas(cityCinemaIds);
                    } else if (onToggleCinema) {
                      if (isAllActive) {
                        cityCinemaIds.forEach((id) => {
                          if (!excludedCinemaIds.includes(id))
                            onToggleCinema(id);
                        });
                      } else {
                        cityCinemaIds.forEach((id) => {
                          if (excludedCinemaIds.includes(id))
                            onToggleCinema(id);
                        });
                      }
                    }
                  };

                  return (
                    <div key={city} style={{ marginBottom: "8px" }}>
                      <div
                        onClick={() => toggleCityExpand(city)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "6px 8px",
                          background: "rgba(255, 255, 255, 0.04)",
                          borderRadius: "6px",
                          marginBottom: "4px",
                          cursor: "pointer",
                          userSelect: "none",
                        }}
                      >
                        <label
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            fontWeight: "bold",
                            fontSize: "0.9em",
                            color: "var(--lb-orange)",
                            cursor: "pointer",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isAllActive}
                            ref={(el) => {
                              if (el)
                                el.indeterminate =
                                  !isAllActive && !isNoneActive;
                            }}
                            onChange={handleCityToggle}
                            style={{ accentColor: "var(--lb-green)" }}
                          />
                          {city}
                        </label>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "0.8em",
                              color: "var(--lb-text-secondary)",
                            }}
                          >
                            {activeCount}/{cityCinemaIds.length} active
                          </span>
                          {isExpanded ? (
                            <ChevronUp
                              size={14}
                              style={{ color: "var(--lb-text-secondary)" }}
                            />
                          ) : (
                            <ChevronDown
                              size={14}
                              style={{ color: "var(--lb-text-secondary)" }}
                            />
                          )}
                        </div>
                      </div>
                      {isExpanded && (
                        <div
                          style={{ paddingLeft: "26px", marginBottom: "8px" }}
                        >
                          {cityCinemas.map((c) => (
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
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {activeTab === "Excluded Movies" && (
          <div className="config-section">
            <h3>Excluded Movies</h3>
            {excludedMovieIds.length > 0 && onRestoreMovie ? (
              <>
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
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
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
              </>
            ) : (
              <p
                style={{
                  fontSize: "0.9em",
                  color: "var(--lb-text-secondary)",
                }}
              >
                No movies excluded yet. You can hide movies by clicking the
                eye-hide button in the matches sidebar.
              </p>
            )}
          </div>
        )}

        {activeTab === "Other" && (
          <>
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
                Enable to see every movie playing. Disable to focus strictly on
                your Letterboxd watchlist.
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
                    <option value="most-screenings">
                      Most Screenings First
                    </option>
                    <option value="alpha-asc">Title (A-Z)</option>
                    <option value="alpha-desc">Title (Z-A)</option>
                  </select>
                )}
              </div>
            </div>

            {onDashboardToggle && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDashboardToggle();
                }}
                className="dashboard-button"
                style={{
                  width: "100%",
                  padding: "12px",
                  background: "var(--lb-green)",
                  color: "black",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "0.9em",
                  marginTop: "30px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  transition: "opacity 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                📊 Scrape Dashboard
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

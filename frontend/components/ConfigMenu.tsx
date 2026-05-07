"use client";

import { X } from "lucide-react";
import React from "react";

interface ConfigMenuProps {
  isOpen: boolean;
  onClose: () => void;
  visibleChains: string[];
  onToggleChain: (chain: string) => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
}

export default function ConfigMenu({
  isOpen,
  onClose,
  visibleChains,
  onToggleChain,
  handleFileUpload,
}: ConfigMenuProps) {
  const chains = ["Multikino", "Cinema City", "Helios"];

  if (!isOpen) return null;

  return (
    <div className="config-menu-overlay" onClick={onClose}>
      <div className="config-menu-content" onClick={(e) => e.stopPropagation()}>
        <div className="config-menu-header">
          <h2 style={{ margin: 0 }}>kinꚘbok Warsaw</h2>
          <button className="icon-button" onClick={onClose}>
            <X size={24} />
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
          <h3>Advanced Filters</h3>
          <p style={{ fontSize: "0.9em", color: "var(--lb-text-secondary)" }}>
            Include big chains:
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
            Independent cinemas are always visible.
          </p>
        </div>
      </div>
    </div>
  );
}

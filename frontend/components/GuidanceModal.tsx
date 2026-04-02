"use client";

interface GuidanceModalProps {
  onClose: () => void;
}

export default function GuidanceModal({ onClose }: GuidanceModalProps) {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 style={{ color: "var(--lb-text-primary)", marginBottom: "15px" }}>
          Find your Letterboxd watchlist in Warsaw
        </h2>
        <p style={{ color: "var(--lb-text-secondary)", lineHeight: "1.6", marginBottom: "20px" }}>
          To see which movies from your watchlist are playing in Warsaw, you need your Letterboxd data.
        </p>
        <div style={{ marginBottom: "20px" }}>
          <a
            href="https://letterboxd.com/data/export/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "var(--lb-blue)",
              textDecoration: "underline",
              display: "block",
              marginBottom: "10px",
              fontSize: "1.1em"
            }}
          >
            1. Export your data from Letterboxd
          </a>
          <p style={{ fontSize: "0.9em", color: "var(--lb-text-secondary)" }}>
            Once you have the ZIP file, just upload it here. We'll find your <strong>watchlist.csv</strong> automatically.
          </p>
        </div>
        <button className="modal-button" onClick={onClose}>
          Got it, let's go!
        </button>
      </div>
    </div>
  );
}

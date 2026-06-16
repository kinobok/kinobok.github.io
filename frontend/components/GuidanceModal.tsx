import React, { useRef, useState } from "react";
import { Upload, X, MapPin, Eye, FileSpreadsheet } from "lucide-react";

interface GuidanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File) => void;
  onBrowseWithoutWatchlist: () => void;
  error?: string;
  isProcessing?: boolean;
}

const GuidanceModal: React.FC<GuidanceModalProps> = ({
  isOpen,
  onClose,
  onUpload,
  onBrowseWithoutWatchlist,
  error,
  isProcessing = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUpload(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content onboarding-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "550px" }}
      >
        <div className="modal-header">
          <div className="brand-logo-container">
            <h2>Welcome to kinꚘbok</h2>
            <p className="brand-tagline">Privacy-first Warsaw cinema matching</p>
          </div>
          <button className="close-button" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="onboarding-steps">
            <h3>How it works:</h3>
            <ol className="steps-list">
              <li>
                <span className="step-num">1</span>
                <div>
                  <strong>Get your Watchlist:</strong> Export your data on{" "}
                  <a
                    href="https://letterboxd.com/settings/data/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="onboarding-link"
                  >
                    Letterboxd Import/Export
                  </a>
                  .
                </div>
              </li>
              <li>
                <span className="step-num">2</span>
                <div>
                  <strong>Upload file:</strong> Drop your exported{" "}
                  <code>.zip</code> file or the extracted{" "}
                  <code>watchlist.csv</code> here.
                </div>
              </li>
              <li>
                <span className="step-num">3</span>
                <div>
                  <strong>Explore Warsaw:</strong> See which of your watchlist
                  movies are playing today or this week on the map!
                </div>
              </li>
            </ol>
          </div>

          <div
            className={`upload-dropzone ${isDragging ? "dragging" : ""} ${
              error ? "has-error" : ""
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={triggerFileInput}
            style={{
              border: "2px dashed var(--border-color, #444)",
              borderRadius: "8px",
              padding: "32px 20px",
              textAlign: "center",
              cursor: "pointer",
              backgroundColor: isDragging
                ? "rgba(224, 86, 36, 0.08)"
                : "rgba(30, 30, 30, 0.4)",
              transition: "all 0.2s ease",
              marginTop: "20px",
              marginBottom: "20px",
            }}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".csv,.zip"
              style={{ display: "none" }}
              disabled={isProcessing}
            />

            <div className="dropzone-content" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
              <div
                className="upload-icon-container"
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(224, 86, 36, 0.1)",
                  color: "var(--accent-color, #e05624)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Upload size={24} />
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: 500, fontSize: "15px" }}>
                  {isProcessing ? "Processing..." : "Click or drag Letterboxd export here"}
                </p>
                <p
                  style={{
                    margin: "4px 0 0 0",
                    fontSize: "12px",
                    color: "var(--text-muted, #888)",
                  }}
                >
                  Supports .zip or watchlist.csv
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div
              className="error-message"
              style={{
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                borderLeft: "4px solid #ef4444",
                padding: "10px 14px",
                borderRadius: "4px",
                fontSize: "13px",
                color: "#f87171",
                marginBottom: "20px",
                display: "flex",
                alignItems: "flex-start",
                gap: "8px",
              }}
            >
              <span style={{ fontWeight: "bold" }}>⚠️</span>
              <p style={{ margin: 0, lineHeight: 1.4 }}>{error}</p>
            </div>
          )}

          <div
            className="onboarding-actions"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              alignItems: "center",
              marginTop: "10px",
            }}
          >
            <button
              className="btn btn-secondary"
              onClick={onBrowseWithoutWatchlist}
              style={{
                width: "100%",
                padding: "10px 16px",
                borderRadius: "6px",
                fontWeight: 500,
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                cursor: "pointer",
              }}
            >
              <Eye size={16} />
              Browse without watchlist (Show all screenings)
            </button>

            <button
              className="btn btn-link"
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                color: "var(--text-muted, #888)",
                fontSize: "13px",
                textDecoration: "underline",
                cursor: "pointer",
                padding: "4px",
              }}
            >
              Dismiss instructions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuidanceModal;

import React, { useRef, useState } from "react";
import { Upload, Eye } from "lucide-react";

interface GuidanceModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onUpload: (file: File) => void;
  onBrowseWithoutWatchlist: () => void;
  error?: string;
  isProcessing?: boolean;
}

const GuidanceModal: React.FC<GuidanceModalProps> = ({
  isOpen,
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
    <div className="modal-overlay">
      <div
        className="modal-content onboarding-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "550px" }}
      >
        <div
          className="modal-header"
          style={{
            display: "flex",
            alignItems: "center",
            borderBottom: "1px solid var(--lb-card)",
            paddingBottom: "16px",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              display: "block",
              justifyContent: "center",
              textAlign: "center",
              alignItems: "center",
              gap: "12px",
              width: "-moz-available",
            }}
          >
            <svg
              width="100px"
              height="100px"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              style={{ flexShrink: 0 }}
            >
              <path
                fill="var(--lb-blue)"
                stroke="var(--lb-orange)"
                fillRule="evenodd"
                d="M12.6577283,22.7532553 L12,23.3275712 L11.3422717,22.7532553 C5.81130786,17.9237218 3,13.70676 3,10 C3,4.7506636 7.09705254,1 12,1 C16.9029475,1 21,4.7506636 21,10 C21,13.70676 18.1886921,17.9237218 12.6577283,22.7532553 Z M5,10 C5,12.8492324 7.30661202,16.4335466 12,20.6634039 C16.693388,16.4335466 19,12.8492324 19,10 C19,5.8966022 15.8358849,3 12,3 C8.16411512,3 5,5.8966022 5,10 Z"
              />
              <g
                transform="translate(8.2, 6.2) scale(0.32)"
                stroke="var(--lb-green)"
                fill="var(--lb-sidebar)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
                <line x1="7" y1="2" x2="7" y2="22" />
                <line x1="17" y1="2" x2="17" y2="22" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <line x1="2" y1="7" x2="7" y2="7" />
                <line x1="2" y1="17" x2="7" y2="17" />
                <line x1="17" y1="17" x2="22" y2="17" />
                <line x1="17" y1="7" x2="22" y2="7" />
              </g>
            </svg>
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
        </div>

        <div className="modal-body">
          <div className="onboarding-steps">
            <ol className="steps-list">
              <li>
                <div>
                  <strong>Get your Watchlist:</strong> Download your data{" "}
                  <a
                    href="https://letterboxd.com/data/export/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="modal-export-link"
                  >
                    from Letterboxd data export
                  </a>
                </div>
              </li>
              <li>
                <div>
                  <strong>Upload:</strong> Drop your exported <code>.zip</code>{" "}
                  file down below.
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
                ? "rgba(36, 224, 42, 0.08)"
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

            <div
              className="dropzone-content"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <div
                className="upload-icon-container"
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  backgroundColor: "var(--lb-card)",
                  color: "var(--lb-green)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Upload size={24} />
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: 500, fontSize: "15px" }}>
                  {isProcessing
                    ? "Processing..."
                    : "Click or drag Letterboxd export here"}
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
              Browse without watchlist
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuidanceModal;

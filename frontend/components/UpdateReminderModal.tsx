import React from "react";
import { Upload, X, ExternalLink, Calendar } from "lucide-react";

interface UpdateReminderModalProps {
  isOpen: boolean;
  lastUploadDate: string;
  onClose: () => void;
  onUpload: (file: File) => void;
}

const UpdateReminderModal: React.FC<UpdateReminderModalProps> = ({
  isOpen,
  lastUploadDate,
  onClose,
  onUpload,
}) => {
  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUpload(e.target.files[0]);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ cursor: "pointer" }}>
      <div
        className="modal-content onboarding-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "550px", cursor: "default", position: "relative" }}
      >
        <button
          className="modal-close-btn"
          onClick={onClose}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            background: "none",
            border: "none",
            color: "var(--text-muted, #888)",
            cursor: "pointer",
            padding: "4px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          aria-label="Close"
        >
          <X size={18} />
        </button>

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
          <div style={{ textAlign: "center", width: "100%" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                backgroundColor: "rgba(255, 128, 0, 0.1)",
                color: "var(--lb-orange, #ff8000)",
                marginBottom: "12px",
              }}
            >
              <Calendar size={28} />
            </div>
            <h2
              style={{
                margin: 0,
                color: "var(--lb-text-primary)",
                fontSize: "22px",
                fontWeight: "bold",
              }}
            >
              Time to Update Your Watchlist?
            </h2>
          </div>
        </div>

        <div className="modal-body" style={{ color: "var(--lb-text-primary)" }}>
          <p
            style={{
              fontSize: "14px",
              lineHeight: "1.5",
              color: "var(--lb-text-primary)",
              marginBottom: "16px",
              textAlign: "center",
            }}
          >
            Your current watchlist was last uploaded on <strong>{lastUploadDate}</strong>. Since cinema showtimes change weekly, keeping your watchlist fresh ensures you never miss the latest matches!
          </p>

          <div className="onboarding-steps" style={{ marginBottom: "24px" }}>
            <h3
              style={{
                fontSize: "14px",
                fontWeight: 600,
                color: "var(--lb-text-primary)",
                marginBottom: "10px",
              }}
            >
              How to update:
            </h3>
            <ol className="steps-list" style={{ paddingLeft: "20px", margin: 0 }}>
              <li style={{ fontSize: "13px", marginBottom: "8px", lineHeight: "1.4" }}>
                Export your fresh watchlist{" "}
                <a
                  href="https://letterboxd.com/data/export/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="modal-export-link"
                  style={{
                    color: "var(--lb-blue, #40bcf4)",
                    textDecoration: "underline",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "2px",
                  }}
                >
                  from Letterboxd
                  <ExternalLink size={12} />
                </a>
              </li>
              <li style={{ fontSize: "13px", lineHeight: "1.4" }}>
                Upload the new <code>.zip</code> or <code>watchlist.csv</code> file below.
              </li>
            </ol>
          </div>

          <div
            className="onboarding-actions"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              alignItems: "center",
            }}
          >
            <input
              type="file"
              id="reminder-watchlist-file-upload"
              onChange={handleFileChange}
              accept=".csv,.zip"
              style={{ display: "none" }}
            />

            <label
              htmlFor="reminder-watchlist-file-upload"
              className="btn btn-primary"
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "12px 16px",
                borderRadius: "6px",
                fontWeight: 600,
                fontSize: "14px",
                backgroundColor: "var(--lb-green, #00c030)",
                color: "#fff",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                cursor: "pointer",
              }}
            >
              <Upload size={16} />
              Upload New Watchlist
            </label>

            <button
              className="btn btn-secondary"
              onClick={onClose}
              style={{
                width: "100%",
                padding: "10px 16px",
                borderRadius: "6px",
                fontWeight: 500,
                fontSize: "14px",
                border: "1px solid var(--border-color, #444)",
                backgroundColor: "transparent",
                color: "var(--lb-text-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              Remind Me Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateReminderModal;

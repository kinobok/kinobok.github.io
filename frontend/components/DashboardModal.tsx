import React from "react";
import { Metadata } from "../utils/matching_logic";

interface DashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  metadata?: Metadata;
}

const DashboardModal: React.FC<DashboardModalProps> = ({
  isOpen,
  onClose,
  metadata,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Scrape Dashboard</h2>
          <button className="close-button" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="modal-body">
          {metadata ? (
            <div className="dashboard-stats">
              <div className="stat-item">
                <span className="stat-label">Last Scrape:</span>
                <span className="stat-value">
                  {new Date(metadata.last_scrape).toLocaleString()}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Total Movies Matched:</span>
                <span className="stat-value">{metadata.total_movies}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Available Days:</span>
                <span className="stat-value">
                  {metadata.available_dates.length} days
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: "20px",
                  marginBottom: "8px",
                  flexWrap: "wrap",
                  gap: "8px",
                }}
              >
                <h3 style={{ margin: 0 }}>
                  Failed Scrapings ({metadata.failures.length})
                </h3>
                <a
                  href="https://github.com/kinobok/kinobok.github.io/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="report-issue-link"
                  style={{
                    color: "var(--lb-orange, #ff8000)",
                    fontSize: "0.85em",
                    textDecoration: "none",
                    fontWeight: 600,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  Report Issue on GitHub ↗
                </a>
              </div>
              {metadata.failures.length > 0 ? (
                <ul className="failure-list">
                  {metadata.failures.map((failure, index) => (
                    <li key={index} className="failure-item">
                      <div className="failure-title">{failure.title}</div>
                      <div className="failure-reason">{failure.reason}</div>
                      {failure.details && (
                        <div className="failure-details">{failure.details}</div>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>
                  No failures reported. All movies were successfully matched!
                </p>
              )}

              <div
                className="dashboard-modal-footer"
                style={{
                  marginTop: "24px",
                  paddingTop: "14px",
                  borderTop: "1px solid var(--lb-card, #2c3440)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "0.85em",
                  color: "var(--lb-text-secondary)",
                  flexWrap: "wrap",
                  gap: "10px",
                }}
              >
                <span>Scraper data is refreshed automatically daily.</span>
                <a
                  href="https://github.com/kinobok/kinobok.github.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="github-repo-link"
                  style={{
                    color: "var(--lb-blue, #40bcf4)",
                    textDecoration: "none",
                    fontWeight: 600,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  GitHub Repository ↗
                </a>
              </div>
            </div>
          ) : (
            <p>Loading metadata...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardModal;

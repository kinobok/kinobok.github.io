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

              <h3>Failed Scrapings ({metadata.failures.length})</h3>
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
                <p>No failures reported. All movies were successfully matched!</p>
              )}
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

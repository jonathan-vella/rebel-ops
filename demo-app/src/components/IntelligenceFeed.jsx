import "./IntelligenceFeed.css";

function IntelligenceFeed({ intelligence, loading }) {
  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Decrypting intelligence data...</p>
      </div>
    );
  }

  if (!intelligence || intelligence.length === 0) {
    return (
      <div className="empty-state">
        <p>No intelligence reports available.</p>
      </div>
    );
  }

  return (
    <div className="intelligence-feed">
      {intelligence.map((intel) => (
        <div key={intel.id} className={`intel-card intel-${intel.type}`}>
          <div className="intel-header">
            <div className="intel-meta">
              <span className={`intel-type type-${intel.type}`}>
                {getIntelTypeIcon(intel.type)} {intel.type}
              </span>
              <span className="intel-source">{intel.source}</span>
            </div>
            <time className="intel-timestamp">
              {formatTimestamp(intel.timestamp)}
            </time>
          </div>

          <div className="intel-content">
            <p>{intel.content}</p>
          </div>

          <div className="intel-footer">
            <button className="intel-action">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="currentColor"
              >
                <path d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2z" />
              </svg>
              View Details
            </button>
            <button className="intel-action">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="currentColor"
              >
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                <path d="M6.271 5.055a.5.5 0 0 1 .52.038l3.5 2.5a.5.5 0 0 1 0 .814l-3.5 2.5A.5.5 0 0 1 6 10.5v-5a.5.5 0 0 1 .271-.445z" />
              </svg>
              Share
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function getIntelTypeIcon(type) {
  switch (type) {
    case "critical":
      return "🔴";
    case "tactical":
      return "🎯";
    case "operational":
      return "📡";
    default:
      return "📋";
  }
}

function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default IntelligenceFeed;

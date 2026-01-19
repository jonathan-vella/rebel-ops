import "./MissionBriefing.css";

function MissionBriefing({ missions, loading }) {
  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Loading mission data...</p>
      </div>
    );
  }

  if (!missions || missions.length === 0) {
    return (
      <div className="empty-state">
        <p>No active missions at this time.</p>
      </div>
    );
  }

  return (
    <div className="mission-briefing">
      {missions.map((mission) => (
        <div
          key={mission.id}
          className={`mission-card priority-${mission.priority}`}
        >
          <div className="mission-header">
            <div className="mission-id">{mission.id}</div>
            <span className={`status-badge status-${mission.status}`}>
              {mission.status}
            </span>
          </div>

          <h3 className="mission-name">{mission.name}</h3>

          <div className="mission-details">
            <div className="detail-row">
              <span className="detail-label">Priority:</span>
              <span className={`detail-value priority-${mission.priority}`}>
                {mission.priority.toUpperCase()}
              </span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Agent:</span>
              <span className="detail-value">{mission.agent}</span>
            </div>
          </div>

          <div className="progress-section">
            <div className="progress-header">
              <span className="progress-label">Progress</span>
              <span className="progress-value">{mission.progress}%</span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${mission.progress}%`,
                  background: getProgressColor(mission.progress),
                }}
              ></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function getProgressColor(progress) {
  if (progress >= 75) return "linear-gradient(90deg, #00b4d8, #0077b6)";
  if (progress >= 50) return "linear-gradient(90deg, #ffd60a, #ff9500)";
  return "linear-gradient(90deg, #e81f3e, #ff6b35)";
}

export default MissionBriefing;

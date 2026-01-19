import { useState, useEffect } from "react";
import DeathStar3D from "./components/DeathStar3D";
import MissionBriefing from "./components/MissionBriefing";
import IntelligenceFeed from "./components/IntelligenceFeed";
import { fetchMissions, fetchIntelligence } from "./services/apiClient";
import "./App.css";

function App() {
  const [missions, setMissions] = useState([]);
  const [intelligence, setIntelligence] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [missionsData, intelData] = await Promise.all([
        fetchMissions(),
        fetchIntelligence(),
      ]);
      setMissions(missionsData);
      setIntelligence(intelData);
      setError(null);
    } catch (err) {
      console.error("Failed to load data:", err);
      setError(
        "Unable to establish connection with Rebel Command. Check API endpoints.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      {/* Starfield background */}
      <div className="starfield">
        {[...Array(100)].map((_, i) => (
          <div
            key={i}
            className="star"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 3}px`,
              height: `${Math.random() * 3}px`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <div className="logo-section">
            <svg
              className="rebel-logo"
              viewBox="0 0 50 50"
              width="40"
              height="40"
            >
              <path
                d="M25 5 L30 20 L45 20 L32 30 L37 45 L25 35 L13 45 L18 30 L5 20 L20 20 Z"
                fill="#e81f3e"
                stroke="#ff6b35"
                strokeWidth="2"
              />
            </svg>
            <h1>Rebel Alliance Tactical Command</h1>
          </div>
          <div className="status-bar">
            <span
              className={`status-indicator ${loading ? "loading" : "active"}`}
            ></span>
            <span className="status-text">
              {loading ? "Establishing Connection..." : "Connection Secure"}
            </span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="app-main">
        {error && (
          <div className="error-banner">
            <span className="error-icon">⚠️</span>
            <p>{error}</p>
            <button onClick={loadData} className="retry-button">
              Retry
            </button>
          </div>
        )}

        <div className="content-grid">
          {/* 3D Death Star Visualization */}
          <section className="visualization-panel">
            <div className="panel-header">
              <h2>Death Star Tactical Display</h2>
              <span className="panel-badge">LIVE</span>
            </div>
            <div className="canvas-container">
              <DeathStar3D />
            </div>
            <div className="visualization-info">
              <div className="info-item">
                <span className="info-label">Target:</span>
                <span className="info-value text-rebel">
                  DS-1 Orbital Battle Station
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Status:</span>
                <span className="info-value text-warning">Operational</span>
              </div>
              <div className="info-item">
                <span className="info-label">Threat Level:</span>
                <span className="info-value text-rebel">CRITICAL</span>
              </div>
            </div>
          </section>

          {/* Mission Briefings */}
          <section className="mission-panel">
            <div className="panel-header">
              <h2>Active Reconnaissance Missions</h2>
              <span className="panel-badge">{missions.length} ACTIVE</span>
            </div>
            <MissionBriefing missions={missions} loading={loading} />
          </section>

          {/* Intelligence Feed */}
          <section className="intelligence-panel">
            <div className="panel-header">
              <h2>Intelligence Reports</h2>
              <span className="panel-badge">CLASSIFIED</span>
            </div>
            <IntelligenceFeed intelligence={intelligence} loading={loading} />
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>
          <strong>CLASSIFIED:</strong> Rebel Alliance Tactical Infrastructure |
          Powered by{" "}
          <span className="text-tactical">Azure Static Web Apps</span> |
          Engineered by AI Agents
        </p>
        <p className="footer-disclaimer">
          ⚠️ This is a demonstration deployment. Production systems require
          authentication and enhanced security.
        </p>
      </footer>
    </div>
  );
}

export default App;

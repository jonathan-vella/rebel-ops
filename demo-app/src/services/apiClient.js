/**
 * API Client for Rebel Alliance Tactical Infrastructure
 * Handles communication with Azure Functions backend
 */

const API_BASE_URL = "/api";

/**
 * Fetch active reconnaissance missions
 * @returns {Promise<Array>} Array of mission objects
 */
export async function fetchMissions() {
  try {
    const response = await fetch(`${API_BASE_URL}/missions`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data.missions || [];
  } catch (error) {
    console.error("Failed to fetch missions:", error);

    // Return mock data for development/offline mode
    return getMockMissions();
  }
}

/**
 * Fetch intelligence reports
 * @returns {Promise<Array>} Array of intelligence objects
 */
export async function fetchIntelligence() {
  try {
    const response = await fetch(`${API_BASE_URL}/intelligence`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data.intelligence || [];
  } catch (error) {
    console.error("Failed to fetch intelligence:", error);

    // Return mock data for development/offline mode
    return getMockIntelligence();
  }
}

/**
 * Submit a field reconnaissance report
 * @param {Object} report - Report data
 * @returns {Promise<Object>} Submission result
 */
export async function submitReport(report) {
  try {
    const response = await fetch(`${API_BASE_URL}/reports`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(report),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to submit report:", error);
    throw error;
  }
}

/**
 * Mock data for development/offline mode
 */
function getMockMissions() {
  return [
    {
      id: "M-001",
      name: "Exhaust Port Reconnaissance",
      status: "active",
      priority: "critical",
      progress: 75,
      agent: "Red Squadron",
    },
    {
      id: "M-002",
      name: "Shield Generator Analysis",
      status: "active",
      priority: "high",
      progress: 45,
      agent: "Gold Squadron",
    },
    {
      id: "M-003",
      name: "Superlaser Charging Cycle Study",
      status: "pending",
      priority: "high",
      progress: 20,
      agent: "Blue Squadron",
    },
  ];
}

function getMockIntelligence() {
  return [
    {
      id: "I-001",
      type: "critical",
      source: "Bothan Spies",
      timestamp: "2026-01-19T10:30:00Z",
      content:
        "Thermal exhaust port identified - 2 meters wide, leads to main reactor",
    },
    {
      id: "I-002",
      type: "tactical",
      source: "Y-Wing Scan",
      timestamp: "2026-01-19T09:15:00Z",
      content:
        "Shield generator located on forest moon - vulnerable to ground assault",
    },
    {
      id: "I-003",
      type: "operational",
      source: "Rebel Command",
      timestamp: "2026-01-19T08:00:00Z",
      content:
        "TIE Fighter patrol patterns updated - weakness in sector 7 identified",
    },
  ];
}

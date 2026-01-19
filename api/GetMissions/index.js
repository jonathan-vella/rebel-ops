/**
 * GetMissions - Azure Function
 * Returns active Rebel Alliance reconnaissance missions
 */

module.exports = async function (context, req) {
  context.log("GetMissions function processed a request.");

  // Mock mission data - In production, this would query a database
  const missions = [
    {
      id: "M-001",
      name: "Exhaust Port Reconnaissance",
      description:
        "Analyze thermal exhaust port vulnerability - 2 meters wide, leads directly to main reactor core",
      status: "active",
      priority: "critical",
      progress: 75,
      agent: "Red Squadron",
      assignedTo: "Luke Skywalker",
      startDate: "2026-01-15T08:00:00Z",
      targetLocation: "Death Star - Equatorial Trench, Sector 7",
      objectives: [
        "Confirm exhaust port dimensions",
        "Map thermal reactor shaft",
        "Identify defensive turret positions",
        "Calculate optimal attack trajectory",
      ],
      risks: [
        "Heavy TIE Fighter presence",
        "Surface turbolaser batteries",
        "Ray-shielded trench",
      ],
    },
    {
      id: "M-002",
      name: "Shield Generator Analysis",
      description:
        "Locate and analyze planetary shield generator protecting Death Star construction",
      status: "active",
      priority: "high",
      progress: 45,
      agent: "Gold Squadron",
      assignedTo: "Lando Calrissian",
      startDate: "2026-01-16T10:30:00Z",
      targetLocation: "Forest Moon of Endor",
      objectives: [
        "Locate shield generator facility",
        "Assess Imperial ground forces",
        "Identify structural weaknesses",
        "Plan ground assault strategy",
      ],
      risks: [
        "Dense forest terrain",
        "AT-ST walker patrols",
        "Bunker fortifications",
      ],
    },
    {
      id: "M-003",
      name: "Superlaser Charging Cycle Study",
      description:
        "Monitor superlaser power systems to determine firing frequency and vulnerabilities",
      status: "pending",
      priority: "high",
      progress: 20,
      agent: "Blue Squadron",
      assignedTo: "Wedge Antilles",
      startDate: "2026-01-17T14:00:00Z",
      targetLocation:
        "Death Star - Northern Hemisphere, Superlaser Focus Array",
      objectives: [
        "Measure superlaser charge time",
        "Identify power transfer conduits",
        "Calculate reactor cooldown period",
        "Map auxiliary power systems",
      ],
      risks: [
        "Proximity to Imperial fleet",
        "Heavy sensor coverage",
        "Superlaser test firings",
      ],
    },
    {
      id: "M-004",
      name: "TIE Fighter Patrol Pattern Analysis",
      description: "Track TIE Fighter patrol routes to identify defensive gaps",
      status: "active",
      priority: "medium",
      progress: 60,
      agent: "Gray Squadron",
      assignedTo: "Biggs Darklighter",
      startDate: "2026-01-14T06:00:00Z",
      targetLocation: "Death Star Perimeter - All Sectors",
      objectives: [
        "Map patrol rotation schedules",
        "Identify blind spots in coverage",
        "Track squadron response times",
        "Analyze interceptor deployment patterns",
      ],
      risks: [
        "Long-range sensor detection",
        "Imperial patrol encounters",
        "Fuel limitations",
      ],
    },
    {
      id: "M-005",
      name: "Docking Bay Security Assessment",
      description:
        "Infiltration analysis of Death Star docking bays and hangar defenses",
      status: "completed",
      priority: "medium",
      progress: 100,
      agent: "Rogue Squadron",
      assignedTo: "Han Solo",
      startDate: "2026-01-10T12:00:00Z",
      targetLocation: "Death Star - Docking Bay 327",
      objectives: [
        "Map hangar bay layouts",
        "Identify tractor beam controls",
        "Assess Stormtrooper patrols",
        "Locate garbage compactor access points",
      ],
      risks: [
        "Detention block proximity",
        "Security checkpoint density",
        "Imperial officer presence",
      ],
      findings:
        "Tractor beam controls located. Security lighter than expected. Garbage chute escape route viable.",
    },
    {
      id: "M-006",
      name: "Death Star II Construction Progress",
      description: "Surveillance of second Death Star construction above Endor",
      status: "active",
      priority: "critical",
      progress: 85,
      agent: "Bothan Spy Network",
      assignedTo: "Mon Mothma Intelligence Division",
      startDate: "2026-01-12T00:00:00Z",
      targetLocation: "Endor System Orbital Construction Zone",
      objectives: [
        "Estimate construction completion timeline",
        "Confirm operational status claims",
        "Track Imperial fleet movements",
        "Identify Emperor's visit schedule",
      ],
      risks: [
        "Imperial deception tactics",
        "Bothan casualties",
        "Trap scenarios",
      ],
      notes: "Many Bothans died to bring us this information.",
    },
  ];

  context.res = {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "X-API-Version": "1.0",
      "X-Rebel-Alliance": "Authorized",
    },
    body: {
      success: true,
      timestamp: new Date().toISOString(),
      count: missions.length,
      missions: missions,
    },
  };
};

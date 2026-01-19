/**
 * GetIntelligence - Azure Function
 * Returns classified intelligence reports from Rebel Alliance sources
 */

module.exports = async function (context, req) {
  context.log("GetIntelligence function processed a request.");

  // Mock intelligence data - In production, this would query a secure database
  const intelligence = [
    {
      id: "I-001",
      type: "critical",
      classification: "TOP SECRET",
      source: "Bothan Spy Network",
      sourceReliability: "A", // A = Completely reliable
      timestamp: "2026-01-19T10:30:00Z",
      location: "Death Star - Equatorial Trench",
      title: "Thermal Exhaust Port Vulnerability Confirmed",
      content:
        "Thermal exhaust port identified at coordinates 7-7-3. Port measures exactly 2 meters in diameter and leads directly to main reactor core. Ray shielding does NOT protect small one-man fighters. Proton torpedo impact would trigger chain reaction resulting in complete station destruction.",
      confidence: 95,
      actionRequired: "IMMEDIATE - Assault plan required",
      relatedMissions: ["M-001"],
      attachments: ["schematic-exhaust-port.pdf", "reactor-core-diagram.pdf"],
    },
    {
      id: "I-002",
      type: "tactical",
      classification: "SECRET",
      source: "Y-Wing Long-Range Scan",
      sourceReliability: "B", // B = Usually reliable
      timestamp: "2026-01-19T09:15:00Z",
      location: "Forest Moon of Endor",
      title: "Shield Generator Located - Ground Assault Required",
      content:
        "Planetary shield generator located on forest moon. Facility houses SLD-26 shield generator with 50-kilometer protection radius. Imperial garrison estimated at 2 legions (10,000 troops). Bunker entrance vulnerable to thermal detonators. Native Ewok population may provide tactical advantage.",
      confidence: 85,
      actionRequired: "Plan commando raid to disable shields",
      relatedMissions: ["M-002", "M-006"],
      attachments: ["endor-topographic-map.pdf"],
    },
    {
      id: "I-003",
      type: "operational",
      classification: "CONFIDENTIAL",
      source: "Rebel Command Intelligence",
      sourceReliability: "A",
      timestamp: "2026-01-19T08:00:00Z",
      location: "Death Star Perimeter - Sector 7",
      title: "TIE Fighter Patrol Gap Identified",
      content:
        "Analysis of 72-hour patrol data reveals defensive weakness in Sector 7 between 0200-0400 hours station time. TIE/LN squadron rotation creates 8-minute gap with only 60% sensor coverage. Optimal entry window for attack run.",
      confidence: 90,
      actionRequired: "Schedule assault during identified window",
      relatedMissions: ["M-004"],
      attachments: ["patrol-pattern-analysis.xlsx"],
    },
    {
      id: "I-004",
      type: "strategic",
      classification: "TOP SECRET",
      source: "Imperial Defector (Admiral Raddus Network)",
      sourceReliability: "B",
      timestamp: "2026-01-19T06:45:00Z",
      location: "Imperial High Command",
      title: "Emperor to Visit Death Star II - Potential Trap",
      content:
        "Emperor Palpatine scheduled to oversee final construction phase of Death Star II. Intel suggests station may be operational earlier than reported. High probability this is deliberate leak to lure Rebel fleet into trap. Recommend extreme caution.",
      confidence: 75,
      actionRequired: "Intelligence Committee review - assess trap scenario",
      relatedMissions: ["M-006"],
      attachments: ["emperor-itinerary-leaked.pdf"],
    },
    {
      id: "I-005",
      type: "critical",
      classification: "TOP SECRET",
      source: "Princess Leia (Infiltration Mission)",
      sourceReliability: "A",
      timestamp: "2026-01-18T22:00:00Z",
      location: "Death Star - Detention Block AA-23",
      title: "Death Star Plans Secured - Technical Readout Complete",
      content:
        "Complete technical readouts acquired from Imperial data bank. Confirm presence of critical flaw in reactor thermal exhaust system. Plans transmitted to Rebel Command via R2-D2. Grand Moff Tarkin aware of breach - station security heightened.",
      confidence: 100,
      actionRequired: "URGENT - Analyze plans and execute assault immediately",
      relatedMissions: ["M-001", "M-005"],
      attachments: ["death-star-plans-complete.dat"],
    },
    {
      id: "I-006",
      type: "tactical",
      classification: "SECRET",
      source: "Rebel Starfighter Command",
      timestamp: "2026-01-18T18:30:00Z",
      location: "Yavin 4 Base",
      title: "Attack Formation Strategy - Gold Leader Recommendation",
      content:
        "Gold Leader proposes two-wave assault: Gold Squadron targets surface defenses while Red Squadron executes trench run. X-wings optimal for precision torpedo delivery. Y-wings provide cover fire. Estimate 30% fighter survival rate. May the Force be with us.",
      confidence: 80,
      actionRequired: "Finalize attack plan and brief pilots",
      relatedMissions: ["M-001", "M-004"],
      attachments: ["attack-formation-diagram.pdf"],
    },
    {
      id: "I-007",
      type: "operational",
      classification: "CONFIDENTIAL",
      source: "Logistics Division",
      timestamp: "2026-01-18T15:00:00Z",
      location: "Rebel Fleet",
      title: "Starfighter Fuel Reserves - Mission Duration Limited",
      content:
        "Current fuel reserves allow maximum 45-minute combat operations at Death Star engagement range. Recommend prioritizing quick strike over prolonged assault. Emergency fuel pods staged at rendezvous point Alpha.",
      confidence: 100,
      actionRequired: "Brief pilots on fuel constraints",
      relatedMissions: ["M-004"],
      attachments: ["fuel-logistics-report.xlsx"],
    },
    {
      id: "I-008",
      type: "critical",
      classification: "TOP SECRET",
      source: "Bothan Spy Network",
      sourceReliability: "A",
      timestamp: "2026-01-18T12:00:00Z",
      location: "Imperial Intelligence",
      title: "Many Bothans Died - Death Star II Intel Cost",
      content:
        "Confirmed loss of 14 Bothan operatives during Death Star II reconnaissance. Intelligence gathered indicates operational superlaser despite incomplete construction. Sacrifice will not be in vain - information critical to Rebel victory.",
      confidence: 95,
      actionRequired: "Honor fallen agents - use intel wisely",
      relatedMissions: ["M-006"],
      attachments: ["fallen-agents-memorial.pdf"],
    },
  ];

  // Filter by type if query parameter provided
  const typeFilter = req.query.type;
  let filteredIntelligence = intelligence;

  if (typeFilter) {
    filteredIntelligence = intelligence.filter(
      (intel) => intel.type.toLowerCase() === typeFilter.toLowerCase(),
    );
  }

  // Sort by timestamp (most recent first)
  filteredIntelligence.sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp),
  );

  context.res = {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "X-API-Version": "1.0",
      "X-Classification": "TOP SECRET // REBEL ALLIANCE EYES ONLY",
      "X-Rebel-Alliance": "Authorized",
    },
    body: {
      success: true,
      timestamp: new Date().toISOString(),
      count: filteredIntelligence.length,
      intelligence: filteredIntelligence,
      availableTypes: ["critical", "tactical", "operational", "strategic"],
    },
  };
};

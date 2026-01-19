/**
 * SubmitReport - Azure Function
 * Accepts field reconnaissance reports from Rebel Alliance agents
 */

module.exports = async function (context, req) {
  context.log("SubmitReport function processed a request.");

  // Validate request body
  if (!req.body) {
    context.res = {
      status: 400,
      body: {
        success: false,
        error: "Request body is required",
      },
    };
    return;
  }

  const report = req.body;

  // Validate required fields
  const requiredFields = ["missionId", "agentId", "content"];
  const missingFields = requiredFields.filter((field) => !report[field]);

  if (missingFields.length > 0) {
    context.res = {
      status: 400,
      body: {
        success: false,
        error: `Missing required fields: ${missingFields.join(", ")}`,
      },
    };
    return;
  }

  // Generate report ID
  const reportId = `R-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

  // In production, this would save to database
  const savedReport = {
    id: reportId,
    missionId: report.missionId,
    agentId: report.agentId,
    agentName: report.agentName || "Unknown Agent",
    content: report.content,
    type: report.type || "field-report",
    priority: report.priority || "medium",
    location: report.location || "Unknown",
    coordinates: report.coordinates || null,
    attachments: report.attachments || [],
    timestamp: new Date().toISOString(),
    status: "pending-review",
    classification: report.classification || "CONFIDENTIAL",
  };

  context.log(
    `Report ${reportId} submitted successfully by agent ${report.agentId}`,
  );

  context.res = {
    status: 201,
    headers: {
      "Content-Type": "application/json",
      "X-API-Version": "1.0",
      "X-Rebel-Alliance": "Authorized",
    },
    body: {
      success: true,
      message: "Reconnaissance report received and logged",
      report: savedReport,
      nextSteps: [
        "Report queued for Intelligence Committee review",
        "Confirmation will be transmitted to field agent",
        "Related mission status will be updated",
      ],
    },
  };
};

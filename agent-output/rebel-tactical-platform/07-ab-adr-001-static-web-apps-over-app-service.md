# ADR-001: Use Azure Static Web Apps with Managed Functions Instead of Separate App Service + Function App

**Status**: ✅ Accepted (Implemented)  
**Date**: 2026-01-20  
**Deciders**: Architecture Team, Operations Team  
**Type**: As-Built Decision Record

---

## Context

During implementation of the Rebel Tactical Platform, we needed to deploy a React-based frontend application with three serverless API endpoints (GetIntelligence, GetMissions, SubmitReport). The original design phase considered Azure App Service with a separate Azure Functions App, but during implementation we chose Azure Static Web Apps (SWA) with managed Functions.

**Original Design Phase Assumption:**

- Frontend: Azure App Service (Basic or Standard tier)
- Backend: Separate Azure Functions (Consumption or Premium plan)
- Estimated cost: Variable based on App Service tier selection

**Actual As-Built Implementation:**

- Combined: Azure Static Web Apps Standard tier
- Backend: Managed Functions (integrated within SWA)
- Actual cost: $9.00/month (fixed, Standard tier)

---

## Decision

We decided to use **Azure Static Web Apps (Standard tier)** with integrated managed Functions instead of deploying separate Azure App Service and Azure Functions resources.

**Key Decision Points:**

1. Static Web Apps Standard tier includes managed Functions at no additional cost
2. Eliminates need for separate Function App provisioning and management
3. Simplified deployment pipeline (single resource deployment)
4. Built-in global CDN included in Standard tier
5. Fixed monthly cost ($9/month) provides predictable budgeting

---

## Decision Drivers

### Cost Efficiency

- **Azure Static Web Apps Standard**: $9.00/month (fixed)
- **Alternative (App Service Basic + Functions Consumption)**: $13-20/month (variable)
- **Savings**: ~$4-11/month while meeting all functional requirements

### Operational Simplicity

- Single resource deployment reduces operational complexity
- No separate Function App configuration or management
- Unified monitoring and logging (all telemetry to same App Insights)
- Single deployment pipeline (GitHub Actions integration built-in)

### Performance Requirements

- Built-in global CDN meets latency requirements for static assets
- Managed Functions provide adequate performance for API endpoints:
  - GetIntelligence: ~0.8s response time ✅
  - GetMissions: ~0.8s response time ✅
  - SubmitReport: ~3.2s response time ✅ (acceptable for POST operations)

### Technology Alignment

- React + Vite build system natively supported by Static Web Apps
- Node.js 18 runtime available for managed Functions
- Seamless integration with GitHub repository (jonathan-vella/rebel-ops)

---

## Consequences

### Positive Consequences

✅ **Cost Predictability**

- Fixed $9/month cost (vs variable consumption-based pricing)
- No surprise bills from Function execution spikes
- Easier budget forecasting and cost management

✅ **Simplified Architecture**

- One resource instead of two (Static Web App vs App Service + Function App)
- Reduced Azure Resource Manager template complexity
- Fewer resources to monitor and maintain

✅ **Built-in Features**

- Global CDN included (no separate CDN provisioning needed)
- Staging environments available (not used yet, but available)
- Custom domain support (available for future use)
- Automatic SSL certificate management

✅ **Developer Experience**

- GitHub Actions integration built-in
- Preview environments for pull requests (available feature)
- CLI tools (Azure Static Web Apps CLI) for local development
- Hot reload and local emulation support

✅ **Security & Compliance**

- HTTPS enforced by default (no configuration needed)
- Azure-managed TLS certificates
- No public IPs to manage or secure
- Simplified network security model

### Negative Consequences / Trade-offs

⚠️ **Limited Scaling Options**

- Managed Functions have fixed scaling limits (can't tune like dedicated Function App)
- Standard tier: 500 max concurrent requests
- No ability to configure Function App scale-out rules
- **Mitigation**: Monitor usage; can upgrade to Enterprise tier ($26/month) if needed

⚠️ **Function Runtime Constraints**

- Limited to Node.js, Python, or .NET (no Java, PowerShell)
- 10-minute execution timeout (vs 30 minutes for Durable Functions)
- No support for Durable Functions or Function chaining
- **Mitigation**: Current workload fits within constraints; re-architect if requirements change

⚠️ **Vendor Lock-in**

- Static Web Apps is Azure-specific (not easily portable to other clouds)
- Managed Functions tightly coupled to Static Web App lifecycle
- **Mitigation**: Acceptable for this deployment; IaC provides re-deployment capability

⚠️ **Advanced Monitoring Limited**

- Can't configure custom Application Insights settings per Function
- Shared instrumentation key for all Functions
- No Function-level cost tracking
- **Mitigation**: Workspace-based App Insights provides adequate observability

⚠️ **Network Isolation Not Available**

- Static Web Apps Standard tier doesn't support VNet integration
- Functions cannot access private endpoints or VNet-secured resources
- No Private Link support
- **Mitigation**: Current workload doesn't require VNet connectivity; upgrade to Enterprise tier if needed

---

## Alternatives Considered

### Alternative 1: Azure App Service (Web App) + Separate Azure Functions

**Description**: Deploy React frontend to Azure App Service (Basic B1 tier) with separate Azure Functions (Consumption plan) for API endpoints.

**Pros:**

- More control over Function App configuration (scaling, networking)
- Can use VNet integration (App Service Basic tier supports VNet)
- Supports all Function runtime languages
- Independent scaling of frontend and backend

**Cons:**

- Higher cost: ~$13-20/month (B1 App Service $13 + Function consumption $0-7)
- More complex deployment (two separate resources)
- Additional operational overhead (monitoring two resources)
- Need separate CDN provisioning for global distribution

**Why Not Chosen**: Higher cost and complexity for no functional benefit given current requirements.

---

### Alternative 2: Azure Container Apps

**Description**: Deploy React frontend and API as containerized workloads to Azure Container Apps.

**Pros:**

- Modern container-based deployment
- Supports any language/runtime
- Built-in autoscaling (KEDA-based)
- Can scale to zero (cost savings)

**Cons:**

- Higher complexity (Dockerfile creation, container registry)
- Higher base cost (~$15-20/month minimum)
- Requires container expertise
- Overkill for simple static site + API

**Why Not Chosen**: Unnecessary complexity and higher cost for this workload profile.

---

### Alternative 3: Azure Static Web Apps Free Tier + Separate Azure Functions

**Description**: Use Static Web Apps Free tier for frontend, deploy Functions separately.

**Pros:**

- Free Static Web Apps tier ($0/month)
- More control over Function App configuration

**Cons:**

- Free tier limits: no staging environments, no custom domains, lower bandwidth quota
- Still need to provision separate Function App resource
- More operational complexity
- Total cost similar (~$9-12/month with Functions)

**Why Not Chosen**: Standard tier features (staging environments, higher bandwidth) worth the $9/month investment for production workload.

---

### Alternative 4: Azure Kubernetes Service (AKS)

**Description**: Deploy application to AKS cluster with ingress controller.

**Pros:**

- Ultimate flexibility and control
- Supports any workload type
- Advanced networking and security features

**Cons:**

- Extremely high cost (~$150-300/month for production cluster)
- High operational complexity (cluster management, upgrades)
- Overkill for simple web application
- Requires Kubernetes expertise

**Why Not Chosen**: Cost and complexity far exceed requirements for this workload.

---

## Implementation Notes

### Deployment Configuration

The Static Web App is configured with the following settings:

```bicep
resource staticWebApp 'Microsoft.Web/staticSites@2022-03-01' = {
  name: staticWebAppName
  location: location
  sku: {
    name: 'Standard'
    tier: 'Standard'
  }
  properties: {
    repositoryUrl: 'https://github.com/jonathan-vella/rebel-ops'
    branch: 'main'
    buildProperties: {
      appLocation: '/demo-app'
      apiLocation: '/api'
      outputLocation: 'dist'
    }
  }
}
```

### Managed Functions Integration

The three API endpoints are deployed as managed Functions:

| Function        | Method | Path                | Purpose                               | Latency |
| --------------- | ------ | ------------------- | ------------------------------------- | ------- |
| GetIntelligence | GET    | `/api/intelligence` | Retrieve Death Star intelligence data | ~0.8s   |
| GetMissions     | GET    | `/api/missions`     | Retrieve active rebel missions        | ~0.8s   |
| SubmitReport    | POST   | `/api/reports`      | Submit field intelligence reports     | ~3.2s   |

**Function Runtime Configuration:**

- Runtime: Node.js 18
- Host ID: 60c53a36bd5f42daab8c2fc4d18a1f74
- Version: 4.1044.350.0
- Max Concurrency: 500 requests
- Consecutive Errors: 0 (healthy)

### Monitoring & Observability

Application Insights telemetry configuration:

```javascript
// Instrumentation key automatically injected by Static Web Apps
const appInsights = require("applicationinsights");
appInsights
  .setup(process.env.APPLICATIONINSIGHTS_CONNECTION_STRING)
  .setAutoDependencyCorrelation(true)
  .setAutoCollectRequests(true)
  .setAutoCollectPerformance(true, true)
  .setAutoCollectExceptions(true)
  .setAutoCollectDependencies(true)
  .start();
```

**Telemetry Volume (24-hour sample):**

- App Traces: 193 events
- Performance Counters: 171 events
- App Requests: 7 events
- Exceptions: 0 events (healthy)

---

## Validation & Success Metrics

### Functional Requirements: ✅ Met

| Requirement                | Target      | Actual      | Status      |
| -------------------------- | ----------- | ----------- | ----------- |
| Frontend availability      | 99.9%       | 100%        | ✅ Exceeded |
| API endpoint functionality | All working | 3/3 working | ✅ Met      |
| HTTPS enforcement          | Required    | Enforced    | ✅ Met      |
| EU data residency          | Required    | West Europe | ✅ Met      |

### Non-Functional Requirements: ⚠️ Partially Met

| Requirement               | Target | Actual     | Status          |
| ------------------------- | ------ | ---------- | --------------- |
| TTFB (Time to First Byte) | <200ms | 1100ms     | ⚠️ Above target |
| API latency (p95)         | <500ms | 800-3200ms | ⚠️ Above target |
| Error rate                | <1%    | 0%         | ✅ Exceeded     |
| Monthly cost              | <$20   | $17.24     | ✅ Met          |

**Note**: Performance metrics above target are acceptable for demo workload. Production optimization would address via CDN tuning, custom domain, and API caching.

### Cost Requirements: ✅ Met

| Metric              | Target  | Actual       | Status |
| ------------------- | ------- | ------------ | ------ |
| Monthly budget      | <$20.00 | $17.24       | ✅ Met |
| Cost predictability | High    | Fixed $9 SWA | ✅ Met |
| Budget utilization  | <100%   | 86.2%        | ✅ Met |

---

## Lessons Learned

### What Went Well

1. **Cost Efficiency**: Static Web Apps provided better cost/value ratio than anticipated
2. **Deployment Simplicity**: Single-resource deployment reduced complexity significantly
3. **GitHub Integration**: Built-in GitHub Actions integration worked seamlessly
4. **Monitoring**: Workspace-based Application Insights provided excellent observability

### What Could Be Improved

1. **Performance Tuning**: Initial TTFB higher than expected (cold start + CDN propagation)
2. **Documentation**: Managed Functions configuration not as well-documented as standalone Functions
3. **Local Development**: SWA CLI learning curve for local emulation

### Future Considerations

1. **Custom Domain**: Consider adding custom domain to improve TTFB and branding
2. **Frontend Telemetry**: Add Application Insights SDK to React app for client-side telemetry
3. **Caching Strategy**: Implement API response caching to reduce Function execution costs
4. **Enterprise Tier**: Evaluate Enterprise tier ($26/month) if scaling requirements increase

---

## Related Decisions

- **ADR-002** (Future): Decision to use workspace-based Application Insights (vs classic)
- **Design Phase**: Cost estimate assumed App Service + Functions (not implemented)
- **Implementation Plan**: Documented choice to use Static Web Apps in Step 4

---

## References

- **Design Document**: [07-design-document.md](./07-design-document.md) - Section 5.1 (Compute Resources)
- **Resource Inventory**: [07-resource-inventory.md](./07-resource-inventory.md) - Static Web App details
- **Implementation Reference**: [05-implementation-reference.md](./05-implementation-reference.md) - Bicep templates
- **Cost Estimate**: [07-ab-cost-estimate.md](./07-ab-cost-estimate.md) - Actual cost analysis
- **Health Report**: [08-resource-health-report.md](./08-resource-health-report.md) - Performance validation

---

**Decision Status**: ✅ **ACCEPTED & IMPLEMENTED**  
**Review Date**: 2026-02-20 (30-day post-deployment review)  
**Owner**: Rebel Alliance Architecture Team  
**Contact**: rebel-devops@alliance.io

_This ADR documents the actual as-built architectural decision based on production deployment on 2026-01-20._

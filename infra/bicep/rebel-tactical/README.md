# Rebel Tactical Platform - Bicep Infrastructure

> **🌟 Death Star Reconnaissance Platform** - Azure infrastructure for the Rebel Alliance

## Overview

This directory contains the Bicep templates for deploying the Rebel Tactical Platform
infrastructure to Azure. The templates follow Azure Verified Modules (AVM) patterns
and comply with Azure Policy governance requirements.

## Architecture

```
┌──────────────────────────────────────────────────────────────────────────────┐
│              Resource Group: rg-rebel-tactical-prod-weu                       │
│                           (westeurope)                                        │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │              Observability Stack                                        │  │
│  ├────────────────────────────────────────────────────────────────────────┤  │
│  │  Log Analytics Workspace ───────────── Application Insights            │  │
│  │  log-rebel-tactical-prod-weu          appi-rebel-tactical-prod-weu     │  │
│  │  (30-day retention, 1GB cap)          (workspace-based mode)           │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                              │                                               │
│                              ▼                                               │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │              Azure Static Web App (Standard)                            │  │
│  │              stapp-rebel-tactical-prod-weu                              │  │
│  ├────────────────────────────────────────────────────────────────────────┤  │
│  │   React Frontend          │       Managed Functions Runtime            │  │
│  │   (Global CDN)            │       GET /api/missions                    │  │
│  │   • 3D Death Star         │       GET /api/intelligence                │  │
│  │   • Mission Board         │       POST /api/reports                    │  │
│  │   • Intel Feed            │                                            │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

## Resources

| Resource                | Name                          | SKU       | Monthly Cost |
| ----------------------- | ----------------------------- | --------- | ------------ |
| Resource Group          | rg-rebel-tactical-prod-weu    | N/A       | $0.00        |
| Log Analytics Workspace | log-rebel-tactical-prod-weu   | PerGB2018 | ~$1.30       |
| Application Insights    | appi-rebel-tactical-prod-weu  | Pay-as-go | ~$2.50       |
| Static Web App          | stapp-rebel-tactical-prod-weu | Standard  | $9.00        |
| **Total**               |                               |           | **~$13.60**  |

## File Structure

```
infra/bicep/rebel-tactical/
├── main.bicep              # Main orchestrator (subscription-scoped)
├── main.bicepparam         # Production parameters
├── deploy.ps1              # PowerShell deployment script
├── README.md               # This file
└── modules/
    ├── log-analytics.bicep    # Log Analytics Workspace
    ├── app-insights.bicep     # Application Insights
    └── static-web-app.bicep   # Azure Static Web App
```

## Deployment

### Prerequisites

- Azure CLI 2.50+
- Bicep CLI 0.20+
- Azure subscription with appropriate permissions
- Logged in to Azure (`az login`)

### Quick Start

```powershell
# Navigate to the Bicep directory
cd infra/bicep/rebel-tactical

# Deploy to production
./deploy.ps1 -Environment prod -Location westeurope

# What-if analysis (no deployment)
./deploy.ps1 -WhatIf

# Deploy to development
./deploy.ps1 -Environment dev -Location westeurope
```

### Manual Deployment

```bash
# Validate the template
bicep build main.bicep

# What-if analysis
az deployment sub what-if \
  --location westeurope \
  --template-file main.bicep \
  --parameters main.bicepparam

# Deploy
az deployment sub create \
  --location westeurope \
  --name rebel-tactical-deployment \
  --template-file main.bicep \
  --parameters main.bicepparam
```

## Governance Compliance

This deployment complies with the following Azure Policies:

### JV-Enforce Resource Group Tags v3 (Deny)

**9 mandatory tags required on Resource Group:**

| Tag               | Value                    |
| ----------------- | ------------------------ |
| environment       | prod                     |
| owner             | rebel-alliance-ops       |
| costcenter        | rebel-ops-001            |
| application       | rebel-tactical-platform  |
| workload          | web-app                  |
| sla               | standard                 |
| backup-policy     | none                     |
| maint-window      | sunday-02:00-06:00       |
| technical-contact | rebel-devops@alliance.io |

### JV - Inherit Multiple Tags from Resource Group (Modify)

Child resources automatically inherit the 9 mandatory tags from the resource group.

### Azure Security Baseline (Audit)

- ✅ TLS 1.2+ enforced
- ✅ Workspace-based Application Insights
- ✅ HTTPS only

## Validation

```powershell
# Verify template syntax
bicep build main.bicep --stdout --no-restore

# Check for best practice violations
bicep lint main.bicep

# Format templates
bicep format main.bicep
bicep format modules/*.bicep

# Post-deployment policy compliance check
az policy state list \
  --resource-group rg-rebel-tactical-prod-weu \
  --filter "complianceState eq 'NonCompliant'" \
  --output table
```

## Outputs

After deployment, the following outputs are available:

| Output                        | Description                               |
| ----------------------------- | ----------------------------------------- |
| resourceGroupName             | Name of the resource group                |
| logAnalyticsWorkspaceId       | Log Analytics Workspace resource ID       |
| appInsightsInstrumentationKey | Instrumentation key (legacy)              |
| appInsightsConnectionString   | Connection string (modern SDK)            |
| staticWebAppHostname          | Default hostname (\*.azurestaticapps.net) |
| staticWebAppDeploymentToken   | API key for CI/CD deployment              |

## Rollback

To delete all resources:

```bash
# Delete entire resource group
az group delete --name rg-rebel-tactical-prod-weu --yes --no-wait

# Verify deletion
az group show --name rg-rebel-tactical-prod-weu
```

## References

- [Implementation Plan](../../../agent-output/rebel-tactical-platform/04-implementation-plan.md)
- [Governance Constraints](../../../agent-output/rebel-tactical-platform/04-governance-constraints.md)
- [Azure Static Web Apps](https://learn.microsoft.com/azure/static-web-apps/)
- [Application Insights](https://learn.microsoft.com/azure/azure-monitor/app/app-insights-overview)
- [Azure Verified Modules](https://aka.ms/avm)

---

**May the Force be with your deployments** 🌟

_Built by the Rebel Alliance Engineering Corps_

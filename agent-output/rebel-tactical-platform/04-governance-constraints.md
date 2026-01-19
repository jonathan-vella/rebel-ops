# Governance Constraints

_Discovered: 2026-01-19 14:30 UTC_
_Subscription: noalz (`00858ffc-dded-4f0f-8bbf-e17fff0d47d9`)_
_Tenant: `2d04cb4c-999b-4e60-a3a7-e8993edc768b`_

---

## Summary

Azure Policy scan discovered **10+ active policy assignments** from management group scope that
affect deployments in this subscription. The most critical constraints are:

| Constraint Type         | Impact Level | Action Required                      |
| ----------------------- | ------------ | ------------------------------------ |
| Resource Group Tags     | 🔴 **DENY**  | All 9 mandatory tags must be present |
| Tag Inheritance         | 🟡 Modify    | Resources inherit 9 tags from RG     |
| Azure Security Baseline | 🟡 Audit     | TLS 1.2+, diagnostic settings        |
| Classic Resources       | 🔴 **DENY**  | No classic compute/storage/network   |
| GDPR/PCI DSS            | 🟡 Audit     | Data protection requirements         |

---

## Active Policy Assignments

### Deny Policies (Deployment Blockers)

| Policy Name                           | Effect   | Scope            | Impact on Plan                             |
| ------------------------------------- | -------- | ---------------- | ------------------------------------------ |
| **JV-Enforce Resource Group Tags v3** | **Deny** | Management Group | RG creation fails without 9 mandatory tags |
| Block Azure RM Resource Creation      | Deny     | Management Group | Blocks Classic resources only (not ARM)    |
| MCAPSGov Deny Policies                | Deny     | Management Group | VM SKU restrictions, AKS limits, SQL auth  |

### Modify Policies (Auto-remediation)

| Policy Name                        | Effect | Scope            | Impact on Plan                        |
| ---------------------------------- | ------ | ---------------- | ------------------------------------- |
| JV - Inherit Multiple Tags from RG | Modify | Management Group | Resources auto-inherit 9 tags from RG |

### Audit Policies (Compliance Monitoring)

| Policy Name                  | Effect           | Scope            | Impact on Plan                         |
| ---------------------------- | ---------------- | ---------------- | -------------------------------------- |
| Azure Security Baseline      | AuditIfNotExists | Management Group | TLS 1.2, NSG on subnets, secret expiry |
| GDPR 2016/679                | Audit            | Subscription     | Data protection, privacy controls      |
| PCI DSS v4                   | Audit            | Subscription     | Payment data security standards        |
| ASC DataProtection           | Audit            | Subscription     | Security Center recommendations        |
| MFA for Write/Delete Actions | Audit            | Management Group | Operational security monitoring        |

---

## Resource-Specific Constraints

### Resource Groups

**CRITICAL: 9 Mandatory Tags Required (Deny Policy)**

| Tag Name            | Required | Description                      | Example Value                 |
| ------------------- | -------- | -------------------------------- | ----------------------------- |
| `environment`       | ✅ Yes   | Deployment environment           | `prod`, `dev`, `staging`      |
| `owner`             | ✅ Yes   | Team or individual responsible   | `rebel-alliance-ops`          |
| `costcenter`        | ✅ Yes   | Billing code for cost allocation | `rebel-ops-001`               |
| `application`       | ✅ Yes   | Application name                 | `rebel-tactical-platform`     |
| `workload`          | ✅ Yes   | Workload classification          | `web-app`                     |
| `sla`               | ✅ Yes   | Service level agreement tier     | `standard`, `premium`, `none` |
| `backup-policy`     | ✅ Yes   | Backup policy applied            | `none`, `daily`, `weekly`     |
| `maint-window`      | ✅ Yes   | Maintenance window schedule      | `sunday-02:00-06:00`          |
| `technical-contact` | ✅ Yes   | Technical contact email or alias | `rebel-devops@alliance.io`    |

**Exclusions (RG names that bypass policy):**

- `AzureBackupRG*`, `ResourceMover*`, `databricks-rg*`, `NetworkWatcherRG`
- `microsoft-network`, `LogAnalyticsDefaultResources`, `rg-amba-*`
- `DynamicsDeployments*`, `MC_myResourceGroup*`

⚠️ **Our resource group `rg-rebel-tactical-prod-weu` does NOT match exclusions - tags REQUIRED**

### Tag Inheritance (Modify Policy)

Resources created in compliant resource groups automatically inherit these 9 tags:

```yaml
inheritedTags:
  - environment
  - owner
  - costcenter
  - application
  - workload
  - sla
  - backup-policy
  - maint-window
  - tech-contact
```

### Static Web Apps

- ❌ No blocking policies specific to Static Web Apps
- ⚠️ Azure Security Baseline monitors FTPS (disabled for SWA monitoring)
- ✅ HTTPS enforced by Azure Static Web Apps platform by default

### Application Insights

- ❌ No blocking policies specific to Application Insights
- ✅ Workspace-based mode recommended (Log Analytics backend)
- ✅ Diagnostic settings recommended for Security Baseline compliance

### Log Analytics Workspace

- ❌ No blocking policies specific to Log Analytics
- ⚠️ Enable allLogs category policy may require diagnostic settings
- ✅ Data retention configurable (30 days default)

### Classic Resources (BLOCKED)

The following resource types are **DENIED** by policy:

- `Microsoft.ClassicCompute/virtualMachines`
- `Microsoft.ClassicCompute/domainNames`
- `Microsoft.ClassicStorage/storageAccounts`
- `Microsoft.ClassicNetwork/virtualNetworks`
- `Microsoft.ClassicNetwork/reservedIps`
- `Microsoft.ClassicNetwork/networkSecurityGroups`
- `Microsoft.MarketplaceApps/classicDevServices`

✅ **Our plan uses ARM resources only - no impact**

---

## Azure Security Baseline Parameters

The Azure Security Baseline policy set has these configured parameters:

| Setting                                    | Value            | Impact                            |
| ------------------------------------------ | ---------------- | --------------------------------- |
| `windowsWebServersMinimumTLSVersion`       | `1.2`            | TLS 1.2 required for web services |
| `networkSecurityGroupsOnSubnetsMonitoring` | AuditIfNotExists | NSG recommended on subnets        |
| `secretsExpirationSetEffect`               | Audit            | Key Vault secrets should expire   |
| `keysExpirationSetEffect`                  | Audit            | Key Vault keys should expire      |
| `vnetEnableDDoSProtection`                 | Disabled         | DDoS protection not enforced      |
| `fTPSOnlyShouldBeRequired*`                | Disabled         | FTPS monitoring disabled          |

---

## MCAPSGov Deny Policies (Not Applicable to Our Resources)

The MCAPSGov Deny Policies include restrictions that **do not affect** our deployment:

| Policy                         | Target Resources      | Impact on Plan |
| ------------------------------ | --------------------- | -------------- |
| Block VM SKUs (H, M, N series) | Virtual Machines      | ❌ Not used    |
| AKS Node Count Limit           | AKS Clusters          | ❌ Not used    |
| VMSS Node Count Limit          | VM Scale Sets         | ❌ Not used    |
| Azure SQL Without AAD Auth     | Azure SQL             | ❌ Not used    |
| Azure SQL MI Without AAD Auth  | SQL Managed Instance  | ❌ Not used    |
| OpenAI Provisioned Capacity    | Azure OpenAI          | ❌ Not used    |
| Sentinel Commitment Tier       | Microsoft Sentinel    | ❌ Not used    |
| Key Vault HSM Purge Protection | Key Vault Managed HSM | ❌ Not used    |
| Not Allowed Resource Types     | (empty list)          | ✅ No blocking |

---

## Compliance Frameworks

### GDPR 2016/679 (Audit)

- Personal data processing controls
- Data subject rights implementation
- Privacy by design principles
- **Impact**: Audit only, no deployment blocking

### PCI DSS v4 (Audit)

- Payment card data protection
- Network segmentation requirements
- Access control monitoring
- **Impact**: Audit only, no deployment blocking

---

## Recommendations for Implementation Plan

### MANDATORY Changes

1. **Add all 9 mandatory tags to Resource Group deployment:**

   ```bicep
   tags: {
     environment: 'prod'
     owner: 'rebel-alliance-ops'
     costcenter: 'rebel-ops-001'
     application: 'rebel-tactical-platform'
     workload: 'web-app'
     sla: 'standard'
     'backup-policy': 'none'
     'maint-window': 'sunday-02:00-06:00'
     'technical-contact': 'rebel-devops@alliance.io'
   }
   ```

2. **Child resources will inherit tags via Modify policy** - but explicitly set tags for clarity

### RECOMMENDED Changes

1. **Use workspace-based Application Insights** - already planned ✅
2. **Configure TLS 1.2+** - enforced by Static Web Apps platform ✅
3. **Enable diagnostic settings** on all resources for Security Baseline compliance
4. **Document data flows** for GDPR compliance audit trail

---

## Policy Compliance Verification Commands

```powershell
# Check resource group tag compliance before deployment
az policy state list \
  --resource-group rg-rebel-tactical-prod-weu \
  --filter "complianceState eq 'NonCompliant'" \
  --output table

# Validate specific policy assignment
az policy state summarize \
  --policy-assignment "JV-Enforce Resource Group Tags v3" \
  --output table

# Check all non-compliant resources in subscription
az policy state list \
  --subscription 00858ffc-dded-4f0f-8bbf-e17fff0d47d9 \
  --filter "complianceState eq 'NonCompliant'" \
  --output table
```

---

## References

- [Azure Policy Overview](https://learn.microsoft.com/azure/governance/policy/overview)
- [Azure Security Baseline](https://learn.microsoft.com/azure/governance/policy/samples/built-in-initiatives#security-center)
- [CAF Tagging Strategy](https://learn.microsoft.com/azure/cloud-adoption-framework/ready/azure-best-practices/resource-tagging)

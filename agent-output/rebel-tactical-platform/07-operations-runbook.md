# Operations Runbook: Rebel Tactical Platform

**Version**: 1.0  
**Date**: 2026-01-20  
**Environment**: Production  
**Region**: West Europe (westeurope)  
**Last Updated**: 2026-01-20

---

## Quick Reference

| Item                   | Value                                            |
| ---------------------- | ------------------------------------------------ |
| **Primary Region**     | West Europe (westeurope)                         |
| **Resource Group**     | rg-rebel-tactical-prod-weu                       |
| **Application URL**    | https://icy-rock-0fd499b03.4.azurestaticapps.net |
| **Support Contact**    | rebel-devops@alliance.io                         |
| **Escalation Path**    | DevOps → SRE Team → Operations Manager → CTO     |
| **Maintenance Window** | Sunday 02:00-06:00 UTC                           |
| **SLA Target**         | 99.9% (43.8 hours downtime/month maximum)        |

### Critical Resources

| Resource                | Name                          | Type                           |
| ----------------------- | ----------------------------- | ------------------------------ |
| Static Web App          | stapp-rebel-tactical-prod-weu | Microsoft.Web/staticSites      |
| Application Insights    | appi-rebel-tactical-prod-weu  | Microsoft.Insights/components  |
| Log Analytics Workspace | log-rebel-tactical-prod-weu   | OperationalInsights/workspaces |

### Emergency Contacts

| Role              | Contact                  | When to Contact                |
| ----------------- | ------------------------ | ------------------------------ |
| **On-Call SRE**   | rebel-devops@alliance.io | Critical outages, P1 incidents |
| **DevOps Lead**   | TBD                      | Deployment issues              |
| **Platform Team** | TBD                      | Azure platform issues          |
| **Cost Manager**  | TBD                      | Budget overruns                |

---

## 1. Daily Operations

### 1.1 Morning Health Check (15 minutes)

**Checklist:**

```bash
# 1. Verify application is responding
curl -I https://icy-rock-0fd499b03.4.azurestaticapps.net
# Expected: HTTP 200 OK, Response time <2s

# 2. Check Azure Function endpoints
curl https://icy-rock-0fd499b03.4.azurestaticapps.net/api/intelligence | jq .success
curl https://icy-rock-0fd499b03.4.azurestaticapps.net/api/missions | jq .success
# Expected: true for both

# 3. Verify resource health
az resource list --resource-group rg-rebel-tactical-prod-weu --query "[].{Name:name, State:provisioningState}" -o table
# Expected: All resources show "Succeeded"

# 4. Check Application Insights data ingestion
az monitor app-insights query \
  --app appi-rebel-tactical-prod-weu \
  --resource-group rg-rebel-tactical-prod-weu \
  --analytics-query "requests | where timestamp > ago(1h) | count"
# Expected: Count > 0
```

**KQL Query - System Health Overview:**

```kusto
// Run in Application Insights or Log Analytics
requests
| where timestamp > ago(24h)
| summarize
    TotalRequests = count(),
    SuccessCount = countif(success == true),
    FailureCount = countif(success == false),
    AvgDuration = avg(duration),
    P95Duration = percentile(duration, 95)
| extend SuccessRate = (SuccessCount * 100.0) / TotalRequests
| project SuccessRate, TotalRequests, FailureCount, AvgDuration, P95Duration
```

**Expected Results:**

- ✅ Success Rate: >95%
- ✅ Failure Count: <10 in 24h
- ✅ Avg Duration: <1000ms
- ✅ P95 Duration: <3000ms

### 1.2 Log Review

**Priority Logs to Review:**

| Log Source      | Query Focus               | Action Threshold       |
| --------------- | ------------------------- | ---------------------- |
| AppTraces       | Errors and warnings       | >5 errors in 1 hour    |
| AppExceptions   | Unhandled exceptions      | Any exception          |
| AppRequests     | Failed requests (4xx/5xx) | >5% failure rate       |
| AppDependencies | External service failures | Any dependency failure |

**Daily Log Review Query:**

```kusto
union AppTraces, AppExceptions
| where timestamp > ago(24h)
| where severityLevel >= 3  // Warning or Error
| summarize Count = count() by severityLevel, message, operation_Name
| order by severityLevel desc, Count desc
| take 20
```

### 1.3 Performance Monitoring

**Key Metrics Dashboard:**

| Metric              | Target | Current (24h avg) | Status       |
| ------------------- | ------ | ----------------- | ------------ |
| Static Web App TTFB | <200ms | 1100ms (first)    | ⚠️ Above     |
| API GET Latency     | <500ms | 800ms             | ✅ Good      |
| API POST Latency    | <500ms | 3200ms            | ⚠️ Above     |
| Error Rate          | <1%    | 0%                | ✅ Excellent |
| Availability        | >99.9% | 100%              | ✅ Excellent |

**Performance Tracking Query:**

```kusto
requests
| where timestamp > ago(24h)
| summarize
    P50 = percentile(duration, 50),
    P95 = percentile(duration, 95),
    P99 = percentile(duration, 99),
    Count = count()
by operation_Name
| order by Count desc
```

---

## 2. Weekly Maintenance

### 2.1 Monday Morning Checks (30 minutes)

**Weekly Review Tasks:**

1. **Cost Analysis**

   ```bash
   # Check current month spending
   az consumption usage list \
     --start-date $(date -u -d "$(date +%Y-%m-01)" +%Y-%m-%d) \
     --end-date $(date -u +%Y-%m-%d) \
     --query "[?contains(instanceId, 'rg-rebel-tactical-prod-weu')]" \
     | jq '[.[] | .pretaxCost] | add'

   # Target: <$20/month ($0.67/day average)
   ```

2. **Application Insights Data Volume**

   ```kusto
   Usage
   | where TimeGenerated > ago(7d)
   | summarize DataVolume = sum(Quantity) by DataType
   | extend DataVolumeGB = DataVolume / 1024
   | order by DataVolumeGB desc

   // Target: <5GB/month free tier
   ```

3. **GitHub Actions Workflow Status**
   - Check recent deployments in GitHub Actions
   - Verify no failed workflows
   - Review deployment duration trends

4. **Security Review**
   - Check for security advisories in Azure Security Center
   - Review NSG/firewall logs (if configured)
   - Verify SSL certificate expiration (auto-managed, but verify)

### 2.2 Backup Verification

**Status**: Not applicable (stateless application)

**Weekly Git Repository Check:**

```bash
# Verify latest code is in Git
cd /path/to/rebel-ops
git fetch origin
git status
git log --oneline -10

# Verify Bicep templates are committed
git ls-files infra/bicep/rebel-tactical/
```

### 2.3 Documentation Review

- Review and update runbook if procedures changed
- Update [07-resource-inventory.md](./07-resource-inventory.md) if resources added/removed
- Document any incidents or issues in post-mortem template

---

## 3. Monthly Maintenance

### 3.1 First Monday of Month (1-2 hours)

**Monthly Tasks:**

1. **Cost Report Generation**
   - Generate monthly cost report
   - Compare to budget ($20/month)
   - Identify cost optimization opportunities
   - Update [07-ab-cost-estimate.md](./07-ab-cost-estimate.md) with actuals

2. **Performance Trend Analysis**

   ```kusto
   requests
   | where timestamp > ago(30d)
   | summarize
       AvgDuration = avg(duration),
       P95Duration = percentile(duration, 95),
       RequestCount = count()
   by bin(timestamp, 1d), operation_Name
   | render timechart
   ```

3. **Health Assessment**
   - Run full health assessment (see [08-resource-health-report.md](./08-resource-health-report.md))
   - Review all telemetry and metrics
   - Test all API endpoints
   - Update health report

4. **Dependency Updates**
   - Review npm package updates
   - Check for Azure Functions runtime updates
   - Review React and Vite version updates
   - Plan upgrade schedule if needed

5. **Security Patching**
   - Review Azure platform patches (automatic)
   - Update GitHub Actions workflow dependencies
   - Check for npm security advisories

### 3.2 Capacity Planning Review

**Current Capacity:**

- Static Web App: Unlimited (CDN-backed)
- Azure Functions: 0-200 instances (auto-scaling)
- Application Insights: 5GB/month free tier
- Log Analytics: 5GB/month free tier

**Review Questions:**

- Is auto-scaling behavior adequate?
- Are we approaching free tier limits?
- Do we need to adjust sampling rates?
- Should we increase retention periods?

---

## 4. Incident Response

### 4.1 Severity Definitions

| Severity | Impact                              | Response Time | Examples                           |
| -------- | ----------------------------------- | ------------- | ---------------------------------- |
| **P1**   | Complete outage, all users affected | 15 minutes    | Application completely down        |
| **P2**   | Major degradation, many users       | 1 hour        | API endpoints returning 500 errors |
| **P3**   | Minor degradation, few users        | 4 hours       | Slow performance, single feature   |
| **P4**   | No immediate impact                 | Next business | Monitoring alert, no user impact   |

### 4.2 Incident Response Procedures

#### P1: Complete Application Outage

**Symptoms:**

- Application URL returns 5xx errors or times out
- All API endpoints unavailable
- Application Insights shows no telemetry

**Immediate Actions (within 15 minutes):**

1. **Verify the issue**

   ```bash
   curl -I https://icy-rock-0fd499b03.4.azurestaticapps.net
   curl https://icy-rock-0fd499b03.4.azurestaticapps.net/api/intelligence
   ```

2. **Check Azure Service Health**

   ```bash
   az rest --method get --url "https://management.azure.com/subscriptions/00858ffc-dded-4f0f-8bbf-e17fff0d47d9/providers/Microsoft.ResourceHealth/events?api-version=2022-10-01&queryStartTime=$(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%SZ)"
   ```

3. **Check resource health**

   ```bash
   az resource list \
     --resource-group rg-rebel-tactical-prod-weu \
     --query "[].{Name:name, State:provisioningState, Type:type}" \
     -o table
   ```

4. **Review recent deployments**
   - Check GitHub Actions for recent workflow runs
   - Identify if outage correlates with deployment

**Resolution Paths:**

**A. Azure Region Outage**

- Monitor Azure Status page: https://status.azure.com
- Estimate recovery time from Azure
- Consider emergency failover to alternative region (see Section 6.2)

**B. Failed Deployment**

- Rollback to previous version via GitHub Actions
- Trigger manual deployment workflow
- Verify rollback success

**C. Configuration Issue**

```bash
# Verify Static Web App configuration
az staticwebapp show \
  --name stapp-rebel-tactical-prod-weu \
  --resource-group rg-rebel-tactical-prod-weu

# Check application settings
az staticwebapp appsettings list \
  --name stapp-rebel-tactical-prod-weu \
  --resource-group rg-rebel-tactical-prod-weu
```

**D. Resource Quota Exceeded**

```bash
# Check Static Web App quotas
az staticwebapp show \
  --name stapp-rebel-tactical-prod-weu \
  --resource-group rg-rebel-tactical-prod-weu \
  --query "sku"
```

#### P2: API Endpoints Returning Errors

**Symptoms:**

- Frontend loads but API calls fail
- Specific endpoints return 500 errors
- Application Insights shows exceptions

**Investigation:**

```kusto
// Find recent exceptions
exceptions
| where timestamp > ago(1h)
| summarize Count = count() by type, outerMessage
| order by Count desc

// Check failed requests
requests
| where timestamp > ago(1h) and success == false
| project timestamp, name, resultCode, duration, operation_Id
| order by timestamp desc
| take 50
```

**Resolution:**

1. Identify failing function from exception logs
2. Check Function host logs in Application Insights
3. Review recent code changes to failing function
4. Deploy hotfix or rollback to previous version

#### P3: Performance Degradation

**Symptoms:**

- Application loads slowly (>5 seconds)
- API responses slow (>5 seconds)
- Users reporting issues

**Investigation:**

```kusto
// Identify slow operations
requests
| where timestamp > ago(1h)
| summarize P95 = percentile(duration, 95) by operation_Name
| where P95 > 5000
| order by P95 desc
```

**Potential Causes:**

- Function cold starts (scale from zero)
- CDN cache miss rate high
- Downstream dependency slow
- Memory/CPU pressure on Function instances

**Resolution:**

1. Monitor for auto-scaling behavior
2. Check Application Insights performance counters
3. Implement caching strategies if needed
4. Consider always-on instances (requires upgrade to Enterprise tier)

#### P4: Monitoring Alerts

**Symptoms:**

- Application Insights alert triggered
- No immediate user impact
- Proactive detection of potential issues

**Actions:**

1. Review alert details
2. Investigate root cause
3. Create improvement backlog item
4. Document findings

### 4.3 Communication Templates

**P1 Incident Notification (Internal):**

```
SUBJECT: [P1] Rebel Tactical Platform - Complete Outage

STATUS: Investigating
IMPACT: All users unable to access application
START TIME: [TIME] UTC
AFFECTED SERVICES: Static Web App, API endpoints

INVESTIGATION:
- [Current findings]
- [Actions taken]

NEXT UPDATE: [TIME] (+15 minutes)
```

**Resolution Notification:**

```
SUBJECT: [RESOLVED] Rebel Tactical Platform - Complete Outage

STATUS: Resolved
DURATION: [X] minutes
ROOT CAUSE: [Brief description]

TIMELINE:
- [TIME]: Issue detected
- [TIME]: Investigation started
- [TIME]: Root cause identified
- [TIME]: Fix applied
- [TIME]: Service restored

POST-MORTEM: [Link to follow]
```

---

## 5. Scaling Procedures

### 5.1 Scaling Azure Static Web Apps

**Current Configuration:**

- SKU: Standard
- Auto-scaling: Managed by Azure (automatic)
- CDN: Global distribution (automatic)

**Scaling Actions:**

**A. Handle Traffic Spike (Automatic)**

Azure Static Web Apps automatically handles traffic spikes through:

- CDN edge caching (95% cache hit rate)
- Azure Functions auto-scaling (0-200 instances)
- No manual intervention required

**Monitoring during spike:**

```kusto
requests
| where timestamp > ago(1h)
| summarize RequestsPerMinute = count() by bin(timestamp, 1m)
| render timechart

// Expected: Smooth scaling, no errors
```

**B. Optimize for Global Users (Manual)**

If expanding beyond EU:

1. Consider enabling Enterprise-grade CDN
2. Monitor latency from different regions
3. Evaluate Azure Front Door for custom routing

**C. Upgrade SKU (If needed)**

```bash
# Currently on Standard ($9/month)
# Upgrade to Enterprise tier for:
# - Always-on Functions (no cold start)
# - Enterprise CDN
# - Advanced security features

# Note: This exceeds budget constraint
```

### 5.2 Optimize Application Insights Sampling

**Current Configuration:**

- Adaptive sampling: Enabled
- Max items/sec: 20
- Initial sampling: 100%

**Adjust sampling rate:**

```javascript
// In function code (if needed)
appInsights.defaultClient.config.samplingPercentage = 50; // 50% sampling
```

**Monitor impact:**

```kusto
Usage
| where TimeGenerated > ago(7d)
| summarize DataVolume = sum(Quantity) by bin(TimeGenerated, 1d)
| render timechart
```

---

## 6. Deployment Procedures

### 6.1 Standard Deployment (GitHub Actions)

**Pre-Deployment Checklist:**

- [ ] Code changes reviewed and approved
- [ ] Local testing completed
- [ ] Bicep validation passed (`bicep build`)
- [ ] Branch protection rules satisfied
- [ ] Deployment window verified (outside business hours preferred)

**Deployment Steps:**

1. **Trigger Deployment**

   ```bash
   # Push to main branch triggers automatic deployment
   git push origin main
   ```

2. **Monitor Deployment**
   - Watch GitHub Actions workflow: https://github.com/jonathan-vella/rebel-ops/actions
   - Expected duration: 2-5 minutes
   - Monitor for any failed steps

3. **Verify Deployment**

   ```bash
   # 1. Check application responds
   curl -I https://icy-rock-0fd499b03.4.azurestaticapps.net

   # 2. Verify API endpoints
   curl https://icy-rock-0fd499b03.4.azurestaticapps.net/api/intelligence | jq .success

   # 3. Check for errors in App Insights
   az monitor app-insights query \
     --app appi-rebel-tactical-prod-weu \
     --resource-group rg-rebel-tactical-prod-weu \
     --analytics-query "exceptions | where timestamp > ago(5m)"
   ```

4. **Post-Deployment Monitoring** (15 minutes)
   - Monitor error rate in Application Insights
   - Check for performance degradation
   - Verify user traffic resuming normally

**Rollback Trigger Conditions:**

- Error rate >5% for 5 minutes
- Application returns 5xx errors
- Critical functionality broken

### 6.2 Emergency Deployment (Hotfix)

**When to use:**

- Critical bug in production
- Security vulnerability
- Data integrity issue

**Fast-Track Process:**

1. **Create hotfix branch**

   ```bash
   git checkout -b hotfix/critical-fix
   # Make minimal fix
   git commit -m "Hotfix: [description]"
   git push origin hotfix/critical-fix
   ```

2. **Merge and deploy immediately**
   - Skip normal review process (document decision)
   - Deploy via GitHub Actions
   - Monitor closely

3. **Post-Hotfix Actions**
   - Document incident and hotfix
   - Schedule proper fix and testing
   - Update monitoring/alerting if needed

### 6.3 Rollback Procedures

**Rollback via GitHub (Recommended):**

1. **Identify last good commit**

   ```bash
   git log --oneline -10
   ```

2. **Revert to previous version**

   ```bash
   git revert [bad-commit-hash]
   git push origin main
   ```

3. **Monitor rollback deployment**
   - Verify GitHub Actions completes
   - Check application health
   - Confirm error rate returns to normal

**Estimated Rollback Time:** 3-5 minutes

**Manual Rollback (Infrastructure):**

```bash
# Redeploy from last known good Bicep state
cd /infra/bicep/rebel-tactical/
./deploy.ps1 -Environment prod -WhatIf:$false

# Estimated time: 10-15 minutes
```

### 6.4 Infrastructure Updates (Bicep)

**Pre-Update Checklist:**

- [ ] Changes tested in dev/staging environment
- [ ] Bicep validation passed
- [ ] `az deployment sub what-if` reviewed
- [ ] Rollback plan documented
- [ ] Maintenance window scheduled

**Deployment:**

```powershell
# From: /infra/bicep/rebel-tactical/

# 1. Preview changes
./deploy.ps1 -Environment prod -WhatIf:$true

# 2. Review output carefully
# - Check for resource deletions (potential data loss)
# - Verify expected changes

# 3. Deploy
./deploy.ps1 -Environment prod -WhatIf:$false

# 4. Verify deployment
az resource list --resource-group rg-rebel-tactical-prod-weu -o table
```

**Post-Deployment:**

- Run full health check (Section 1.1)
- Update [07-resource-inventory.md](./07-resource-inventory.md)
- Document changes in deployment log

---

## 7. Troubleshooting Guide

### 7.1 Common Issues

#### Issue: "Application returns 404 for all routes"

**Symptoms:**

- Homepage loads but navigation fails
- Direct URLs return 404

**Cause:** Client-side routing configuration missing

**Resolution:**

1. Verify `staticwebapp.config.json` has navigation fallback:
   ```json
   {
     "navigationFallback": {
       "rewrite": "/index.html"
     }
   }
   ```
2. Redeploy if configuration missing

#### Issue: "API endpoints return CORS errors"

**Symptoms:**

- Browser console shows CORS error
- API calls fail from frontend
- Direct API calls work (curl)

**Cause:** CORS misconfiguration

**Resolution:**

1. Check `staticwebapp.config.json`:
   ```json
   {
     "globalHeaders": {
       "Access-Control-Allow-Origin": "*",
       "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
     }
   }
   ```
2. For production, restrict to specific domain

#### Issue: "Function cold start >10 seconds"

**Symptoms:**

- First request after idle period very slow
- Subsequent requests fast

**Cause:** Azure Functions cold start in Consumption plan

**Mitigation:**

1. Accept cold starts (within SLA for demo)
2. Consider implementing warming strategy
3. Upgrade to Enterprise tier for always-on (exceeds budget)

#### Issue: "Application Insights shows no data"

**Symptoms:**

- No telemetry in Application Insights
- Queries return empty results

**Resolution:**

1. Verify instrumentation key in SWA settings:
   ```bash
   az staticwebapp appsettings list \
     --name stapp-rebel-tactical-prod-weu \
     --resource-group rg-rebel-tactical-prod-weu
   ```
2. Check for correct connection string
3. Verify Functions are being invoked
4. Wait 5-10 minutes for data ingestion delay

### 7.2 Diagnostic Commands

**Resource Health Check:**

```bash
# Full resource health
az resource list \
  --resource-group rg-rebel-tactical-prod-weu \
  --query "[].{Name:name, Type:type, Location:location, State:provisioningState}" \
  -o table
```

**Static Web App Diagnostics:**

```bash
# Get SWA details
az staticwebapp show \
  --name stapp-rebel-tactical-prod-weu \
  --resource-group rg-rebel-tactical-prod-weu \
  -o json

# Get SWA environments
az staticwebapp environment list \
  --name stapp-rebel-tactical-prod-weu \
  --resource-group rg-rebel-tactical-prod-weu
```

**Application Insights Diagnostics:**

```bash
# Test connectivity
az monitor app-insights component show \
  --app appi-rebel-tactical-prod-weu \
  --resource-group rg-rebel-tactical-prod-weu

# Query recent errors
az monitor app-insights query \
  --app appi-rebel-tactical-prod-weu \
  --resource-group rg-rebel-tactical-prod-weu \
  --analytics-query "exceptions | where timestamp > ago(1h) | take 10"
```

---

## 8. Reference Information

### 8.1 Useful Links

| Resource                 | URL                                                 |
| ------------------------ | --------------------------------------------------- |
| **Application**          | https://icy-rock-0fd499b03.4.azurestaticapps.net    |
| **Azure Portal**         | https://portal.azure.com                            |
| **Resource Group**       | Search "rg-rebel-tactical-prod-weu" in Azure Portal |
| **Application Insights** | Portal → appi-rebel-tactical-prod-weu               |
| **GitHub Repository**    | https://github.com/jonathan-vella/rebel-ops         |
| **GitHub Actions**       | https://github.com/jonathan-vella/rebel-ops/actions |
| **Azure Status**         | https://status.azure.com                            |

### 8.2 Key Commands Cheat Sheet

```bash
# Health Check
curl -I https://icy-rock-0fd499b03.4.azurestaticapps.net

# Resource Status
az resource list --resource-group rg-rebel-tactical-prod-weu -o table

# Recent Errors
az monitor app-insights query --app appi-rebel-tactical-prod-weu \
  --resource-group rg-rebel-tactical-prod-weu \
  --analytics-query "exceptions | where timestamp > ago(1h)"

# Recent Deployments
gh run list --repo jonathan-vella/rebel-ops --limit 5

# Cost Check
az consumption usage list --start-date $(date -d "$(date +%Y-%m-01)" +%Y-%m-%d)
```

### 8.3 Escalation Matrix

| Issue Type          | L1 Support          | L2 Support         | L3 Support     |
| ------------------- | ------------------- | ------------------ | -------------- |
| Application Down    | On-call Engineer    | SRE Team Lead      | Platform Team  |
| Performance Issues  | Operations Team     | DevOps Team        | Azure Support  |
| Deployment Failures | DevOps Team         | Platform Architect | Azure Support  |
| Cost Overruns       | Operations Manager  | Finance Team       | Azure Account  |
| Security Incidents  | Security Operations | Security Team Lead | Azure Security |

---

## 9. Change Log

| Version | Date       | Author                           | Changes                           |
| ------- | ---------- | -------------------------------- | --------------------------------- |
| 1.0     | 2026-01-20 | Workload Documentation Generator | Initial runbook based on as-built |

---

**Next Review**: 2026-02-20 (Monthly)  
**Maintained By**: Rebel Alliance Operations Team  
**Contact**: rebel-devops@alliance.io

_This runbook is based on the actual deployed infrastructure as of 2026-01-20. Update as operational procedures evolve._

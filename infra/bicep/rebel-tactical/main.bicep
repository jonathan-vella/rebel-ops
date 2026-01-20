// ============================================================================
// Rebel Tactical Platform - Main Orchestrator
// ============================================================================
// Purpose: Deploy all infrastructure for the Rebel Alliance Tactical Platform
// Region: westeurope (GDPR compliance)
// Governance: 9 mandatory tags per JV-Enforce Resource Group Tags v3 policy
// ============================================================================

targetScope = 'subscription'

// ============================================================================
// Parameters
// ============================================================================

@description('Environment name for resource naming and tagging')
@allowed([
  'dev'
  'staging'
  'prod'
])
param environment string = 'prod'

@description('Project name used for resource naming')
param projectName string = 'rebel-tactical'

@description('Azure region for resource deployment')
@allowed([
  'westeurope'
  'swedencentral'
  'germanywestcentral'
  'northeurope'
])
param location string = 'westeurope'

@description('Owner for governance tagging')
param owner string = 'rebel-alliance-ops'

@description('Cost center for billing allocation')
param costCenter string = 'rebel-ops-001'

@description('Technical contact email')
param technicalContact string = 'rebel-devops@alliance.io'

@description('GitHub repository URL for Static Web App deployment')
param repositoryUrl string = 'https://github.com/jonathan-vella/rebel-ops'

@description('GitHub repository branch')
param repositoryBranch string = 'main'

@description('Deployment timestamp for tagging')
param deploymentDate string = utcNow('yyyy-MM-dd')

// ============================================================================
// Variables - Naming and Tagging
// ============================================================================

// Region abbreviation for CAF naming
var regionAbbreviations = {
  westeurope: 'weu'
  swedencentral: 'swc'
  germanywestcentral: 'gwc'
  northeurope: 'neu'
}
var locationAbbr = regionAbbreviations[location]

// CAF-compliant resource names
var resourceGroupName = 'rg-${projectName}-${environment}-${locationAbbr}'
var logAnalyticsName = 'log-${projectName}-${environment}-${locationAbbr}'
var appInsightsName = 'appi-${projectName}-${environment}-${locationAbbr}'
var staticWebAppName = 'stapp-${projectName}-${environment}-${locationAbbr}'

// ============================================================================
// Mandatory Tags (Policy-Enforced)
// Required by: JV-Enforce Resource Group Tags v3 (Deny effect)
// ============================================================================
var mandatoryTags = {
  environment: environment
  owner: owner
  costcenter: costCenter
  application: projectName
  workload: 'web-app'
  sla: 'standard'
  'backup-policy': 'none'
  'maint-window': 'sunday-02:00-06:00'
  'technical-contact': technicalContact
}

// Additional operational tags (recommended)
var operationalTags = {
  ManagedBy: 'Bicep'
  Project: projectName
  DeploymentDate: deploymentDate
  Region: location
}

// Merge all tags
var allTags = union(mandatoryTags, operationalTags)

// ============================================================================
// Resource Group (Subscription-scoped deployment)
// ============================================================================

resource resourceGroup 'Microsoft.Resources/resourceGroups@2024-03-01' = {
  name: resourceGroupName
  location: location
  tags: allTags
}

// ============================================================================
// Modules - Deployed to Resource Group scope
// ============================================================================

// Log Analytics Workspace (Foundation for observability)
module logAnalytics 'modules/log-analytics.bicep' = {
  name: 'log-analytics-deployment'
  scope: resourceGroup
  params: {
    name: logAnalyticsName
    location: location
    tags: allTags
    retentionInDays: 30
    dailyQuotaGb: 1
  }
}

// Application Insights (Workspace-based mode per Security Baseline)
module appInsights 'modules/app-insights.bicep' = {
  name: 'app-insights-deployment'
  scope: resourceGroup
  params: {
    name: appInsightsName
    location: location
    tags: allTags
    workspaceResourceId: logAnalytics.outputs.resourceId
    retentionInDays: 30
  }
}

// Static Web App (Standard tier with managed Functions)
module staticWebApp 'modules/static-web-app.bicep' = {
  name: 'static-web-app-deployment'
  scope: resourceGroup
  params: {
    name: staticWebAppName
    location: location
    tags: allTags
    sku: 'Standard'
    repositoryUrl: repositoryUrl
    repositoryBranch: repositoryBranch
    appLocation: 'demo-app'
    apiLocation: 'api'
    outputLocation: 'dist'
    appInsightsConnectionString: appInsights.outputs.connectionString
  }
}

// ============================================================================
// Outputs
// ============================================================================

@description('Resource Group name')
output resourceGroupName string = resourceGroup.name

@description('Resource Group ID')
output resourceGroupId string = resourceGroup.id

@description('Log Analytics Workspace ID')
output logAnalyticsWorkspaceId string = logAnalytics.outputs.resourceId

@description('Log Analytics Workspace Name')
output logAnalyticsWorkspaceName string = logAnalytics.outputs.name

@description('Application Insights Instrumentation Key')
output appInsightsInstrumentationKey string = appInsights.outputs.instrumentationKey

@description('Application Insights Connection String')
output appInsightsConnectionString string = appInsights.outputs.connectionString

@description('Static Web App Default Hostname')
output staticWebAppHostname string = staticWebApp.outputs.defaultHostname

@description('Static Web App Resource ID')
output staticWebAppResourceId string = staticWebApp.outputs.resourceId

@description('Static Web App Deployment Token (use for CI/CD)')
@secure()
output staticWebAppDeploymentToken string = staticWebApp.outputs.apiKey

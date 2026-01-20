// ============================================================================
// Log Analytics Workspace Module
// ============================================================================
// Purpose: Centralized log storage for Application Insights and diagnostics
// AVM Reference: br/public:avm/res/operational-insights/workspace:0.15.0
// ============================================================================

// ============================================================================
// Parameters
// ============================================================================

@description('Name of the Log Analytics Workspace')
param name string

@description('Azure region for resource deployment')
param location string

@description('Tags to apply to the resource')
param tags object

@description('Data retention period in days (30-730)')
@minValue(30)
@maxValue(730)
param retentionInDays int = 30

@description('Daily quota in GB (-1 = unlimited)')
@minValue(-1)
@maxValue(100)
param dailyQuotaGb int = 1

@description('Pricing tier for the workspace')
@allowed([
  'PerGB2018'
  'Free'
  'Standalone'
  'PerNode'
  'Standard'
  'Premium'
])
param skuName string = 'PerGB2018'

// ============================================================================
// Resource - Log Analytics Workspace
// ============================================================================

resource logAnalyticsWorkspace 'Microsoft.OperationalInsights/workspaces@2023-09-01' = {
  name: name
  location: location
  tags: tags
  properties: {
    sku: {
      name: skuName
    }
    retentionInDays: retentionInDays
    workspaceCapping: dailyQuotaGb > 0
      ? {
          dailyQuotaGb: dailyQuotaGb
        }
      : null
    features: {
      enableLogAccessUsingOnlyResourcePermissions: true
    }
    publicNetworkAccessForIngestion: 'Enabled'
    publicNetworkAccessForQuery: 'Enabled'
  }
}

// ============================================================================
// Outputs
// ============================================================================

@description('Resource ID of the Log Analytics Workspace')
output resourceId string = logAnalyticsWorkspace.id

@description('Name of the Log Analytics Workspace')
output name string = logAnalyticsWorkspace.name

@description('Workspace ID (GUID) for linking')
output workspaceId string = logAnalyticsWorkspace.properties.customerId

@description('Primary shared key for workspace access')
@secure()
output primarySharedKey string = logAnalyticsWorkspace.listKeys().primarySharedKey

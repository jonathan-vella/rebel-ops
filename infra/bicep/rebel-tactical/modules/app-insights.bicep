// ============================================================================
// Application Insights Module
// ============================================================================
// Purpose: Application performance monitoring for frontend and API telemetry
// AVM Reference: br/public:avm/res/insights/component:0.7.1
// Governance: Workspace-based mode per Azure Security Baseline
// ============================================================================

// ============================================================================
// Parameters
// ============================================================================

@description('Name of the Application Insights instance')
param name string

@description('Azure region for resource deployment')
param location string

@description('Tags to apply to the resource')
param tags object

@description('Resource ID of the linked Log Analytics Workspace (required for workspace-based mode)')
param workspaceResourceId string

@description('Application type')
@allowed([
  'web'
  'other'
])
param applicationType string = 'web'

@description('Data retention period in days')
@minValue(30)
@maxValue(730)
param retentionInDays int = 30

@description('Telemetry sampling percentage (100 = no sampling)')
@minValue(1)
@maxValue(100)
param samplingPercentage int = 100

@description('Disable IP address masking for geolocation')
param disableIpMasking bool = false

@description('Enable local authentication (API key access)')
param disableLocalAuth bool = false

// ============================================================================
// Resource - Application Insights (Workspace-based)
// ============================================================================

resource applicationInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: name
  location: location
  tags: tags
  kind: 'web'
  properties: {
    Application_Type: applicationType
    WorkspaceResourceId: workspaceResourceId
    RetentionInDays: retentionInDays
    SamplingPercentage: samplingPercentage
    DisableIpMasking: disableIpMasking
    DisableLocalAuth: disableLocalAuth
    IngestionMode: 'LogAnalytics'
    publicNetworkAccessForIngestion: 'Enabled'
    publicNetworkAccessForQuery: 'Enabled'
  }
}

// ============================================================================
// Outputs
// ============================================================================

@description('Resource ID of the Application Insights instance')
output resourceId string = applicationInsights.id

@description('Name of the Application Insights instance')
output name string = applicationInsights.name

@description('Instrumentation Key for telemetry SDK (legacy)')
output instrumentationKey string = applicationInsights.properties.InstrumentationKey

@description('Connection String for modern SDK configuration')
output connectionString string = applicationInsights.properties.ConnectionString

@description('Application ID for API access')
output applicationId string = applicationInsights.properties.AppId

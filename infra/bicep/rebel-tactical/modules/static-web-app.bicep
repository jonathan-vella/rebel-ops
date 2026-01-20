// ============================================================================
// Static Web App Module
// ============================================================================
// Purpose: Host React frontend with managed Azure Functions API runtime
// AVM Reference: br/public:avm/res/web/static-site:0.9.3
// ============================================================================

// ============================================================================
// Parameters
// ============================================================================

@description('Name of the Static Web App')
param name string

@description('Azure region for resource deployment')
param location string

@description('Tags to apply to the resource')
param tags object

@description('Pricing tier for the Static Web App')
@allowed([
  'Free'
  'Standard'
])
param sku string = 'Standard'

@description('GitHub repository URL for deployment')
param repositoryUrl string = ''

@description('GitHub repository branch')
param repositoryBranch string = 'main'

@description('Location of app source code in repository')
param appLocation string = 'demo-app'

@description('Location of API source code in repository')
param apiLocation string = 'api'

@description('Build output location relative to app location')
param outputLocation string = 'dist'

@description('Application Insights connection string for telemetry')
@secure()
param appInsightsConnectionString string = ''

@description('Enable staging environments for preview')
@allowed([
  'Enabled'
  'Disabled'
])
param stagingEnvironmentPolicy string = 'Enabled'

@description('Enable enterprise-grade CDN')
@allowed([
  'Enabled'
  'Disabled'
])
param enterpriseGradeCdnStatus string = 'Disabled'

@description('Allow configuration file to override default settings')
param allowConfigFileUpdates bool = true

// ============================================================================
// Resource - Azure Static Web App
// ============================================================================

resource staticWebApp 'Microsoft.Web/staticSites@2023-12-01' = {
  name: name
  location: location
  tags: tags
  sku: {
    name: sku
    tier: sku
  }
  properties: {
    repositoryUrl: !empty(repositoryUrl) ? repositoryUrl : null
    branch: !empty(repositoryUrl) ? repositoryBranch : null
    buildProperties: !empty(repositoryUrl)
      ? {
          appLocation: appLocation
          apiLocation: apiLocation
          outputLocation: outputLocation
          skipGithubActionWorkflowGeneration: true
        }
      : null
    stagingEnvironmentPolicy: stagingEnvironmentPolicy
    allowConfigFileUpdates: allowConfigFileUpdates
    enterpriseGradeCdnStatus: enterpriseGradeCdnStatus
  }
}

// Configure app settings (including Application Insights connection)
resource staticWebAppSettings 'Microsoft.Web/staticSites/config@2023-12-01' = if (!empty(appInsightsConnectionString)) {
  parent: staticWebApp
  name: 'appsettings'
  properties: {
    APPLICATIONINSIGHTS_CONNECTION_STRING: appInsightsConnectionString
  }
}

// ============================================================================
// Outputs
// ============================================================================

@description('Resource ID of the Static Web App')
output resourceId string = staticWebApp.id

@description('Name of the Static Web App')
output name string = staticWebApp.name

@description('Default hostname of the Static Web App')
output defaultHostname string = staticWebApp.properties.defaultHostname

@description('Full URL of the Static Web App')
output url string = 'https://${staticWebApp.properties.defaultHostname}'

@description('Deployment token for CI/CD (API key)')
@secure()
output apiKey string = staticWebApp.listSecrets().properties.apiKey

@description('Content distribution endpoints')
output contentDistributionEndpoint string = staticWebApp.properties.contentDistributionEndpoint ?? ''

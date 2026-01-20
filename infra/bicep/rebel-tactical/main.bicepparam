// ============================================================================
// Rebel Tactical Platform - Production Parameters
// ============================================================================
// Purpose: Production environment parameter values
// Usage: az deployment sub create --location westeurope --template-file main.bicep --parameters main.bicepparam
// ============================================================================

using './main.bicep'

// Environment configuration
param environment = 'prod'
param projectName = 'rebel-tactical'
param location = 'westeurope'

// Governance tags
param owner = 'rebel-alliance-ops'
param costCenter = 'rebel-ops-001'
param technicalContact = 'rebel-devops@alliance.io'

// GitHub repository for Static Web App deployment
param repositoryUrl = 'https://github.com/jonathan-vella/rebel-ops'
param repositoryBranch = 'main'

<#
.SYNOPSIS
    Deploy the Rebel Tactical Platform infrastructure to Azure.

.DESCRIPTION
    This script deploys the Rebel Alliance Tactical Platform using Azure Bicep templates.
    It includes pre-flight validation, what-if analysis, and policy compliance checks.

.PARAMETER Environment
    Target environment: dev, staging, or prod. Default: prod

.PARAMETER Location
    Azure region for deployment. Default: westeurope

.PARAMETER WhatIf
    Perform what-if analysis without deploying resources.

.PARAMETER SkipValidation
    Skip Bicep build and lint validation.

.EXAMPLE
    ./deploy.ps1 -Environment prod -Location westeurope

.EXAMPLE
    ./deploy.ps1 -WhatIf

.NOTES
    Requires: Azure CLI 2.50+, Bicep CLI 0.20+
    Author: Rebel Alliance Engineering Corps
#>

[CmdletBinding(SupportsShouldProcess)]
param(
    [Parameter()]
    [ValidateSet('dev', 'staging', 'prod')]
    [string]$Environment = 'prod',

    [Parameter()]
    [ValidateSet('westeurope', 'swedencentral', 'germanywestcentral', 'northeurope')]
    [string]$Location = 'westeurope',

    [Parameter()]
    [switch]$SkipValidation
)

# ============================================================================
# Configuration
# ============================================================================

$ErrorActionPreference = 'Stop'
$ScriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$TemplateFile = Join-Path $ScriptPath 'main.bicep'
$ParameterFile = Join-Path $ScriptPath 'main.bicepparam'

# Project settings
$ProjectName = 'rebel-tactical'
$RegionAbbreviations = @{
    'westeurope' = 'weu'
    'swedencentral' = 'swc'
    'germanywestcentral' = 'gwc'
    'northeurope' = 'neu'
}
$LocationAbbr = $RegionAbbreviations[$Location]
$ResourceGroupName = "rg-$ProjectName-$Environment-$LocationAbbr"
$DeploymentName = "rebel-tactical-$(Get-Date -Format 'yyyyMMdd-HHmmss')"

# ============================================================================
# Banner
# ============================================================================

function Show-Banner {
    Write-Host ""
    Write-Host "╔═══════════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║                                                                       ║" -ForegroundColor Cyan
    Write-Host "║   🌟  REBEL ALLIANCE TACTICAL PLATFORM  🌟                           ║" -ForegroundColor Cyan
    Write-Host "║                                                                       ║" -ForegroundColor Cyan
    Write-Host "║   Infrastructure Deployment Script                                    ║" -ForegroundColor Cyan
    Write-Host "║   May the Force be with your deployment                              ║" -ForegroundColor Cyan
    Write-Host "║                                                                       ║" -ForegroundColor Cyan
    Write-Host "╚═══════════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
}

function Show-Section {
    param([string]$Title)
    Write-Host ""
    Write-Host "┌────────────────────────────────────────────────────────────────────┐" -ForegroundColor Yellow
    Write-Host "│  $($Title.PadRight(64))│" -ForegroundColor Yellow
    Write-Host "└────────────────────────────────────────────────────────────────────┘" -ForegroundColor Yellow
}

function Show-Step {
    param([string]$Number, [string]$Description)
    Write-Host "  [$Number] $Description" -ForegroundColor White
}

function Show-SubStep {
    param([string]$Label, [string]$Value)
    Write-Host "      └─ " -ForegroundColor DarkGray -NoNewline
    Write-Host "$Label" -ForegroundColor Gray -NoNewline
    Write-Host ": " -ForegroundColor DarkGray -NoNewline
    Write-Host "$Value" -ForegroundColor Green
}

function Show-Success {
    param([string]$Message)
    Write-Host ""
    Write-Host "✓ $Message" -ForegroundColor Green
}

function Show-Error {
    param([string]$Message)
    Write-Host ""
    Write-Host "✗ $Message" -ForegroundColor Red
}

function Show-Warning {
    param([string]$Message)
    Write-Host ""
    Write-Host "⚠ $Message" -ForegroundColor Yellow
}

# ============================================================================
# Pre-flight Checks
# ============================================================================

function Test-Prerequisites {
    Show-Section "PRE-FLIGHT CHECKS"

    # Check Azure CLI
    Show-Step "1/4" "Checking Azure CLI..."
    try {
        $azVersion = az version --output json | ConvertFrom-Json
        Show-SubStep "Azure CLI" $azVersion.'azure-cli'
    }
    catch {
        Show-Error "Azure CLI not found. Install from https://aka.ms/installazurecli"
        exit 1
    }

    # Check Bicep CLI
    Show-Step "2/4" "Checking Bicep CLI..."
    try {
        $bicepVersion = bicep --version
        Show-SubStep "Bicep" ($bicepVersion -replace 'Bicep CLI version ', '')
    }
    catch {
        Show-Error "Bicep CLI not found. Run: az bicep install"
        exit 1
    }

    # Check Azure login
    Show-Step "3/4" "Checking Azure authentication..."
    try {
        $account = az account show --output json | ConvertFrom-Json
        Show-SubStep "Subscription" $account.name
        Show-SubStep "Tenant" $account.tenantId
    }
    catch {
        Show-Error "Not logged in to Azure. Run: az login"
        exit 1
    }

    # Check template file exists
    Show-Step "4/4" "Checking template files..."
    if (-not (Test-Path $TemplateFile)) {
        Show-Error "Template file not found: $TemplateFile"
        exit 1
    }
    Show-SubStep "Template" (Split-Path -Leaf $TemplateFile)

    Show-Success "All pre-flight checks passed"
}

# ============================================================================
# Bicep Validation
# ============================================================================

function Test-BicepTemplate {
    Show-Section "TEMPLATE VALIDATION"

    # Build validation
    Show-Step "1/2" "Running bicep build..."
    $buildOutput = bicep build $TemplateFile --stdout --no-restore 2>&1
    if ($LASTEXITCODE -ne 0) {
        Show-Error "Bicep build failed:"
        Write-Host $buildOutput -ForegroundColor Red
        exit 1
    }
    Show-SubStep "Build" "Passed"

    # Lint validation
    Show-Step "2/2" "Running bicep lint..."
    $lintOutput = bicep lint $TemplateFile 2>&1
    if ($LASTEXITCODE -ne 0) {
        Show-Warning "Bicep lint warnings:"
        Write-Host $lintOutput -ForegroundColor Yellow
    }
    else {
        Show-SubStep "Lint" "Passed"
    }

    Show-Success "Template validation complete"
}

# ============================================================================
# Deployment
# ============================================================================

function Invoke-Deployment {
    Show-Section "DEPLOYMENT CONFIGURATION"

    Write-Host ""
    Write-Host "      • Environment: $Environment" -ForegroundColor White
    Write-Host "      • Location: $Location" -ForegroundColor White
    Write-Host "      • Resource Group: $ResourceGroupName" -ForegroundColor White
    Write-Host "      • Deployment: $DeploymentName" -ForegroundColor White

    # What-If Analysis
    Show-Section "WHAT-IF ANALYSIS"

    Show-Step "1/2" "Running what-if analysis..."
    $whatIfOutput = az deployment sub what-if `
        --location $Location `
        --template-file $TemplateFile `
        --parameters $ParameterFile `
        --parameters environment=$Environment location=$Location `
        --output json 2>&1

    if ($LASTEXITCODE -ne 0) {
        Show-Error "What-if analysis failed:"
        Write-Host $whatIfOutput -ForegroundColor Red
        exit 1
    }

    # Parse and display change summary
    try {
        $whatIfJson = $whatIfOutput | ConvertFrom-Json
        $changes = $whatIfJson.changes

        $createCount = ($changes | Where-Object { $_.changeType -eq 'Create' }).Count
        $modifyCount = ($changes | Where-Object { $_.changeType -eq 'Modify' }).Count
        $deleteCount = ($changes | Where-Object { $_.changeType -eq 'Delete' }).Count
        $noChangeCount = ($changes | Where-Object { $_.changeType -eq 'NoChange' }).Count

        Write-Host ""
        Write-Host "┌─────────────────────────────────────┐" -ForegroundColor Cyan
        Write-Host "│  CHANGE SUMMARY                      │" -ForegroundColor Cyan
        Write-Host "│  + Create: $($createCount.ToString().PadRight(3)) resources            │" -ForegroundColor Green
        Write-Host "│  ~ Modify: $($modifyCount.ToString().PadRight(3)) resources            │" -ForegroundColor Yellow
        Write-Host "│  - Delete: $($deleteCount.ToString().PadRight(3)) resources            │" -ForegroundColor Red
        Write-Host "│  = NoChange: $($noChangeCount.ToString().PadRight(3)) resources          │" -ForegroundColor Gray
        Write-Host "└─────────────────────────────────────┘" -ForegroundColor Cyan
    }
    catch {
        Show-Warning "Could not parse what-if output. Displaying raw output:"
        Write-Host $whatIfOutput
    }

    # WhatIf mode - stop here
    if ($WhatIfPreference) {
        Show-Success "What-if analysis complete (no changes deployed)"
        return
    }

    # Confirmation
    Show-Step "2/2" "Confirmation required..."
    Write-Host ""
    Write-Host "      Do you want to deploy these changes?" -ForegroundColor Yellow
    $confirmation = Read-Host "      Type 'yes' to proceed"

    if ($confirmation -ne 'yes') {
        Show-Warning "Deployment cancelled by user"
        exit 0
    }

    # Execute deployment
    Show-Section "DEPLOYING RESOURCES"

    Show-Step "1/1" "Deploying to Azure..."
    $deployOutput = az deployment sub create `
        --location $Location `
        --name $DeploymentName `
        --template-file $TemplateFile `
        --parameters $ParameterFile `
        --parameters environment=$Environment location=$Location `
        --output json 2>&1

    if ($LASTEXITCODE -ne 0) {
        Show-Error "Deployment failed:"
        Write-Host $deployOutput -ForegroundColor Red
        exit 1
    }

    $deployment = $deployOutput | ConvertFrom-Json

    # Display outputs
    Show-Section "DEPLOYMENT OUTPUTS"

    $outputs = $deployment.properties.outputs
    Write-Host ""
    Write-Host "      🌐 Static Web App URL:" -ForegroundColor White
    Write-Host "         https://$($outputs.staticWebAppHostname.value)" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "      📊 Resource Group: $($outputs.resourceGroupName.value)" -ForegroundColor White
    Write-Host "      📈 Log Analytics: $($outputs.logAnalyticsWorkspaceName.value)" -ForegroundColor White
    Write-Host "      🔍 App Insights: $($outputs.appInsightsConnectionString.value.Substring(0, 50))..." -ForegroundColor White

    Show-Success "DEPLOYMENT SUCCESSFUL"

    # Next Steps
    Show-Section "NEXT STEPS"

    Write-Host ""
    Write-Host "  1. Configure GitHub Actions with deployment token:" -ForegroundColor White
    Write-Host "     az staticwebapp secrets list -n stapp-$ProjectName-$Environment-$LocationAbbr" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  2. Verify policy compliance:" -ForegroundColor White
    Write-Host "     az policy state list --resource-group $ResourceGroupName -o table" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  3. Test the application:" -ForegroundColor White
    Write-Host "     curl https://$($outputs.staticWebAppHostname.value)/api/missions" -ForegroundColor Gray
    Write-Host ""
}

# ============================================================================
# Main Execution
# ============================================================================

Show-Banner
Test-Prerequisites

if (-not $SkipValidation) {
    Test-BicepTemplate
}

Invoke-Deployment

Write-Host ""
Write-Host "May the Force be with your deployments 🌟" -ForegroundColor Cyan
Write-Host ""

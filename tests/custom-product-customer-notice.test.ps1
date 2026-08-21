$ErrorActionPreference = 'Stop'

$themeRoot = Split-Path -Parent $PSScriptRoot
$customSection = Get-Content -LiteralPath (Join-Path $themeRoot 'sections\custom-product-main.liquid') -Raw
$defaultSection = Get-Content -LiteralPath (Join-Path $themeRoot 'sections\main-product.liquid') -Raw
$requiredStatements = @(
  'you own the copyright or have obtained all necessary permissions',
  'Do not upload film, television, anime, brand, celebrity, illegal, or otherwise prohibited content.',
  'right to refuse any order suspected of infringing intellectual property',
  'file-retention and deletion procedures',
  'limited licence to use the uploaded image solely as necessary to produce and fulfil your order',
  'complaint and takedown process'
)

function Assert-Contains([string]$Value, [string]$Expected, [string]$Message) {
  if (-not $Value.Contains($Expected)) { throw $Message }
}

Assert-Contains $customSection 'section.settings.customer_notice_heading' 'The custom product accordion must read the dedicated customer notice heading.'
Assert-Contains $customSection 'section.settings.customer_notice_content' 'The custom product accordion must read dedicated customer notice content.'
Assert-Contains $customSection '"default": "Customer Notice"' 'The custom product section must default to the approved English heading.'

foreach ($statement in $requiredStatements) {
  Assert-Contains $customSection $statement "The section schema must include the approved notice statement: $statement"
}

foreach ($templateName in @('product.custom.json', 'product.custom-css.json')) {
  $templateRaw = Get-Content -LiteralPath (Join-Path $themeRoot "templates\$templateName") -Raw
  $templateJson = [regex]::Replace($templateRaw, '(?s)/\*.*?\*/', '') | ConvertFrom-Json
  $settings = $templateJson.sections.main.settings

  if ($settings.customer_notice_heading -ne 'Customer Notice') {
    throw "$templateName must explicitly configure the approved Customer Notice heading."
  }
  foreach ($statement in $requiredStatements) {
    if (-not $settings.customer_notice_content.Contains($statement)) {
      throw "$templateName must include the approved notice statement: $statement"
    }
  }
}

if ($defaultSection.Contains('customer_notice_heading') -or $defaultSection.Contains('customer_notice_content')) {
  throw 'The default product section must remain independent from the custom-product customer notice.'
}

$defaultTemplateRaw = Get-Content -LiteralPath (Join-Path $themeRoot 'templates\product.json') -Raw
$defaultTemplateJson = [regex]::Replace($defaultTemplateRaw, '(?s)/\*.*?\*/', '') | ConvertFrom-Json
if ($defaultTemplateJson.sections.main.settings.product_details_heading -ne 'Product details') {
  throw 'The default product template Product details heading must remain unchanged.'
}

Write-Output 'Custom product customer notice checks passed.'

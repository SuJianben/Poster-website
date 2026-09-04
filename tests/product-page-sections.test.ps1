$ErrorActionPreference = 'Stop'

$themeRoot = Split-Path -Parent $PSScriptRoot
$mainSection = Get-Content -Raw (Join-Path $themeRoot 'sections/main-product.liquid')
$benefitsSection = Get-Content -Raw (Join-Path $themeRoot 'sections/product-benefits.liquid')
$lifestyleSection = Get-Content -Raw (Join-Path $themeRoot 'sections/product-lifestyle.liquid')
$informationSection = Get-Content -Raw (Join-Path $themeRoot 'sections/product-information-tabs.liquid')
$mainScript = Get-Content -Raw (Join-Path $themeRoot 'assets/product-showcase.js')
$informationScript = Get-Content -Raw (Join-Path $themeRoot 'assets/product-information-tabs.js')
$styles = Get-Content -Raw (Join-Path $themeRoot 'assets/product-showcase.css')
$template = Get-Content -Raw (Join-Path $themeRoot 'templates/product.json') | ConvertFrom-Json

$expectedOrder = @('main', 'benefits', 'lifestyle', 'information')
$actualOrder = @($template.order)
if (($actualOrder -join '|') -ne ($expectedOrder -join '|')) {
  throw "Expected product sections in red-line order: $($expectedOrder -join ', ')."
}

$expectedTypes = @{
  main = 'main-product'
  benefits = 'product-benefits'
  lifestyle = 'product-lifestyle'
  information = 'product-information-tabs'
}

foreach ($sectionId in $expectedTypes.Keys) {
  if ($template.sections.$sectionId.type -ne $expectedTypes[$sectionId]) {
    throw "Expected $sectionId to use section type $($expectedTypes[$sectionId])."
  }
}

foreach ($legacyModule in @('ps-benefits', 'ps-lifestyle', 'ps-description-shell')) {
  if ($mainSection -match [regex]::Escape($legacyModule)) {
    throw "Expected $legacyModule to be removed from the main product section."
  }
}

if ($benefitsSection -notmatch 'section\.blocks' -or $benefitsSection -notmatch 'block\.settings\.title' -or $benefitsSection -notmatch 'block\.settings\.text') {
  throw 'Expected product benefits to be editable and sortable Shopify blocks.'
}

if ($lifestyleSection -notmatch 'image_picker' -or $lifestyleSection -notmatch 'figma-lifestyle-hero\.jpg') {
  throw 'Expected the lifestyle section to expose an image picker and preserve the existing fallback image.'
}

if ($informationSection -notmatch 'section\.blocks' -or $informationSection -notmatch 'content_source' -or $informationSection -notmatch 'product\.description') {
  throw 'Expected product information tabs to be editable blocks with dynamic product content support.'
}

if ($mainScript -match 'data-ps-description-tab' -or $informationScript -notmatch 'shopify:section:load') {
  throw 'Expected information-tab behaviour to live in its own section-aware script.'
}

if ($informationScript -notmatch 'product_information_tab_changed') {
  throw 'Expected information-tab changes to expose a clear analytics event.'
}

foreach ($unchangedRule in @(
  '\.ps-benefits \{[^}]*margin-top: 58px;[^}]*padding: 27px',
  '\.ps-lifestyle \{ width: min\(100%, 1800px\); margin: 0 auto; \}',
  '\.ps-description-shell \{ width: min\(100% - 40px, 1430px\); margin: 76px auto 110px; \}'
)) {
  if ($styles -notmatch $unchangedRule) {
    throw 'Expected the original product-section visual rules to remain unchanged.'
  }
}

Write-Output 'PASS: Product page is split into four configurable sections without changing existing visual values.'

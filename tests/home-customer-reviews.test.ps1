$ErrorActionPreference = 'Stop'

$themeRoot = Split-Path -Parent $PSScriptRoot
$section = Get-Content -LiteralPath (Join-Path $themeRoot 'sections\home-customer-reviews.liquid') -Raw
$styles = Get-Content -LiteralPath (Join-Path $themeRoot 'assets\home-customer-reviews.css') -Raw
$indexPath = Join-Path $themeRoot 'templates\index.json'
$indexRaw = Get-Content -LiteralPath $indexPath -Raw
$index = $indexRaw -replace '(?s)^\s*/\*.*?\*/\s*', '' | ConvertFrom-Json

function Assert-Contains([string]$Value, [string]$Expected, [string]$Message) {
  if (-not $Value.Contains($Expected)) { throw $Message }
}

Assert-Contains $section "'home-customer-reviews.css' | asset_url | stylesheet_tag" 'Customer reviews must load their independent stylesheet.'
Assert-Contains $section 'data-home-customer-reviews' 'Customer reviews must expose a stable section hook.'
Assert-Contains $section 'data-review-content-source="theme-editor"' 'Review copy must expose its traceable theme-editor source.'
Assert-Contains $section 'section.settings.summary_stars' 'Overall star count must be theme-editor configurable.'
Assert-Contains $section 'block.settings.stars' 'Each review star count must be theme-editor configurable.'
Assert-Contains $section 'block.settings.label' 'Each review label must be theme-editor configurable.'
Assert-Contains $section 'block.settings.text' 'Each review body must be theme-editor configurable.'
Assert-Contains $section 'block.settings.author' 'Each review author must be theme-editor configurable.'
Assert-Contains $section 'block.shopify_attributes' 'Review blocks must remain selectable in the theme editor.'
Assert-Contains $styles '.hrw-section' 'Customer review CSS must use the hrw namespace.'
Assert-Contains $styles 'scroll-snap-type: x mandatory' 'Review cards must use a mobile-friendly horizontal rail.'

if ($section -match '(?i)verified buyer|70[,.]934|Rosanne|Belinda|Charles') {
  throw 'Reference-site review claims or identities must not be copied into the theme.'
}

$nonHrwSelectors = [regex]::Matches($styles, '(?m)^\s*\.([a-z][a-z0-9_-]*)') |
  ForEach-Object { $_.Groups[1].Value } |
  Where-Object { -not $_.StartsWith('hrw-') }
if ($nonHrwSelectors.Count -gt 0) {
  throw "Customer review CSS contains an unscoped selector: $($nonHrwSelectors[0])"
}

if ($index.sections.customer_reviews.type -ne 'home-customer-reviews') {
  throw 'Homepage must include the customer reviews section.'
}

if ($index.order[-1] -ne 'customer_reviews') {
  throw 'Customer reviews must be the final homepage content section before the global footer.'
}

if ($index.sections.customer_reviews.block_order.Count -ne 3) {
  throw 'Homepage must start with three editable review cards.'
}

Write-Output 'Homepage customer review checks passed.'

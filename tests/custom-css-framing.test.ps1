$ErrorActionPreference = 'Stop'

$themeRoot = Split-Path -Parent $PSScriptRoot
$section = Get-Content -LiteralPath (Join-Path $themeRoot 'sections\custom-product-main.liquid') -Raw
$renderer = Get-Content -LiteralPath (Join-Path $themeRoot 'assets\custom-css-framing.js') -Raw
$styles = Get-Content -LiteralPath (Join-Path $themeRoot 'assets\custom-css-framing.css') -Raw
$defaultSection = Get-Content -LiteralPath (Join-Path $themeRoot 'sections\main-product.liquid') -Raw

function Assert-Contains([string]$Value, [string]$Expected, [string]$Message) {
  if (-not $Value.Contains($Expected)) { throw $Message }
}

Assert-Contains $section 'data-ps-css-frame' 'Custom product section must render the CSS frame composition.'
Assert-Contains $renderer 'ResizeObserver' 'CSS frame renderer must respond to container changes.'
Assert-Contains $renderer "image.naturalWidth / image.naturalHeight" 'CSS frame renderer must fit the customer image using its real aspect ratio.'
Assert-Contains $styles 'data-frame-material="wood"' 'Wood frame styling is missing.'
Assert-Contains $styles 'data-frame-material="alu"' 'Aluminium frame styling is missing.'
if ($section.Contains("{{ 'custom-css-framing.css' | asset_url | stylesheet_tag }}")) { throw 'Archived CSS frame renderer must not be active on the custom template.' }
if ($section.Contains('<script src="{{ ''custom-css-framing.js''')) { throw 'Archived CSS frame script must not be active on the custom template.' }
if ($defaultSection.Contains('custom-css-framing')) { throw 'Default product page must not load custom CSS framing.' }

Write-Output 'Archived custom CSS framing checks passed.'

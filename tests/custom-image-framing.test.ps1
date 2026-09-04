$ErrorActionPreference = 'Stop'

$themeRoot = Split-Path -Parent $PSScriptRoot
$section = Get-Content -LiteralPath (Join-Path $themeRoot 'sections\custom-product-main.liquid') -Raw
$renderer = Get-Content -LiteralPath (Join-Path $themeRoot 'assets\custom-image-framing.js') -Raw
$styles = Get-Content -LiteralPath (Join-Path $themeRoot 'assets\custom-image-framing.css') -Raw
$catalog = Get-Content -LiteralPath (Join-Path $themeRoot 'assets\custom-framing-catalog.js') -Raw
$catalogSnippet = Get-Content -LiteralPath (Join-Path $themeRoot 'snippets\custom-framing-catalog.liquid') -Raw
$defaultSection = Get-Content -LiteralPath (Join-Path $themeRoot 'sections\main-product.liquid') -Raw

function Assert-Contains([string]$Value, [string]$Expected, [string]$Message) {
  if (-not $Value.Contains($Expected)) { throw $Message }
}

Assert-Contains $section 'custom-image-framing.js' 'Custom product section must load the PNG frame renderer.'
Assert-Contains $section 'data-ps-framing-layer="passepartout"' 'Custom product section must expose the passepartout preview layer.'
Assert-Contains $section 'data-ps-framing-layer="frame"' 'Custom product section must expose the frame preview layer.'
Assert-Contains $renderer 'selected?.preview?.[currentOrientation]' 'PNG renderer must select assets by cropped orientation.'
Assert-Contains $renderer 'root.productFramePreview' 'Framing controller bridge is missing.'
Assert-Contains $styles 'print-preview__layer--art' 'Artwork layer alignment styles are missing.'
Assert-Contains $catalog 'ps-frame' 'Fallback catalog must build frame preview URLs.'
Assert-Contains $catalogSnippet 'portrait_asset' 'Liquid catalog must emit orientation-specific preview assets.'
if ($defaultSection.Contains('custom-image-framing')) { throw 'Default product section must not load the custom image renderer.' }

Write-Output 'Custom image framing static checks passed.'

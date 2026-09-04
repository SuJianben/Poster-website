$ErrorActionPreference = 'Stop'

$themeRoot = Split-Path -Parent $PSScriptRoot
$section = Get-Content -LiteralPath (Join-Path $themeRoot 'sections\custom-product-main.liquid') -Raw
$snippet = Get-Content -LiteralPath (Join-Path $themeRoot 'snippets\custom-artwork-cropper.liquid') -Raw
$geometry = Get-Content -LiteralPath (Join-Path $themeRoot 'assets\custom-artwork-cropper-geometry.js') -Raw
$controller = Get-Content -LiteralPath (Join-Path $themeRoot 'assets\custom-artwork-cropper.js') -Raw
$defaultSection = Get-Content -LiteralPath (Join-Path $themeRoot 'sections\main-product.liquid') -Raw

function Assert-Contains([string]$Value, [string]$Expected, [string]$Message) {
  if (-not $Value.Contains($Expected)) { throw $Message }
}

Assert-Contains $section "render 'custom-artwork-cropper'" 'Custom product section must render the crop dialog.'
Assert-Contains $section 'custom-artwork-cropper-geometry.js' 'Crop geometry must load before the dialog controller.'
Assert-Contains $snippet 'data-ps-cropper-ratio="landscape"' 'Landscape crop ratio is missing.'
Assert-Contains $snippet 'data-ps-cropper-ratio="square"' 'Square crop ratio is missing.'
Assert-Contains $snippet 'data-ps-cropper-ratio="portrait"' 'Portrait crop ratio is missing.'
Assert-Contains $geometry 'resizeCrop' 'Locked-aspect resize geometry is missing.'
Assert-Contains $geometry 'toSourceRect' 'Displayed crop must map back to source pixels.'
Assert-Contains $controller "const ratios = { landscape: Math.SQRT2, square: 1, portrait: 1 / Math.SQRT2 }" 'Crop ratios must match the existing frame apertures.'
Assert-Contains $controller 'outputCanvas.toBlob' 'Confirmed crop must produce an uploadable image file.'
if ($defaultSection.Contains('custom-artwork-cropper')) { throw 'Default product section must not load the custom artwork cropper.' }

Write-Output 'Custom artwork cropper static checks passed.'

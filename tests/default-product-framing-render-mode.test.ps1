$ErrorActionPreference = 'Stop'

$themeRoot = Split-Path -Parent $PSScriptRoot
$section = Get-Content -LiteralPath (Join-Path $themeRoot 'sections\main-product.liquid') -Raw
$customSection = Get-Content -LiteralPath (Join-Path $themeRoot 'sections\custom-product-main.liquid') -Raw
$controller = Get-Content -LiteralPath (Join-Path $themeRoot 'assets\product-framing.js') -Raw
$renderer = Get-Content -LiteralPath (Join-Path $themeRoot 'assets\custom-css-framing.js') -Raw
$productStyles = Get-Content -LiteralPath (Join-Path $themeRoot 'assets\product-showcase.css') -Raw
$artworkSnippet = Get-Content -LiteralPath (Join-Path $themeRoot 'snippets\product-preview-artwork.liquid') -Raw
$railsSnippet = Get-Content -LiteralPath (Join-Path $themeRoot 'snippets\css-frame-rails.liquid') -Raw

function Read-ShopifyJson([string]$Path) {
  $content = Get-Content -LiteralPath $Path -Raw
  $json = [regex]::Replace($content, '^\s*/\*[\s\S]*?\*/\s*', '')
  return $json | ConvertFrom-Json
}

function Assert-Contains([string]$Value, [string]$Expected, [string]$Message) {
  if (-not $Value.Contains($Expected)) { throw $Message }
}

$schemaMatch = [regex]::Match($section, '\{% schema %\}(?<schema>[\s\S]*?)\{% endschema %\}')
if (-not $schemaMatch.Success) { throw 'Default product section schema is missing.' }
$schema = $schemaMatch.Groups['schema'].Value | ConvertFrom-Json
$toggle = $schema.settings | Where-Object { $_.id -eq 'enable_css_framing_preview' }
if (-not $toggle) { throw 'Default product CSS preview toggle is missing.' }
if ($toggle.type -ne 'checkbox') { throw 'Default product CSS preview toggle must be a checkbox.' }
if ($toggle.default -ne $false) { throw 'Default product CSS preview toggle must default to image rendering.' }

$productTemplate = Read-ShopifyJson (Join-Path $themeRoot 'templates\product.json')
$storedToggle = $productTemplate.sections.main.settings.enable_css_framing_preview
if ($null -ne $storedToggle -and $storedToggle -ne $false) {
  throw 'The live default product template must remain in image mode until the merchant enables CSS rendering.'
}

Assert-Contains $section "{% assign framing_render_mode = 'image' %}" 'Default product rendering must begin in image mode.'
Assert-Contains $section '{% if section.settings.enable_css_framing_preview %}' 'Default product rendering mode must be controlled by the theme-editor checkbox.'
Assert-Contains $section 'data-ps-framing-render-mode="{{ framing_render_mode }}"' 'Default product root must publish its selected rendering mode.'
Assert-Contains $section "{% if framing_render_mode == 'css' %}" 'CSS assets and markup must be conditional.'
Assert-Contains $section "'custom-css-framing.css' | asset_url" 'Default product CSS mode must load the shared frame stylesheet.'
Assert-Contains $section "'custom-css-framing.js' | asset_url" 'Default product CSS mode must load the shared frame renderer.'
Assert-Contains $section "render 'css-frame-rails'" 'Default product CSS mode must reuse the shared rail markup.'
Assert-Contains $section "render 'product-preview-artwork'" 'Default product must reuse the shared artwork markup.'
Assert-Contains $customSection "render 'product-preview-artwork'" 'Custom product must reuse the shared artwork markup.'
Assert-Contains $controller "const usesCssPreview = renderMode === 'css';" 'Default framing controller must branch by rendering mode.'
Assert-Contains $controller 'root.productFramePreview?.update({' 'CSS mode must delegate preview rendering to the shared renderer.'
Assert-Contains $controller 'layer.removeAttribute(''src'');' 'CSS mode must clear stale image-layer sources.'
Assert-Contains $controller 'render_mode: renderMode' 'Framing analytics must record the active rendering mode.'
Assert-Contains $renderer "event: 'css_framing_preview_initialized'" 'Shared CSS renderer must emit a generic initialization event.'
Assert-Contains $renderer 'product_context: productContext' 'CSS renderer analytics must identify the product context.'
Assert-Contains $productStyles '.ps-section[data-ps-framing-render-mode="image"] .ps-print-preview .print-preview__inner[data-has-passepartout="true"] .print-preview__layer--art' 'Legacy passepartout artwork scaling must be limited to image rendering.'
if ($productStyles -match '(?m)^\s*\.ps-print-preview \.print-preview__inner\[data-has-passepartout="true"\] \.print-preview__layer--art') {
  throw 'CSS rendering must not inherit the legacy 57% image-layer scale.'
}
Assert-Contains $section 'data-ps-framing-layer="passepartout"' 'Image-mode passepartout layer must remain available.'
Assert-Contains $section 'data-ps-framing-layer="frame"' 'Image-mode frame layer must remain available.'

$railCount = ([regex]::Matches($railsSnippet, 'data-ps-css-frame-rail=')).Count
if ($railCount -ne 4) { throw "Expected four shared frame rails, found $railCount." }
Assert-Contains $artworkSnippet 'data-ps-main-image' 'Shared artwork snippet must retain the main image hook.'
Assert-Contains $artworkSnippet 'data-pdp-print-art' 'Shared artwork snippet must retain the print preview hook.'

Write-Output 'Default product framing render-mode checks passed.'

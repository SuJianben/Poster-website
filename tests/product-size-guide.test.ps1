$ErrorActionPreference = 'Stop'

$themeRoot = Split-Path -Parent $PSScriptRoot
$snippet = Get-Content -LiteralPath (Join-Path $themeRoot 'snippets\product-size-guide.liquid') -Raw
$styles = Get-Content -LiteralPath (Join-Path $themeRoot 'assets\product-size-guide.css') -Raw
$script = Get-Content -LiteralPath (Join-Path $themeRoot 'assets\product-size-guide.js') -Raw
$defaultSection = Get-Content -LiteralPath (Join-Path $themeRoot 'sections\main-product.liquid') -Raw
$defaultPurchaseBlocks = Get-Content -LiteralPath (Join-Path $themeRoot 'snippets\product-purchase-block.liquid') -Raw
$customSection = Get-Content -LiteralPath (Join-Path $themeRoot 'sections\custom-product-main.liquid') -Raw
$customPurchaseBlocks = Get-Content -LiteralPath (Join-Path $themeRoot 'snippets\custom-product-purchase-block.liquid') -Raw

function Assert-Contains([string]$Value, [string]$Expected, [string]$Message) {
  if (-not $Value.Contains($Expected)) { throw $Message }
}

foreach ($section in @($defaultSection, $customSection)) {
  Assert-Contains $section "'product-size-guide.css' | asset_url" 'Every product context must load the shared size-guide styles.'
  Assert-Contains $section "'product-size-guide.js' | asset_url" 'Every product context must load the shared size-guide controller.'
  Assert-Contains $section "render 'product-size-guide'" 'Every product context must render the shared size-guide modal.'
}

Assert-Contains $defaultPurchaseBlocks 'data-ps-size-guide-open' 'The default product Size guide block must expose the shared open hook.'
Assert-Contains $customPurchaseBlocks "render 'product-purchase-block'" 'Custom products must delegate shared purchase controls to the common renderer.'
Assert-Contains $defaultPurchaseBlocks 'data-ps-size-guide-open' 'The shared Size guide block must expose the open hook used by custom products.'

Assert-Contains $snippet 'product.options_with_values' 'The size guide must read the current product option values.'
Assert-Contains $snippet "normalized_option_name contains 'size'" 'The size guide must select the current product Size option.'
Assert-Contains $snippet 'data-size-label="{{ value | escape }}"' 'Every available size must be exposed to proportional rendering.'
Assert-Contains $snippet 'role="dialog"' 'The size guide must use accessible dialog semantics.'
Assert-Contains $styles '.ps-size-guide-modal__poster' 'The size guide must draw each size with CSS.'
Assert-Contains $styles '@media (max-width: 749px)' 'The size guide must include a dedicated mobile layout.'
Assert-Contains $script "event: 'product_size_guide_open'" 'Opening the guide must expose a clearly named analytics event.'
Assert-Contains $script "event.key === 'Escape'" 'The size guide must close with Escape.'
Assert-Contains $script 'shopify:section:load' 'The size guide must initialize after theme-editor section reloads.'

Write-Output 'Product size guide checks passed.'

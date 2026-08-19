$ErrorActionPreference = 'Stop'

$themeRoot = Split-Path -Parent $PSScriptRoot
$snippet = Get-Content -LiteralPath (Join-Path $themeRoot 'snippets\shopify-payment-icons.liquid') -Raw
$styles = Get-Content -LiteralPath (Join-Path $themeRoot 'assets\shopify-payment-icons.css') -Raw
$mainProduct = Get-Content -LiteralPath (Join-Path $themeRoot 'sections\main-product.liquid') -Raw
$customProduct = Get-Content -LiteralPath (Join-Path $themeRoot 'sections\custom-product-main.liquid') -Raw
$cartMarkup = Get-Content -LiteralPath (Join-Path $themeRoot 'snippets\cart-drawer.liquid') -Raw
$cartScript = Get-Content -LiteralPath (Join-Path $themeRoot 'assets\cart-drawer.js') -Raw
$layout = Get-Content -LiteralPath (Join-Path $themeRoot 'layout\theme.liquid') -Raw
$legacyStyles = @(
  Get-Content -LiteralPath (Join-Path $themeRoot 'assets\product-showcase.css') -Raw
  Get-Content -LiteralPath (Join-Path $themeRoot 'assets\custom-product.css') -Raw
  Get-Content -LiteralPath (Join-Path $themeRoot 'assets\cart-drawer.css') -Raw
) -join "`n"

function Assert-Contains([string]$Value, [string]$Expected, [string]$Message) {
  if (-not $Value.Contains($Expected)) { throw $Message }
}

Assert-Contains $snippet 'shop.enabled_payment_types' 'Payment icons must come from the payment methods enabled in Shopify admin.'
Assert-Contains $snippet 'payment_type_svg_tag' 'Payment methods must use Shopify-native SVG icons.'
Assert-Contains $snippet 'data-payment-source="shop.enabled_payment_types"' 'The rendered icon list must expose its traceable Shopify data source.'
Assert-Contains $snippet 'role="list"' 'The icon collection must retain list semantics.'
Assert-Contains $mainProduct "render 'shopify-payment-icons', context: 'product'" 'Default products must use the shared Shopify payment icon snippet.'
Assert-Contains $customProduct "render 'shopify-payment-icons', context: 'product'" 'Custom product templates must use the shared Shopify payment icon snippet.'
Assert-Contains $cartMarkup 'data-cart-drawer-payment-icons' 'The cart drawer must provide server-rendered payment icons to its JavaScript renderer.'
Assert-Contains $cartMarkup "render 'shopify-payment-icons', context: 'cart'" 'The cart drawer must use the shared Shopify payment icon snippet.'
Assert-Contains $cartScript "drawer.querySelector('[data-cart-drawer-payment-icons]')" 'The cart drawer controller must read its Shopify-rendered icon template.'
Assert-Contains $cartScript '${paymentIconsMarkup}' 'The cart drawer footer must insert the server-rendered payment icons.'
Assert-Contains $styles '.shopify-payment-icons--cart' 'Shared payment icon styles must include a cart-drawer layout.'
Assert-Contains $styles '.shopify-payment-icons__icon' 'Shared payment icon styles must size Shopify SVGs consistently.'
Assert-Contains $layout "'shopify-payment-icons.css' | asset_url" 'The theme layout must load the shared payment icon stylesheet globally.'
Assert-Contains $layout 'drawer_build=shopify-payment-icons-v1-20260819' 'The updated cart drawer script must use a cache-busting version.'

$hardcodedLabels = @('AMEX', 'Apple Pay', 'G Pay', '>PayPal<', '>VISA<', '>Klarna<', 'Pay')
foreach ($label in $hardcodedLabels) {
  if ($mainProduct.Contains($label) -or $customProduct.Contains($label) -or $cartScript.Contains($label)) {
    throw "Hardcoded payment label remains in a storefront payment entry point: $label"
  }
}

if ($legacyStyles -match '\.ps-payment-badges|\.cd-drawer__payment(?:\s|\{|--)') {
  throw 'Obsolete hardcoded payment badge styles must be removed.'
}

Write-Output 'Shopify payment icon checks passed.'

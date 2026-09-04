$ErrorActionPreference = 'Stop'

$layout = Get-Content -Raw (Join-Path $PSScriptRoot '..\layout\theme.liquid')
$header = Get-Content -Raw (Join-Path $PSScriptRoot '..\sections\header.liquid')
$productScript = Get-Content -Raw (Join-Path $PSScriptRoot '..\assets\product-showcase.js')
$drawerScript = Get-Content -Raw (Join-Path $PSScriptRoot '..\assets\cart-drawer.js')
$drawerStyles = Get-Content -Raw (Join-Path $PSScriptRoot '..\assets\cart-drawer.css')

foreach ($file in @('snippets\cart-drawer.liquid', 'assets\cart-drawer.css', 'assets\cart-drawer.js')) {
  if (-not (Test-Path (Join-Path $PSScriptRoot "..\\$file"))) {
    throw "Expected cart drawer module file to exist: $file"
  }
}

if ($layout -notmatch "render 'cart-drawer'" -or $header -notmatch 'data-cart-drawer-open') {
  throw 'Expected the global cart drawer to be rendered from the layout and opened from the header cart control.'
}

if ($productScript -notmatch 'cart/add\.js' -or $productScript -notmatch 'cart:updated' -or $productScript -notmatch 'CartDrawer\?\.open') {
  throw 'Expected product add-to-cart to update Shopify cart data and open the drawer without a page navigation.'
}

if ($drawerScript -notmatch 'window\.CartDrawer' -or $drawerScript -notmatch 'openLoading') {
  throw 'Expected cart drawer to expose its immediate-open product-page bridge.'
}

if ($drawerScript -notmatch 'cd-drawer__checkout-label' -or $drawerStyles -notmatch 'cd-drawer__checkout::before' -or $drawerStyles -notmatch 'transform: scaleX\(1\)') {
  throw 'Expected checkout control to use the shared left-to-right sweep animation.'
}

Write-Output 'PASS: Cart drawer module and add-to-cart integration hooks are present.'

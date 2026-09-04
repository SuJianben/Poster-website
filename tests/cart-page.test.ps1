$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$section = Get-Content -Raw (Join-Path $root 'sections/main-cart.liquid')
$styles = Get-Content -Raw (Join-Path $root 'assets/cart-page.css')
$script = Get-Content -Raw (Join-Path $root 'assets/cart-page.js')

function Assert-Contains([string]$Content, [string]$Needle, [string]$Label) {
  if (-not $Content.Contains($Needle)) { throw "Missing ${Label}: $Needle" }
}

Assert-Contains $section "cp-cart__layout" 'two-column cart layout'
Assert-Contains $section "data-cart-page-count" 'live cart title count'
Assert-Contains $section 'name="updates[]"' 'native cart quantity input'
Assert-Contains $section 'name="checkout"' 'native checkout submit action'
Assert-Contains $section "recommendation_collection" 'recent-products collection setting'
Assert-Contains $styles "grid-template-columns: minmax(0, 1fr) 405px" 'desktop summary column'
Assert-Contains $styles "padding-top: 72px" 'header offset for cart content'
Assert-Contains $styles "@media (max-width: 900px)" 'responsive cart layout'
Assert-Contains $script "data-cart-recent-scroll" 'recent-products carousel controls'
Assert-Contains $script "data-cart-page-count" 'cart title count refresh'

Write-Output 'Cart page structure checks passed.'

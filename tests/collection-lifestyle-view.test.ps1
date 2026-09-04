$ErrorActionPreference = 'Stop'

$themeRoot = Split-Path -Parent $PSScriptRoot
$liquidPath = Join-Path $themeRoot 'sections/main-collection.liquid'
$scriptPath = Join-Path $themeRoot 'assets/collection-gallery.js'
$stylePath = Join-Path $themeRoot 'assets/collection-gallery.css'

$liquid = Get-Content -Raw -LiteralPath $liquidPath
$script = Get-Content -Raw -LiteralPath $scriptPath
$style = Get-Content -Raw -LiteralPath $stylePath

function Assert-Contains {
  param(
    [string]$Text,
    [string]$Pattern,
    [string]$Message
  )

  if ($Text -notmatch $Pattern) {
    throw $Message
  }
}

function Assert-NotContains {
  param(
    [string]$Text,
    [string]$Pattern,
    [string]$Message
  )

  if ($Text -match $Pattern) {
    throw $Message
  }
}

Assert-Contains $liquid 'data-view="product"' 'Collection root must default to the product view.'
Assert-Contains $liquid 'data-cg-has-lifestyle=' 'Each product card must declare whether a second image exists.'
Assert-Contains $liquid 'product\.images\[1\]' 'Lifestyle view must use the product second image.'
Assert-Contains $liquid 'data-cg-view="product" aria-pressed="true"' 'Product control must expose its initial selected state.'
Assert-Contains $liquid 'data-cg-view="lifestyle" aria-pressed="false"' 'Lifestyle control must expose its initial unselected state.'

Assert-Contains $script 'root\.dataset\.view = view' 'View switching must update the collection root state.'
Assert-Contains $script 'previousView === view' 'Repeated clicks on the active view must not emit duplicate tracking.'
Assert-Contains $script 'collection_view_changed' 'View switching must expose a clear analytics event.'
Assert-NotContains $script 'index\s*%\s*3' 'Lifestyle view must not target every third product.'
Assert-NotContains $script 'is-lifestyle' 'Lifestyle view must be driven by the root view state, not per-card patches.'

Assert-Contains $style "data-view='product'.*data-cg-has-lifestyle='true'" 'Product hover preview must only target cards with a second image.'
Assert-Contains $style "data-view='lifestyle'.*data-cg-has-lifestyle='true'.*cg-product-hover-image" 'Lifestyle view must show the second image for every eligible product.'
Assert-NotContains $style '\.cg-product\.is-lifestyle' 'Legacy every-third-card lifestyle styling must be removed.'

Write-Output 'Collection lifestyle view regression checks passed.'

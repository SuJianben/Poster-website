$ErrorActionPreference = 'Stop'

$themeRoot = Split-Path -Parent $PSScriptRoot
$section = Get-Content -LiteralPath (Join-Path $themeRoot 'sections\main-collection.liquid') -Raw
$styles = Get-Content -LiteralPath (Join-Path $themeRoot 'assets\collection-gallery.css') -Raw
$script = Get-Content -LiteralPath (Join-Path $themeRoot 'assets\collection-gallery.js') -Raw

function Assert-Contains([string]$Value, [string]$Expected, [string]$Message) {
  if (-not $Value.Contains($Expected)) { throw $Message }
}

Assert-Contains $section 'assign discount_badge = section.settings.discount_badge_text' 'Collection cards must use the configurable homepage-style discount badge.'
Assert-Contains $section 'assign discount_percentage = discount_saving | times: 100.0 | divided_by: product.compare_at_price_max | round' 'Collection sale products must show their real discount percentage.'
Assert-Contains $section 'class="cg-badge">{{ discount_badge }}' 'Collection cards must render the resolved badge in the media corner.'
Assert-Contains $section '"id": "discount_badge_text"' 'The collection badge fallback label must be configurable.'
Assert-Contains $section 'data-product-handle="{{ product.handle | escape }}"' 'Collection hover analytics must retain the product handle.'
Assert-Contains $section "'collection-gallery.css' | asset_url | append: '&cg=20260821-spacing-1'" 'Collection CSS must use the current cache-busting version.'

Assert-Contains $styles '.cg-product-media .cg-product-hover-image' 'The second product image must use a media-scoped full-cover rule.'
Assert-Contains $styles 'width: 100%; height: 100%; margin: 0; object-fit: cover; mix-blend-mode: normal;' 'The second product image must fill the complete collection card media container.'
Assert-Contains $styles 'background: #8dc29c;' 'The collection badge must use the approved homepage green.'
Assert-Contains $styles 'color: #fff;' 'The collection badge must use white text.'
Assert-Contains $styles 'text-transform: uppercase;' 'The collection badge typography must match the homepage badge.'
Assert-Contains $styles 'padding: 104px 0 72px;' 'The desktop collection spacing must remain unchanged.'
Assert-Contains $styles '.cg-collection { padding: 44px 0;' 'The mobile collection spacing must use 44px above and below.'
if ($styles.Contains('.cg-collection { padding: 92px 0 44px;')) {
  throw 'The obsolete oversized mobile collection top padding must not return.'
}

Assert-Contains $script "event: 'collection_product_hover_image'" 'Collection second-image hover must emit a traceable analytics event.'
Assert-Contains $script "root.dataset.view !== 'product'" 'Hover analytics must only run in the product view.'
Assert-Contains $script "card.dataset.cgHoverTracked === 'true'" 'Each product hover must be tracked only once per page view.'

Write-Output 'Collection product card badge and hover checks passed.'

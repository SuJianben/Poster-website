$ErrorActionPreference = 'Stop'

$themeRoot = Split-Path -Parent $PSScriptRoot
$section = Get-Content -LiteralPath (Join-Path $themeRoot 'sections\featured-products.liquid') -Raw
$styles = Get-Content -LiteralPath (Join-Path $themeRoot 'assets\featured-flow.css') -Raw
$script = Get-Content -LiteralPath (Join-Path $themeRoot 'assets\featured-flow.js') -Raw

function Assert-Contains([string]$Value, [string]$Expected, [string]$Message) {
  if (-not $Value.Contains($Expected)) { throw $Message }
}

Assert-Contains $section 'product.metafields.custom.artist' 'Featured cards must source their eyebrow from the product artist metafield.'
Assert-Contains $section 'product.media[1]' 'Featured cards must use the second product media item for hover preview.'
Assert-Contains $section 'tilted-carousel__primary-image' 'Featured cards must render a dedicated primary image layer.'
Assert-Contains $section 'tilted-carousel__hover-image' 'Featured cards must render a dedicated hover image layer.'
Assert-Contains $section 'tilted-carousel__details' 'Featured product information must render in a content-below container.'
Assert-Contains $section 'draggable="false" data-tilted-select' 'Featured card links must not steal the existing mobile swipe gesture.'
Assert-Contains $section 'From {{ product.price_min | money }}' 'Featured cards must show the product starting price.'
Assert-Contains $section 'product.compare_at_price_max > product.price_min' 'Featured cards must only show a struck-through price when a real comparison price exists.'

$imageEnd = $section.IndexOf('</a>', $section.IndexOf('class="tilted-carousel__image"'))
$detailsStart = $section.IndexOf('class="tilted-carousel__details"')
if ($imageEnd -lt 0 -or $detailsStart -lt 0 -or $detailsStart -lt $imageEnd) {
  throw 'Featured product details must be placed after, not inside, the image card.'
}

if ($section.Contains('data-tilted-product') -or $section.Contains('data-tilted-title') -or $section.Contains('data-tilted-meta')) {
  throw 'The old shared product-information panel must be removed.'
}

Assert-Contains $styles 'rotateY(calc((var(--tc-active) - var(--tc-index)) * 60deg))' 'The original tilted carousel effect must remain intact.'
Assert-Contains $styles '.tilted-carousel__slide.has-hover-image:hover .tilted-carousel__primary-image' 'Hover must fade the primary image out when a second image exists.'
Assert-Contains $styles '.tilted-carousel__slide.has-hover-image:hover .tilted-carousel__hover-image' 'Hover must reveal the second product image.'
Assert-Contains $styles 'opacity: 0;' 'The hover image must remain hidden before interaction.'
Assert-Contains $styles 'opacity: 1;' 'The hover image must become visible during interaction.'

if ($styles.Contains('linear-gradient') -or $styles.Contains('.tilted-carousel__image::after') -or $styles.Contains('.tilted-carousel__image:after')) {
  throw 'Featured product images must not render a dark overlay.'
}

Assert-Contains $script 'featured_product_hover_image' 'Second-image hover interactions must emit a traceable analytics event.'
if ($script.Contains('data-tilted-title') -or $script.Contains('data-tilted-meta') -or $script.Contains('data-tilted-link')) {
  throw 'Featured carousel JavaScript must not retain the removed shared product panel logic.'
}

Write-Output 'Featured product card layout checks passed.'

$ErrorActionPreference = 'Stop'

$themeRoot = Split-Path -Parent $PSScriptRoot
$section = Get-Content -LiteralPath (Join-Path $themeRoot 'sections\editorial-with-products.liquid') -Raw
$styles = Get-Content -LiteralPath (Join-Path $themeRoot 'assets\editorial-depth-cards.css') -Raw
$script = Get-Content -LiteralPath (Join-Path $themeRoot 'assets\editorial-depth-cards.js') -Raw
$featuredSection = Get-Content -LiteralPath (Join-Path $themeRoot 'sections\featured-products.liquid') -Raw

function Assert-Contains([string]$Value, [string]$Expected, [string]$Message) {
  if (-not $Value.Contains($Expected)) { throw $Message }
}

Assert-Contains $section 'product.media[1]' 'Editorial cards must use the second product media item for hover preview.'
Assert-Contains $section 'editorial-depth-card__image--primary' 'Editorial cards must render a primary image layer.'
Assert-Contains $section 'editorial-depth-card__image--hover' 'Editorial cards must render a hover image layer.'
Assert-Contains $section 'class="editorial-depth-card__content"' 'Editorial product information must render in its own container.'
Assert-Contains $section 'From {{ product.price_min | money }}' 'Editorial cards must show the product starting price.'
Assert-Contains $section 'product.metafields.custom.artist' 'Editorial cards must source the product artist when available.'

$surfaceStart = $section.IndexOf('class="editorial-depth-card__surface"', $section.IndexOf('for product in section.settings.collection.products'))
$surfaceEnd = $section.IndexOf('</a>', $surfaceStart)
$contentStart = $section.IndexOf('class="editorial-depth-card__content"', $surfaceStart)
if ($surfaceStart -lt 0 -or $surfaceEnd -lt 0 -or $contentStart -lt 0 -or $contentStart -lt $surfaceEnd) {
  throw 'Editorial product information must be a sibling below the complete image card, not a child inside it.'
}

if ($styles.Contains('.editorial-depth-card__surface::after') -or $styles.Contains('linear-gradient')) {
  throw 'Editorial image cards must not render the old dark overlay.'
}
Assert-Contains $styles '.editorial-depth-card.has-hover-image:hover .editorial-depth-card__image--primary' 'Hover must hide the primary product image.'
Assert-Contains $styles '.editorial-depth-card.has-hover-image:hover .editorial-depth-card__image--hover' 'Hover must reveal the second product image.'
Assert-Contains $styles '.editorial-depth-card__content {' 'The content-below layout must have a dedicated static content block.'
Assert-Contains $script 'editorial_product_hover_image' 'Second-image hover must emit a traceable analytics event.'

if ($featuredSection.Contains('tilted-carousel__details') -or $featuredSection.Contains('tilted-carousel__hover-image')) {
  throw 'The unrelated tilted carousel must remain restored to its previous implementation.'
}

Write-Output 'Editorial product card layout checks passed.'

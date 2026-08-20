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
Assert-Contains $section 'editorial-depth-card__media' 'Editorial cards must render artwork inside a dedicated padded media layer.'
Assert-Contains $section 'card_artwork_padding' 'Editorial card artwork margin must be configurable in the theme editor.'
Assert-Contains $section '--depth-artwork-padding: {{ section.settings.card_artwork_padding | default: 12 }}%;' 'The collection-matched artwork margin must flow into the card CSS variable.'
Assert-Contains $section '"min":1,"max":20,"step":1,"unit":"%","default":12' 'The artwork margin editor must default to the collection grid horizontal inset.'
Assert-Contains $section 'editorial-depth-card__badge' 'Editorial product cards must render the discount badge.'
Assert-Contains $section 'discount_badge_text' 'The pre-compare-at discount badge label must remain configurable.'
Assert-Contains $section "assign discount_percentage = discount_saving | times: 100.0 | divided_by: product.compare_at_price_max | round" 'Compare-at pricing must automatically produce a real discount percentage.'

$productMediaStart = $section.IndexOf('<span class="editorial-depth-card__media">', $section.IndexOf('for product in section.settings.collection.products'))
$productMediaEnd = $section.IndexOf('</span>', $productMediaStart)
$productHoverStart = $section.IndexOf("class: 'editorial-depth-card__image editorial-depth-card__image--hover'", $productMediaStart)
if ($productMediaStart -lt 0 -or $productMediaEnd -lt 0 -or $productHoverStart -lt $productMediaEnd) {
  throw 'The second product image must sit outside the padded artwork layer so it can cover the complete card.'
}

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
Assert-Contains $styles 'inset: max(0%, calc(var(--depth-artwork-padding, 12%) - 1%)) var(--depth-artwork-padding, 12%);' 'Artwork must match the collection grid 76% by 78% media size at the default setting.'
Assert-Contains $styles 'object-fit: contain;' 'Landscape and portrait artwork must remain fully visible without cropping.'
Assert-Contains $styles 'object-fit: cover;' 'The second product image must cover the complete card on hover.'
Assert-Contains $styles 'inset #ebebeb 0 0 0 1px' 'Editorial cards must retain one #ebebeb inner frame.'
Assert-Contains $styles 'background: #8dc29c;' 'The discount badge must use the approved green background.'
Assert-Contains $styles 'rgba(0, 0, 0, .14) 0 14px 28px 0' 'Hover must reveal only a subtle outer shadow.'
Assert-Contains $styles 'box-shadow .55s ease-out' 'The hover shadow must fade out smoothly when the pointer leaves.'
if ($styles.Contains('inset #333 0 0 0 5px')) {
  throw 'Editorial cards must not render the removed thick black frame.'
}
Assert-Contains $script 'editorial_product_hover_image' 'Second-image hover must emit a traceable analytics event.'

if ($featuredSection.Contains('tilted-carousel__details') -or $featuredSection.Contains('tilted-carousel__hover-image')) {
  throw 'The unrelated tilted carousel must remain restored to its previous implementation.'
}

Write-Output 'Editorial product card layout checks passed.'

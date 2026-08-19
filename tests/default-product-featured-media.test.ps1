$ErrorActionPreference = 'Stop'

$themeRoot = Split-Path -Parent $PSScriptRoot
$section = Get-Content -LiteralPath (Join-Path $themeRoot 'sections\main-product.liquid') -Raw
$customSection = Get-Content -LiteralPath (Join-Path $themeRoot 'sections\custom-product-main.liquid') -Raw
$script = Get-Content -LiteralPath (Join-Path $themeRoot 'assets\product-showcase.js') -Raw

function Assert-Contains([string]$Value, [string]$Expected, [string]$Message) {
  if (-not $Value.Contains($Expected)) { throw $Message }
}

Assert-Contains $section "{% assign image_media = product.media | where: 'media_type', 'image' %}" 'Default product must identify image media independently from gallery position.'
Assert-Contains $section '{% assign preview_media = selected_variant.featured_media | default: product.featured_media | default: image_media.first %}' 'Default product must prefer featured media and fall back to the first image.'
Assert-Contains $section "{% unless preview_media.media_type == 'image' %}" 'Default product must reject non-image featured media for the artwork preview.'
Assert-Contains $section '{% assign preview_media = image_media.first %}' 'Default product must fall back to the first image when featured media is not an image.'
Assert-Contains $section '{% assign selected_media = preview_media %}' 'Default product thumbnail selection must use the same media as the main artwork.'
Assert-Contains $section 'media.id == selected_media.id' 'Default product must mark the rendered artwork thumbnail as active.'
Assert-Contains $section 'data-media-id="{{ media.id }}"' 'Default product thumbnails must expose their Shopify media IDs.'
Assert-Contains $section 'data-media-id="{{ preview_media.id | default: product.media.first.id }}"' 'Default product preview must expose the rendered artwork media ID.'
Assert-Contains $section "render 'product-preview-artwork', preview_media: preview_media, product: product" 'Default product main image must render the declared preview media.'
Assert-Contains $section "'product-showcase.js' | asset_url }}&psv=featured-media-v1-20260819" 'Default product must invalidate the browser cache for the media-role fix.'
Assert-Contains $script "const customPreviewMediaId = artPreview?.dataset.mediaId || activeMediaId;" 'Framing must use the media role declared by the default product preview.'
Assert-Contains $script "root.addEventListener('product:show-custom-preview'" 'Default product must continue listening for framing preview requests.'
Assert-Contains $script 'setMedia(customPreviewMediaId);' 'Framing preview requests must switch to the declared artwork media.'

if ($section.Contains("product.media | where: 'media_type', 'image' | last")) {
  throw 'Default product must not infer the clean artwork from the last gallery image.'
}
if ($script.Contains("root.querySelectorAll('[data-ps-media]')].at(-1)")) {
  throw 'Default product script must not infer the framing preview from the last thumbnail.'
}

Assert-Contains $customSection "{% assign preview_media = product.media | where: 'media_type', 'image' | last %}" 'Custom product media behavior must remain unchanged.'

Write-Output 'Default product featured-media role checks passed.'

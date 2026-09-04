$ErrorActionPreference = 'Stop'

$themeRoot = Split-Path -Parent $PSScriptRoot
$section = Get-Content -LiteralPath (Join-Path $themeRoot 'sections\custom-product-main.liquid') -Raw
$snippet = Get-Content -LiteralPath (Join-Path $themeRoot 'snippets\custom-artwork-upload.liquid') -Raw
$uploadScript = Get-Content -LiteralPath (Join-Path $themeRoot 'assets\custom-artwork-upload.js') -Raw
$cropperScript = Get-Content -LiteralPath (Join-Path $themeRoot 'assets\custom-artwork-cropper.js') -Raw
$cartScript = Get-Content -LiteralPath (Join-Path $themeRoot 'assets\custom-product-cart.js') -Raw
$productScript = Get-Content -LiteralPath (Join-Path $themeRoot 'assets\custom-product.js') -Raw
$defaultSection = Get-Content -LiteralPath (Join-Path $themeRoot 'sections\main-product.liquid') -Raw

function Assert-Contains([string]$Value, [string]$Expected, [string]$Message) {
  if (-not $Value.Contains($Expected)) { throw $Message }
}

Assert-Contains $section "render 'custom-artwork-upload'" 'Custom product section must render the artwork upload module.'
Assert-Contains $section "id: product_form_id" 'Custom product form must have the stable upload form ID.'
Assert-Contains $section "custom-artwork-upload.js" 'Custom product section must load the artwork preview controller.'
Assert-Contains $section "custom-artwork-cropper.js" 'Custom product section must load the artwork cropper.'
Assert-Contains $section "custom-product-cart.js" 'Custom product section must load the multipart cart service.'
Assert-Contains $snippet 'name="properties[Custom artwork]"' 'Artwork must be submitted as a Shopify line item property.'
Assert-Contains $snippet 'data-max-file-bytes="20971520"' 'Upload must enforce the 20 MB limit.'
Assert-Contains $snippet 'data-max-image-pixels="20000000"' 'Upload must enforce the 20 MP limit.'
Assert-Contains $uploadScript "event: 'custom_artwork_uploaded'" 'Upload selection analytics is missing.'
Assert-Contains $uploadScript 'root.productArtworkCropper.open(file)' 'Validated artwork must pass through the cropper before preview.'
Assert-Contains $cropperScript "event: 'custom_artwork_crop_applied'" 'Crop confirmation analytics is missing.'
Assert-Contains $uploadScript "isCustomPreview: true" 'Uploaded artwork must activate the framing preview.'
Assert-Contains $cartScript 'new FormData(form)' 'Artwork cart requests must use multipart FormData.'
Assert-Contains $cartScript 'removeAddedParent' 'Add-on failure must roll back the uploaded parent line.'
Assert-Contains $productScript "event: 'custom_artwork_added_to_cart'" 'Artwork add-to-cart analytics is missing.'
if ($defaultSection.Contains('custom-artwork-upload')) { throw 'Default product section must not load the custom artwork upload module.' }

Write-Output 'Custom artwork upload static checks passed.'

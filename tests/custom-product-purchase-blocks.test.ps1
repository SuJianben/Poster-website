$ErrorActionPreference = 'Stop'

$section = Get-Content -Raw 'sections/custom-product-main.liquid'
$adapter = Get-Content -Raw 'snippets/custom-product-purchase-block.liquid'
$shared = Get-Content -Raw 'snippets/product-purchase-block.liquid'
$upload = Get-Content -Raw 'snippets/custom-artwork-upload.liquid'
$cropper = Get-Content -Raw 'snippets/custom-artwork-cropper.liquid'
$imageTemplate = Get-Content -Raw 'templates/product.custom.json'
$cssTemplate = Get-Content -Raw 'templates/product.custom-css.json'
$script = Get-Content -Raw 'assets/custom-product.js'

if ($section -notmatch 'for block in section\.blocks') { throw 'Custom product main must render section blocks.' }
if ($section -notmatch "render 'custom-product-purchase-block'") { throw 'Custom product main must delegate purchase block rendering.' }
if ($section -match '<strong>SUMMER OFFER</strong>') { throw 'Custom offer content must not remain hard-coded.' }
if ($adapter -notmatch "when 'artwork_upload'") { throw 'Custom purchase renderer must own the artwork upload block.' }
if ($adapter -notmatch "render 'product-purchase-block'") { throw 'Common purchase controls must reuse the shared renderer.' }
if ($upload -notmatch 'block\.settings\.upload_heading') { throw 'Artwork upload content must come from block settings.' }
if ($upload -notmatch 'block\.shopify_attributes') { throw 'Artwork upload must expose Shopify editor block attributes.' }
if ($cropper -notmatch 'block\.settings\.crop_heading') { throw 'Crop dialog content must come from block settings.' }
if ($script -notmatch 'if \(addButton\) addButton\.disabled') { throw 'Custom variant updates must tolerate a removed buy-button block.' }

$requiredBlocks = @('artwork_upload', 'reviews', 'title', 'vendor', 'price', 'shipping_note', 'material', 'size_selector', 'passepartout', 'frame', 'quantity', 'buy_buttons', 'quantity_offer', 'assurances', 'payment_methods')
foreach ($blockType in $requiredBlocks) {
  foreach ($value in @($section, $imageTemplate, $cssTemplate)) {
    if ($value -notmatch ('"type"\s*:\s*"' + [regex]::Escape($blockType) + '"')) { throw "Missing custom product block: $blockType" }
  }
}

if ($shared -notmatch 'block\.settings\.column_one_heading') { throw 'Custom offers must inherit configurable table headings.' }
if ($shared -notmatch "'item_' \| append: item_index") { throw 'Custom assurances must inherit configurable lines.' }

Write-Output 'Custom product purchase block checks passed.'

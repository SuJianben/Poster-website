$ErrorActionPreference = 'Stop'

$section = Get-Content -Raw 'sections/main-product.liquid'
$snippet = Get-Content -Raw 'snippets/product-purchase-block.liquid'
$template = Get-Content -Raw 'templates/product.json'
$script = Get-Content -Raw 'assets/product-showcase.js'

if ($section -notmatch "for block in section\.blocks") { throw 'Main product must render section blocks.' }
if ($section -notmatch "render 'product-purchase-block'") { throw 'Main product must delegate purchase block markup to its snippet.' }
if ($section -match '<strong>SUMMER OFFER</strong>') { throw 'Offer content must not remain hard-coded in the section.' }

$requiredBlockTypes = @(
  'sale_badge', 'reviews', 'title', 'vendor', 'price', 'shipping_note', 'material',
  'size_selector', 'variant_options', 'passepartout', 'frame', 'hanging_kit',
  'quantity', 'buy_buttons', 'quantity_offer', 'assurances', 'payment_methods'
)

foreach ($blockType in $requiredBlockTypes) {
  if ($section -notmatch ('"type"\s*:\s*"' + [regex]::Escape($blockType) + '"')) {
    throw "Missing block schema type: $blockType"
  }
  if ($snippet -notmatch ("when '" + [regex]::Escape($blockType) + "'")) {
    throw "Missing purchase block renderer: $blockType"
  }
  if ($template -notmatch ('"type"\s*:\s*"' + [regex]::Escape($blockType) + '"')) {
    throw "Default product template is missing block: $blockType"
  }
}

if ($snippet -notmatch 'block\.shopify_attributes') { throw 'Blocks must expose Shopify editor selection attributes.' }
if ($snippet -notmatch 'block\.settings\.column_one_heading') { throw 'Offer table headings must be configurable.' }
if ($snippet -notmatch "'row_' \| append: row_index") { throw 'Offer rows must render from block settings.' }
if ($snippet -notmatch "'item_' \| append: item_index") { throw 'Assurance lines must render from block settings.' }
if ($snippet -notmatch 'has_other_variant_options') { throw 'Empty non-size variant blocks must not create layout gaps.' }
if ($script -notmatch "event: 'product_offer_toggle'") { throw 'Offer interaction analytics event is missing.' }
if ($script -notmatch 'if \(addButton\) addButton\.disabled') { throw 'Variant updates must tolerate a removed buy-button block.' }

Write-Output 'Product purchase block checks passed.'

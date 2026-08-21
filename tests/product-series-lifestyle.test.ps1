$ErrorActionPreference = 'Stop'

$themeRoot = Split-Path -Parent $PSScriptRoot
$snippet = Get-Content -LiteralPath (Join-Path $themeRoot 'snippets\product-series-lifestyle.liquid') -Raw
$defaultSection = Get-Content -LiteralPath (Join-Path $themeRoot 'sections\product-lifestyle.liquid') -Raw
$customSection = Get-Content -LiteralPath (Join-Path $themeRoot 'sections\custom-product-lifestyle.liquid') -Raw
$expectedHandles = @(
  'abstract-geometric-prints',
  'figurative-fashion-prints',
  'botanical-floral-prints',
  'animals-prints',
  'photography-landscape-prints',
  'minimal-neutral-prints',
  'food-kitchen-art-prints',
  'typography-quotes-prints'
)

function Assert-Contains([string]$Value, [string]$Expected, [string]$Message) {
  if (-not $Value.Contains($Expected)) { throw $Message }
}

Assert-Contains $snippet 'for block in section.blocks' 'Series matching must follow the theme-editor block order.'
Assert-Contains $snippet 'product_collection.id == configured_series.id' 'Series matching must use Shopify collection identity.'
Assert-Contains $snippet 'matched_series.metafields.custom.lifestyle_images.value' 'The matched collection multi-image metafield must drive the lifestyle image pool.'
Assert-Contains $snippet 'product.id | divided_by: 1000' 'Product assignment must use the approved stable Shopify ID seed.'
Assert-Contains $snippet 'lifestyle_seed | modulo: series_image_count' 'Each product must receive a stable image index within its series pool.'
Assert-Contains $snippet 'for candidate_media in series_images' 'Shopify media-reference Drops must be rendered through explicit iteration.'
Assert-Contains $snippet 'forloop.index0 == series_image_index' 'The explicit media iteration must stop at the stable product index.'
Assert-Contains $snippet 'assign candidate_image = candidate_media.preview_image' 'A file-reference media Drop must expose its preview image before image_url rendering.'
Assert-Contains $snippet 'candidate_image | image_url: width: 2200' 'The selected preview image must use Shopify responsive image rendering.'
if ($snippet.Contains('series_images[series_image_index]')) {
  throw 'Dynamic list selection must not use unsupported Shopify Liquid bracket indexing.'
}
if ($snippet.Contains('series_images | slice: series_image_index')) {
  throw 'Media-reference Drop selection must not use a slice filter that returns an empty value in Shopify Liquid.'
}
if ($snippet.Contains('series_image = candidate_media')) {
  throw 'A file-reference media Drop must not be treated as a directly renderable image object.'
}
Assert-Contains $snippet 'matched_series.image | default: matched_series.featured_image' 'The original collection image must remain as the first fallback.'
Assert-Contains $snippet 'data-lifestyle-source="{{ lifestyle_source }}"' 'The selected lifestyle source must remain traceable in the rendered DOM.'
Assert-Contains $snippet 'data-lifestyle-renderer="series-media-preview-v1"' 'The rendered DOM must expose the current multi-image renderer version for cache diagnostics.'
Assert-Contains $snippet 'data-lifestyle-image-count="{{ series_image_count }}"' 'The rendered DOM must expose the series pool size for diagnostics.'
Assert-Contains $snippet 'data-lifestyle-image-number="{{ series_image_number }}"' 'The rendered DOM must expose the one-based assigned image number for diagnostics.'
Assert-Contains $snippet "'figma-lifestyle-hero.jpg' | asset_url" 'Products without a configured series image must retain the bundled fallback.'

$assignmentFixtures = @(
  @{ ImageCount = 5; ProductIds = @(8589882458146, 8589880492066, 8589880197154, 8589879902242, 8589879869474, 8589879541794, 8589879345186, 8589879148578, 8589878951970, 8589878886434, 8589878755362, 8589878722594, 8589878525986, 8589878460450, 8589878231074, 8589878001698, 8589877968930, 8589877903394, 8589877674018, 8589877542946, 8589877116962, 8589876953122, 8589876822050, 8589876789282, 8589876232226, 8589876035618, 8589875970082, 8589875904546, 8589875871778, 8589875773474, 8589875642402) }
  @{ ImageCount = 3; ProductIds = @(8589881933858, 8589881671714, 8589880885282, 8589880066082, 8589880000546, 8589879836706, 8589879738402, 8589878853666, 8589878591522, 8589878394914, 8589878362146, 8589877739554, 8589877608482, 8589877280802, 8589877149730, 8589877051426, 8589877018658, 8589876756514, 8589876690978, 8589876166690) }
  @{ ImageCount = 2; ProductIds = @(8589882196002, 8589880164386, 8589879672866, 8589879443490, 8589879246882, 8589879083042, 8589878263842, 8589877772322, 8589877477410, 8589877346338, 8589877313570, 8589876985890, 8589876068386) }
)

foreach ($fixture in $assignmentFixtures) {
  $assignedIndexes = @($fixture.ProductIds | ForEach-Object { [math]::Floor($_ / 1000) % $fixture.ImageCount } | Sort-Object -Unique)
  if ($assignedIndexes.Count -ne $fixture.ImageCount) {
    throw "Stable assignment must use every uploaded image in the $($fixture.ImageCount)-image series fixture."
  }
}

foreach ($section in @($defaultSection, $customSection)) {
  Assert-Contains $section "render 'product-series-lifestyle'" 'Every product lifestyle section must use the shared series matcher.'
  Assert-Contains $section '"max_blocks": 8' 'Every product lifestyle section must allow exactly eight configured series mappings.'
  Assert-Contains $section '"type": "collection"' 'Series mappings must use Shopify collection selectors.'
}

foreach ($templateName in @('product.json', 'product.custom.json', 'product.custom-css.json')) {
  $templateRaw = Get-Content -LiteralPath (Join-Path $themeRoot "templates\$templateName") -Raw
  $templateJson = [regex]::Replace($templateRaw, '(?s)/\*.*?\*/', '') | ConvertFrom-Json
  $lifestyle = $templateJson.sections.lifestyle

  if ($lifestyle.block_order.Count -ne 8) {
    throw "$templateName must configure all eight product series in the lifestyle section."
  }

  $configuredHandles = @($lifestyle.block_order | ForEach-Object { $lifestyle.blocks.PSObject.Properties[$_].Value.settings.collection })
  if (($configuredHandles -join '|') -ne ($expectedHandles -join '|')) {
    throw "$templateName must preserve the approved series priority order."
  }
}

Write-Output 'Product series lifestyle checks passed.'

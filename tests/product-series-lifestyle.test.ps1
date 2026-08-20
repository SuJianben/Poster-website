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
Assert-Contains $snippet 'matched_series.image | default: matched_series.featured_image' 'The matched collection image must drive the lifestyle section.'
Assert-Contains $snippet 'data-lifestyle-source="{{ lifestyle_source }}"' 'The selected lifestyle source must remain traceable in the rendered DOM.'
Assert-Contains $snippet "'figma-lifestyle-hero.jpg' | asset_url" 'Products without a configured series image must retain the bundled fallback.'

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

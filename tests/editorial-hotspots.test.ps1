$ErrorActionPreference = 'Stop'

$themeRoot = Split-Path -Parent $PSScriptRoot
$section = Get-Content -Raw -LiteralPath (Join-Path $themeRoot 'sections\editorial-with-products.liquid')
$snippet = Get-Content -Raw -LiteralPath (Join-Path $themeRoot 'snippets\editorial-product-hotspot.liquid')
$script = Get-Content -Raw -LiteralPath (Join-Path $themeRoot 'assets\editorial-product-hotspots.js')
$styles = Get-Content -Raw -LiteralPath (Join-Path $themeRoot 'assets\editorial-product-hotspots.css')
$homeTemplate = Get-Content -Raw -LiteralPath (Join-Path $themeRoot 'templates\index.json') | ConvertFrom-Json

function Assert-Contains([string]$Value, [string]$Expected, [string]$Message) {
  if (-not $Value.Contains($Expected)) { throw $Message }
}

Assert-Contains $section "where: 'type', 'hotspot'" 'Editorial hotspot blocks must be separated from fallback poster blocks.'
Assert-Contains $section "render 'editorial-product-hotspot'" 'Editorial image must render configured hotspot blocks.'
Assert-Contains $section 'data-editorial-section-id="{{ section.id }}"' 'Hotspot analytics must retain the owning Shopify section ID.'
Assert-Contains $section "'editorial-product-hotspots.js' | asset_url" 'Hotspot behavior must load only through the section.'
Assert-Contains $section '"type":"hotspot"' 'Theme editor must expose a product hotspot block.'
Assert-Contains $section '"id":"position_x"' 'Hotspot horizontal position must be configurable.'
Assert-Contains $section '"id":"position_y"' 'Hotspot vertical position must be configurable.'
Assert-Contains $snippet 'data-editorial-hotspot-trigger' 'Each hotspot must have an accessible trigger.'
Assert-Contains $snippet 'data-editorial-hotspot-form' 'Each quick view must use a native cart form fallback.'
Assert-Contains $snippet 'data-editorial-hotspot-variant' 'Quick view must expose available Shopify variants.'
Assert-Contains $script 'cart/add.js' 'Hotspot quick add must use Shopify AJAX cart.'
Assert-Contains $script "document.dispatchEvent(new CustomEvent('cart:updated'" 'Quick add must refresh the shared cart drawer.'
Assert-Contains $script 'editorial_hotspot_opened' 'Hotspot opening must be tracked.'
Assert-Contains $script 'editorial_hotspot_added_to_cart' 'Successful quick add must be tracked.'
Assert-Contains $script 'dataset.editorialSectionId' 'Hotspot analytics must read the configured section ID.'
Assert-Contains $styles '.editorial-hotspot__panel' 'Hotspot quick view must have scoped panel styles.'
Assert-Contains $styles '.editorial-products .editorial__image[data-editorial-hotspots]' 'Hotspot coordinates must be anchored to the editorial image container.'
Assert-Contains $styles '@media (max-width: 750px)' 'Hotspot panel must have a mobile layout.'
Assert-Contains $styles 'transform: none;' 'Mobile hotspot wrappers must not create a containing block for the fixed quick-view panel.'
Assert-Contains $styles 'transform: translate(-50%, -50%);' 'Mobile hotspot buttons must retain visual centering after the wrapper transform is removed.'

$secondEditorial = $homeTemplate.sections.editorial_2
$hotspots = @($secondEditorial.blocks.PSObject.Properties.Value | Where-Object { $_.type -eq 'hotspot' })
if ($hotspots.Count -ne 3) { throw 'The second homepage editorial section must start with three configured hotspots.' }
if (@($homeTemplate.sections.editorial_1.blocks.PSObject.Properties.Value | Where-Object { $_.type -eq 'hotspot' }).Count -ne 0) {
  throw 'The custom upload editorial section must remain free of product hotspots.'
}

Write-Output 'Editorial product hotspot checks passed.'

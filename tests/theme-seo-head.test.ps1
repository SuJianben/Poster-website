$ErrorActionPreference = 'Stop'

$themeRoot = Split-Path -Parent $PSScriptRoot
$layout = Get-Content -LiteralPath (Join-Path $themeRoot 'layout\theme.liquid') -Raw

function Assert-Contains([string]$Value, [string]$Expected, [string]$Message) {
  if (-not $Value.Contains($Expected)) { throw $Message }
}

Assert-Contains $layout '<title>' 'Theme layout must render a document title.'
Assert-Contains $layout '{{ page_title }}' 'Theme title must use the Shopify page SEO title.'
Assert-Contains $layout 'page_title contains shop.name' 'Theme title must avoid duplicating the store name.'
Assert-Contains $layout 'name="description"' 'Theme layout must render a meta description.'
Assert-Contains $layout '{{ page_description | escape }}' 'Meta description must use Shopify page SEO data safely.'
Assert-Contains $layout 'rel="canonical"' 'Theme layout must render the canonical URL.'
Assert-Contains $layout '{{ canonical_url }}' 'Canonical link must use Shopify canonical data.'

Write-Output 'Theme SEO head checks passed.'

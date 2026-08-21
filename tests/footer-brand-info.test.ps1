$ErrorActionPreference = 'Stop'

$themeRoot = Split-Path -Parent $PSScriptRoot
$footer = Get-Content -LiteralPath (Join-Path $themeRoot 'sections\footer.liquid') -Raw
$themeCss = Get-Content -LiteralPath (Join-Path $themeRoot 'assets\poster-theme.css') -Raw

function Assert-Contains([string]$Value, [string]$Expected, [string]$Message) {
  if (-not $Value.Contains($Expected)) { throw $Message }
}

Assert-Contains $footer 'section.settings.show_brand_info' 'The footer must expose an independent brand-information visibility setting.'
Assert-Contains $footer 'section.settings.brand_logo' 'The footer brand information must render a configurable logo.'
Assert-Contains $footer '| image_url: width: 600' 'The footer logo must use Shopify image_url rendering.'
Assert-Contains $footer '| image_tag:' 'The footer logo must use Shopify responsive image_tag rendering.'
Assert-Contains $footer 'section.settings.brand_heading' 'The footer brand information must render a configurable heading.'
Assert-Contains $footer 'section.settings.brand_content' 'The footer brand information must render configurable rich text.'
Assert-Contains $footer '"type": "image_picker"' 'The footer schema must provide a Shopify image picker.'
Assert-Contains $footer '"id": "brand_content"' 'The footer schema must provide editable brand content.'
Assert-Contains $themeCss '.footer-links--with-brand' 'The footer must provide a desktop layout for the brand and menu columns.'
Assert-Contains $themeCss '.footer-brand { grid-column: 1 / -1;' 'The footer brand information must span the menu grid on smaller screens.'

Write-Output 'Footer brand information checks passed.'

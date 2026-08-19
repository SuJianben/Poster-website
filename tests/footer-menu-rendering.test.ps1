$ErrorActionPreference = 'Stop'

$themeRoot = Split-Path -Parent $PSScriptRoot
$footer = Get-Content -LiteralPath (Join-Path $themeRoot 'sections\footer.liquid') -Raw

function Assert-Contains([string]$Value, [string]$Expected, [string]$Message) {
  if (-not $Value.Contains($Expected)) { throw $Message }
}

Assert-Contains $footer '{% for block in section.blocks %}' 'Footer must render its configured link-column blocks.'
Assert-Contains $footer '{% for link in block.settings.menu.links %}' 'Footer must render links from the menu selected in each block.'
Assert-Contains $footer '{{ block.shopify_attributes }}' 'Footer blocks must remain selectable in the theme editor.'
Assert-Contains $footer 'href="{{ link.url }}"' 'Footer links must use the selected Shopify menu URLs.'
Assert-Contains $footer '{{ link.title | escape }}' 'Footer links must use the selected Shopify menu titles.'
Assert-Contains $footer '{{ section.settings.bottom_text | escape }}' 'Footer must render its configured bottom text.'

if ($footer -match 'href="#categories"|href="#top"') {
  throw 'Footer must not contain the previous hard-coded placeholder navigation.'
}

Write-Output 'Footer menu rendering checks passed.'

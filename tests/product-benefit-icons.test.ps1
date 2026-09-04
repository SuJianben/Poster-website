$ErrorActionPreference = 'Stop'

$themeRoot = Split-Path -Parent $PSScriptRoot
$section = Get-Content -Raw (Join-Path $themeRoot 'sections/product-benefits.liquid')
$snippet = Get-Content -Raw (Join-Path $themeRoot 'snippets/product-benefit-icon.liquid')
$styles = Get-Content -Raw (Join-Path $themeRoot 'assets/product-showcase.css')
$template = Get-Content -Raw (Join-Path $themeRoot 'templates/product.json') | ConvertFrom-Json

if ($section -notmatch "render 'product-benefit-icon'" -or $section -notmatch 'block\.settings\.icon') {
  throw 'Expected every benefit block to render its configured SVG icon.'
}

foreach ($icon in @('quality', 'guarantee', 'shipping', 'returns')) {
  if ($snippet -notmatch [regex]::Escape("when '$icon'")) {
    throw "Expected the shared benefit icon snippet to contain the $icon SVG."
  }
}

if (($snippet | Select-String -Pattern '<svg' -AllMatches).Matches.Count -ne 4) {
  throw 'Expected exactly four local SVG icons with no remote icon dependency.'
}

if ($snippet -match '<img|https?://|cdn\.shopify\.com') {
  throw 'Expected benefit icons to be local inline SVG rather than hot-linked images.'
}

$configuredIcons = @($template.sections.benefits.block_order | ForEach-Object {
  $template.sections.benefits.blocks.$_.settings.icon
})

if (($configuredIcons -join '|') -ne 'quality|guarantee|shipping|returns') {
  throw 'Expected the four existing benefit blocks to use the matching SVG icons in order.'
}

if ($styles -notmatch '\.ps-benefits > \.ps-benefit-item' -or $styles -notmatch '\.ps-benefit-icon__svg') {
  throw 'Expected icon layout styles to target only the benefit item and its SVG.'
}

Write-Output 'PASS: Product benefits use four configurable local SVG icons without external dependencies.'

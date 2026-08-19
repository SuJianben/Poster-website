$ErrorActionPreference = 'Stop'

$themeRoot = Split-Path -Parent $PSScriptRoot
$homepage = Get-Content -LiteralPath (Join-Path $themeRoot 'templates\index.json') -Raw

if (-not $homepage.Contains('shopify://products/custom-poster')) {
  throw 'Homepage custom-poster link must use the customer-facing product handle.'
}

if ($homepage.Contains('shopify://products/custom-poster-css-frame-test')) {
  throw 'Homepage must not retain the retired CSS test product handle.'
}

Write-Output 'Custom Poster SEO link checks passed.'

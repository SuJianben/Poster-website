$ErrorActionPreference = 'Stop'

$themeRoot = Split-Path -Parent $PSScriptRoot
$section = Get-Content -LiteralPath (Join-Path $themeRoot 'sections\main-collection.liquid') -Raw
$styles = Get-Content -LiteralPath (Join-Path $themeRoot 'assets\collection-gallery.css') -Raw
$script = Get-Content -LiteralPath (Join-Path $themeRoot 'assets\collection-gallery.js') -Raw

$combined = $section + "`n" + $styles + "`n" + $script
$forbiddenPatterns = @(
  'data-cg-heart',
  'cg-heart',
  "content: '♥'"
)

foreach ($pattern in $forbiddenPatterns) {
  if ($combined.Contains($pattern)) {
    throw "Collection gallery must not contain the removed heart control: $pattern"
  }
}

if (-not $section.Contains('class="cg-product-media"')) {
  throw 'Collection product media links must remain intact after removing the heart control.'
}

if (-not $script.Contains('applyView')) {
  throw 'Collection view switching must remain intact after removing the heart interaction.'
}

Write-Output 'Collection heart removal checks passed.'

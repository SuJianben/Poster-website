$ErrorActionPreference = 'Stop'

$themeRoot = Split-Path -Parent $PSScriptRoot
$section = Get-Content -LiteralPath (Join-Path $themeRoot 'sections\custom-product-main.liquid') -Raw
$styles = Get-Content -LiteralPath (Join-Path $themeRoot 'assets\custom-css-framing.css') -Raw
$imageTemplate = Get-Content -LiteralPath (Join-Path $themeRoot 'templates\product.custom.json') -Raw | ConvertFrom-Json
$cssTemplate = Get-Content -LiteralPath (Join-Path $themeRoot 'templates\product.custom-css.json') -Raw | ConvertFrom-Json
$defaultSection = Get-Content -LiteralPath (Join-Path $themeRoot 'sections\main-product.liquid') -Raw
$oakVerticalTexture = Join-Path $themeRoot 'assets\ps-css-frame-oak-texture-vertical.webp'
$oakHorizontalTexture = Join-Path $themeRoot 'assets\ps-css-frame-oak-texture-horizontal.webp'

function Assert-Contains([string]$Value, [string]$Expected, [string]$Message) {
  if (-not $Value.Contains($Expected)) { throw $Message }
}

$cssOnlyMarkup = [regex]::Match(
  $section,
  "\{% if framing_render_mode == 'css' %\}(?<content>[\s\S]*?data-ps-css-frame-rail[\s\S]*?)\{% endif %\}"
)
if (-not $cssOnlyMarkup.Success) { throw 'CSS frame rails must be inside the CSS render-mode conditional.' }

$sides = @('top', 'right', 'bottom', 'left')
foreach ($side in $sides) {
  Assert-Contains $cssOnlyMarkup.Groups['content'].Value "data-ps-css-frame-rail=`"$side`"" "Missing $side rail markup."
  Assert-Contains $styles ".ps-css-frame__rail--$side" "Missing $side rail style."
  Assert-Contains $styles "--ps-css-frame-texture-$side" "Missing $side texture hook."
}

$railCount = ([regex]::Matches($cssOnlyMarkup.Groups['content'].Value, 'data-ps-css-frame-rail=')).Count
if ($railCount -ne 4) { throw "Expected four frame rails, found $railCount." }

$clipPathCount = ([regex]::Matches($styles, 'clip-path:\s*polygon\(')).Count
if ($clipPathCount -ne 4) { throw "Expected four miter clip paths, found $clipPathCount." }

if ($imageTemplate.sections.main.settings.framing_render_mode -ne 'image') {
  throw 'Default custom product template must keep image framing.'
}
if ($cssTemplate.sections.main.settings.framing_render_mode -ne 'css') {
  throw 'CSS custom product template must enable CSS framing.'
}
if ($defaultSection.Contains('data-ps-css-frame-rail')) {
  throw 'Default product section must not render CSS frame rails.'
}

foreach ($texture in @($oakVerticalTexture, $oakHorizontalTexture)) {
  if (-not (Test-Path -LiteralPath $texture)) { throw "Missing Oak texture asset: $texture" }
  $textureBytes = [System.IO.File]::ReadAllBytes($texture)
  if ($textureBytes.Length -lt 12) { throw "Oak texture asset is too small to be a valid WebP file: $texture" }
  $header = [Text.Encoding]::ASCII.GetString($textureBytes, 0, 12)
  if (-not ($header.StartsWith('RIFF') -and $header.Contains('WEBP'))) {
    throw "Oak texture asset is not a valid WebP file: $texture"
  }
}

Assert-Contains $styles 'data-frame-style="oak"' 'Oak-specific texture mapping is missing.'
Assert-Contains $styles "--ps-css-frame-texture-top: url('./ps-css-frame-oak-texture-horizontal.webp')" 'Oak top rail must use the horizontal texture.'
Assert-Contains $styles "--ps-css-frame-texture-bottom: url('./ps-css-frame-oak-texture-horizontal.webp')" 'Oak bottom rail must use the horizontal texture.'
Assert-Contains $styles "--ps-css-frame-texture-right: url('./ps-css-frame-oak-texture-vertical.webp')" 'Oak right rail must use the vertical texture.'
Assert-Contains $styles "--ps-css-frame-texture-left: url('./ps-css-frame-oak-texture-vertical.webp')" 'Oak left rail must use the vertical texture.'

Write-Output 'Custom CSS four-rail framing checks passed.'

$ErrorActionPreference = 'Stop'

$themeRoot = Split-Path -Parent $PSScriptRoot
$section = Get-Content -LiteralPath (Join-Path $themeRoot 'sections\custom-product-main.liquid') -Raw
$styles = Get-Content -LiteralPath (Join-Path $themeRoot 'assets\custom-css-framing.css') -Raw
$imageTemplate = Get-Content -LiteralPath (Join-Path $themeRoot 'templates\product.custom.json') -Raw | ConvertFrom-Json
$cssTemplate = Get-Content -LiteralPath (Join-Path $themeRoot 'templates\product.custom-css.json') -Raw | ConvertFrom-Json
$defaultSection = Get-Content -LiteralPath (Join-Path $themeRoot 'sections\main-product.liquid') -Raw
$oakVerticalTexture = Join-Path $themeRoot 'assets\ps-css-frame-oak-texture-v2-vertical.webp'
$oakHorizontalTexture = Join-Path $themeRoot 'assets\ps-css-frame-oak-texture-v2-horizontal.webp'
$fixture = Get-Content -LiteralPath (Join-Path $themeRoot 'tests\fixtures\custom-css-frame-rails.html') -Raw
$schemaMatch = [regex]::Match($section, '\{% schema %\}(?<schema>[\s\S]*?)\{% endschema %\}')
if (-not $schemaMatch.Success) { throw 'Custom product section schema is missing.' }
$schema = $schemaMatch.Groups['schema'].Value | ConvertFrom-Json

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
Assert-Contains $styles "--ps-css-frame-texture-top: url('./ps-css-frame-oak-texture-v2-horizontal.webp')" 'Oak top rail must use the versioned horizontal texture.'
Assert-Contains $styles "--ps-css-frame-texture-bottom: url('./ps-css-frame-oak-texture-v2-horizontal.webp')" 'Oak bottom rail must use the versioned horizontal texture.'
Assert-Contains $styles "--ps-css-frame-texture-right: url('./ps-css-frame-oak-texture-v2-vertical.webp')" 'Oak right rail must use the versioned vertical texture.'
Assert-Contains $styles "--ps-css-frame-texture-left: url('./ps-css-frame-oak-texture-v2-vertical.webp')" 'Oak left rail must use the versioned vertical texture.'
Assert-Contains $section '--ps-css-oak-texture-size: {{ css_oak_texture_scale }}px' 'The section must expose the Oak texture scale as a scoped CSS variable.'
Assert-Contains $section "asset_url }}&psv=oak-texture-v2-20260818" 'The CSS custom template must version its framing stylesheet to invalidate stale storefront caches.'
Assert-Contains $section '--ps-css-oak-texture-bottom-offset: {{ css_oak_texture_bottom_offset }}px' 'The bottom texture offset must scale with the texture.'
Assert-Contains $section '--ps-css-oak-texture-left-offset: {{ css_oak_texture_left_offset }}px' 'The left texture offset must scale with the texture.'
Assert-Contains $styles '--ps-css-frame-texture-top-size: calc(var(--ps-css-oak-texture-size, 100px) + var(--ps-css-oak-texture-size, 100px)) var(--ps-css-oak-texture-size, 100px)' 'Oak horizontal rails must preserve the source texture aspect ratio.'
Assert-Contains $styles '--ps-css-frame-texture-right-size: var(--ps-css-oak-texture-size, 100px) calc(var(--ps-css-oak-texture-size, 100px) + var(--ps-css-oak-texture-size, 100px))' 'Oak vertical rails must preserve the source texture aspect ratio.'
Assert-Contains $styles '--ps-css-frame-texture-bottom-size: calc(var(--ps-css-oak-texture-size, 100px) + var(--ps-css-oak-texture-size, 100px)) var(--ps-css-oak-texture-size, 100px)' 'Oak bottom rail must preserve the horizontal source texture aspect ratio.'
Assert-Contains $styles '--ps-css-frame-texture-left-size: var(--ps-css-oak-texture-size, 100px) calc(var(--ps-css-oak-texture-size, 100px) + var(--ps-css-oak-texture-size, 100px))' 'Oak left rail must preserve the vertical source texture aspect ratio.'
Assert-Contains $styles '--ps-css-frame-texture-bottom-position: var(--ps-css-oak-texture-bottom-offset, 47px) center' 'Oak bottom offset must read the scaled value.'
Assert-Contains $styles '--ps-css-frame-texture-left-position: center var(--ps-css-oak-texture-left-offset, 53px)' 'Oak left offset must read the scaled value.'

$scaleSetting = $schema.settings | Where-Object { $_.id -eq 'css_oak_texture_scale' }
if (-not $scaleSetting) { throw 'Oak texture scale theme-editor setting is missing.' }
if ($scaleSetting.type -ne 'range') { throw 'Oak texture scale must use a range setting.' }
if ($scaleSetting.min -ne 40 -or $scaleSetting.max -ne 200 -or $scaleSetting.step -ne 5) {
  throw 'Oak texture scale range must support 40% to 200% in 5% steps.'
}
if ($scaleSetting.default -ne 100) { throw 'Oak texture scale must default to 100%.' }
Assert-Contains $fixture 'data-test-texture-scale="60"' 'The visual fixture must cover a smaller Oak texture scale.'
Assert-Contains $fixture 'data-test-texture-scale="140"' 'The visual fixture must cover a larger Oak texture scale.'

Write-Output 'Custom CSS four-rail framing checks passed.'

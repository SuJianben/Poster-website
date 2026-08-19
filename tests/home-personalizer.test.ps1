$ErrorActionPreference = 'Stop'

$themeRoot = Split-Path -Parent $PSScriptRoot
$section = Get-Content -LiteralPath (Join-Path $themeRoot 'sections\editorial-with-products.liquid') -Raw
$upload = Get-Content -LiteralPath (Join-Path $themeRoot 'snippets\home-personalizer-upload.liquid') -Raw
$cropper = Get-Content -LiteralPath (Join-Path $themeRoot 'snippets\home-personalizer-cropper.liquid') -Raw
$script = Get-Content -LiteralPath (Join-Path $themeRoot 'assets\home-personalizer.js') -Raw
$styles = Get-Content -LiteralPath (Join-Path $themeRoot 'assets\home-personalizer.css') -Raw
$homeTemplate = Get-Content -LiteralPath (Join-Path $themeRoot 'templates\index.json') -Raw | ConvertFrom-Json

function Assert-Contains([string]$Value, [string]$Expected, [string]$Message) {
  if (-not $Value.Contains($Expected)) { throw $Message }
}

Assert-Contains $section '{% if section.settings.enable_personalizer %}' 'Homepage personalizer assets and markup must be gated by the section setting.'
Assert-Contains $section "'home-personalizer.css' | asset_url" 'Homepage personalizer CSS must load through the section.'
Assert-Contains $section "'home-personalizer.js' | asset_url" 'Homepage personalizer JavaScript must load through the section.'
Assert-Contains $section "render 'home-personalizer-upload'" 'The upload interface must render in the editorial copy.'
Assert-Contains $section "render 'home-personalizer-cropper'" 'The fixed-ratio crop dialog must render in the enabled section.'
Assert-Contains $section 'data-home-personalizer-preview' 'The scene image must include an initially hidden wall preview layer.'

$uploadPosition = $section.IndexOf("render 'home-personalizer-upload'")
$ctaPosition = $section.IndexOf('<a class="text-link"')
if ($uploadPosition -lt 0 -or $ctaPosition -lt 0 -or $uploadPosition -gt $ctaPosition) {
  throw 'The upload interface must appear above the existing Create your poster link.'
}

Assert-Contains $upload 'data-home-personalizer-input' 'The homepage personalizer must expose a dedicated file input.'
Assert-Contains $upload 'image/jpeg,image/png,image/webp' 'The homepage upload must restrict accepted image formats.'
if (($cropper.Split('data-home-personalizer-ratio=').Count - 1) -ne 3) {
  throw 'The homepage crop dialog must contain exactly three fixed ratio controls.'
}
if ($cropper.Contains('freeform') -or $script.Contains('resizeCropFree')) {
  throw 'The homepage personalizer must not expose or implement free crop.'
}
Assert-Contains $script 'geometry.resizeCrop(' 'Homepage crop resizing must preserve the selected fixed ratio.'
Assert-Contains $script "cropMode.select(orientation, false)" 'Homepage ratio selection must explicitly disable freeform mode.'
Assert-Contains $script 'home_personalizer_preview_applied' 'Homepage preview application must be tracked.'
Assert-Contains $script 'home_personalizer_crop_ratio_selected' 'Homepage fixed-ratio selection must be tracked.'
Assert-Contains $styles 'border: clamp(5px, .65vw, 10px) solid #111;' 'The wall preview must always render a black CSS frame.'
if ($styles.Contains('passepartout') -or $styles.Contains('mat-')) {
  throw 'The homepage wall preview must not include a passepartout or inner mat.'
}

$firstEditorial = $homeTemplate.sections.editorial_1
$secondEditorial = $homeTemplate.sections.editorial_2
if (-not $firstEditorial.settings.enable_personalizer) { throw 'The first homepage editorial section must enable the personalizer.' }
if ($secondEditorial.settings.enable_personalizer) { throw 'The second homepage editorial section must remain unchanged.' }
if ($firstEditorial.settings.link_label -ne 'CREATE YOUR POSTSTER' -or $firstEditorial.settings.link -ne 'shopify://products/custom-poster') {
  throw 'The existing Create your poster link must remain unchanged.'
}

Write-Output 'Homepage fixed-ratio personalizer checks passed.'

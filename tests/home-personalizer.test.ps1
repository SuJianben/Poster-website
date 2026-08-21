$ErrorActionPreference = 'Stop'

$themeRoot = Split-Path -Parent $PSScriptRoot
$section = Get-Content -LiteralPath (Join-Path $themeRoot 'sections\editorial-with-products.liquid') -Raw
$upload = Get-Content -LiteralPath (Join-Path $themeRoot 'snippets\home-personalizer-upload.liquid') -Raw
$cropper = Get-Content -LiteralPath (Join-Path $themeRoot 'snippets\home-personalizer-cropper.liquid') -Raw
$script = Get-Content -LiteralPath (Join-Path $themeRoot 'assets\home-personalizer.js') -Raw
$sceneScript = Get-Content -LiteralPath (Join-Path $themeRoot 'assets\home-personalizer-scene.js') -Raw
$styles = Get-Content -LiteralPath (Join-Path $themeRoot 'assets\home-personalizer.css') -Raw
$homeTemplate = Get-Content -LiteralPath (Join-Path $themeRoot 'templates\index.json') -Raw | ConvertFrom-Json

function Assert-Contains([string]$Value, [string]$Expected, [string]$Message) {
  if (-not $Value.Contains($Expected)) { throw $Message }
}

Assert-Contains $section '{% if section.settings.enable_personalizer %}' 'Homepage personalizer assets and markup must be gated by the section setting.'
Assert-Contains $section "'home-personalizer.css' | asset_url" 'Homepage personalizer CSS must load through the section.'
Assert-Contains $section "'home-personalizer.js' | asset_url" 'Homepage personalizer JavaScript must load through the section.'
Assert-Contains $section "'home-personalizer-scene.js' | asset_url" 'Homepage scene switching JavaScript must load through the section.'
Assert-Contains $section "render 'home-personalizer-upload'" 'The upload interface must render in the editorial copy.'
Assert-Contains $section "render 'home-personalizer-cropper'" 'The fixed-ratio crop dialog must render in the enabled section.'
Assert-Contains $section 'data-home-personalizer-preview' 'The scene image must include an initially hidden wall preview layer.'
Assert-Contains $section 'data-home-personalizer-scene-initial' 'The original editorial image must remain the initial scene.'
Assert-Contains $section 'data-home-personalizer-scene-personalized' 'The configured after-upload scene must have a separate render layer.'
Assert-Contains $section '"id":"personalizer_scene_image"' 'The after-upload scene image must be replaceable in the theme editor.'
Assert-Contains $section 'class="home-personalizer__mobile-description"' 'The enabled personalizer must render its description inside the mobile image overlay.'
Assert-Contains $section 'class="home-personalizer__desktop-description"' 'The enabled personalizer must retain a dedicated desktop description.'
Assert-Contains $styles '@media (max-width: 750px)' 'The description overlay must use the storefront mobile breakpoint.'
Assert-Contains $styles '.home-personalizer__desktop-description {' 'The desktop description must have a mobile visibility rule.'
Assert-Contains $styles 'background: linear-gradient(180deg' 'The mobile description must sit on a contrast mask.'
Assert-Contains $styles 'pointer-events: none;' 'The mobile description overlay must not block scene interactions.'

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
Assert-Contains $script 'sceneController?.showPersonalized()' 'Applying a crop must switch to the configured after-upload scene.'
Assert-Contains $script 'sceneController?.showInitial()' 'Removing an upload must restore the original editorial image.'
Assert-Contains $sceneScript "root.dataset.homePersonalizerSceneState" 'Scene state must remain inspectable for analytics and QA.'
Assert-Contains $sceneScript "'personalized'" 'The scene controller must expose a personalized state.'
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
if ($firstEditorial.settings.personalizer_scene_image -ne 'shopify://shop_images/home-personalizer-scene-after-upload.jpg') {
  throw 'The first homepage personalizer must use the provided empty-wall scene after upload.'
}
if ($firstEditorial.settings.preview_left -ne 60 -or $firstEditorial.settings.preview_top -ne 31 -or $firstEditorial.settings.preview_width -ne 38) {
  throw 'The uploaded poster must use the scene-specific placement defaults.'
}

Write-Output 'Homepage fixed-ratio personalizer checks passed.'

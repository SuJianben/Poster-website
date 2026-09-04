$ErrorActionPreference = 'Stop'

$section = Get-Content -Raw (Join-Path $PSScriptRoot '..\sections\main-product.liquid')
$script = Get-Content -Raw (Join-Path $PSScriptRoot '..\assets\product-showcase.js')
$styles = Get-Content -Raw (Join-Path $PSScriptRoot '..\assets\product-showcase.css')
$informationSection = Get-Content -Raw (Join-Path $PSScriptRoot '..\sections\product-information-tabs.liquid')
$informationScript = Get-Content -Raw (Join-Path $PSScriptRoot '..\assets\product-information-tabs.js')

if ($section -match '<details>') {
  throw 'Expected the left product information area to use animated accordion panels, not native <details> elements.'
}

if ($section -notmatch 'data-ps-accordion-trigger' -or $section -notmatch 'data-ps-accordion-panel') {
  throw 'Expected each left-side information panel to expose accordion trigger and panel hooks.'
}

if ($script -notmatch 'data-ps-accordion-trigger' -or $script -notmatch 'aria-expanded') {
  throw 'Expected accordion interactions to synchronise the visual open state and aria-expanded state.'
}

if ($section -notmatch 'data-ps-thumbnail-scroll' -or $section -notmatch 'data-ps-media-direction') {
  throw 'Expected the media gallery to expose thumbnail rail and previous/next navigation controls.'
}

if ($section -notmatch 'data-ps-frame-name' -or $script -notmatch 'data-ps-thumbnail-scroll') {
  throw 'Expected frame labels and thumbnail-rail behaviour hooks to be present.'
}

if ($styles -notmatch '\.ps-main-media:hover \.ps-media-navigation' -or $styles -notmatch 'linear-gradient\(90deg') {
  throw 'Expected main-media arrows to reveal on gallery hover and use a left-to-right black hover fill.'
}

if ($section -notmatch 'ps-action-chevron' -or $styles -notmatch '\.ps-add-button::before') {
  throw 'Expected shared chevron markup and left-to-right add-to-cart sweep animation hooks.'
}

if ($styles -notmatch '\.ps-thumbnails \{[^}]*align-content: start') {
  throw 'Expected thumbnail items to remain top-aligned instead of stretching across the rail height.'
}

if ($informationSection -notmatch 'data-ps-description-tab' -or $informationSection -notmatch 'role="tabpanel"' -or $informationScript -notmatch 'data-ps-description-tab') {
  throw 'Expected the lower product information area to expose interactive tab controls and panels.'
}

if ($styles -notmatch '\.ps-shell \{ width: min\(100% - 40px, 1430px\)' -or $styles -notmatch '\.ps-description-shell \{ width: min\(100% - 40px, 1430px\)' -or $styles -notmatch '\.ps-description-tabs \{[^}]*overflow-y: hidden') {
  throw 'Expected the product and lower information areas to use the reference-width shell and never show a vertical tab scrollbar.'
}

Write-Output 'PASS: Product detail accordion structure and interaction hooks are present.'

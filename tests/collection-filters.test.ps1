$ErrorActionPreference = 'Stop'

$section = Get-Content -Raw (Join-Path $PSScriptRoot '..\sections\main-collection.liquid')
$filterScript = Get-Content -Raw (Join-Path $PSScriptRoot '..\assets\collection-filters.js')
$galleryScript = Get-Content -Raw (Join-Path $PSScriptRoot '..\assets\collection-gallery.js')
$styles = Get-Content -Raw (Join-Path $PSScriptRoot '..\assets\collection-gallery.css')

foreach ($file in @('assets\collection-filters.js', 'assets\collection-gallery.js', 'assets\collection-gallery.css')) {
  if (-not (Test-Path (Join-Path $PSScriptRoot "..\$file"))) {
    throw "Expected collection filter module file to exist: $file"
  }
}

foreach ($hook in @('collection-filters.js', 'data-cg-section-id', 'data-cg-results', 'data-cg-product-count')) {
  if ($section -notmatch [regex]::Escape($hook)) {
    throw "Expected collection section hook to exist: $hook"
  }
}

foreach ($behavior in @('AbortController', 'section_id', 'DOMParser', 'replaceWith', 'pushState', 'popstate', 'window.location.assign')) {
  if ($filterScript -notmatch [regex]::Escape($behavior)) {
    throw "Expected AJAX collection behavior to exist: $behavior"
  }
}

if ($galleryScript -notmatch 'root\.dataset\.view = view' -or $galleryScript -match 'requestSubmit\(\)') {
  throw 'Expected gallery view state to remain on the persistent collection root without owning filter submission.'
}

if ($filterScript -match 'root\.replaceWith' -or $filterScript -notmatch "querySelector\('\[data-cg-results\]'\)\.replaceWith") {
  throw 'Expected AJAX filtering to replace only the results region so the selected gallery view persists.'
}

if ($styles -notmatch '\.cg-results\.is-loading' -or $styles -notmatch 'cg-loading-pulse') {
  throw 'Expected collection results loading feedback to be present.'
}

Write-Output 'PASS: AJAX collection filters have replaceable regions, history support, fallback navigation and loading feedback.'

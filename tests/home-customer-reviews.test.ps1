$ErrorActionPreference = 'Stop'

$themeRoot = Split-Path -Parent $PSScriptRoot
$section = Get-Content -LiteralPath (Join-Path $themeRoot 'sections\home-customer-reviews.liquid') -Raw
$styles = Get-Content -LiteralPath (Join-Path $themeRoot 'assets\home-customer-reviews.css') -Raw
$themeStyles = Get-Content -LiteralPath (Join-Path $themeRoot 'assets\poster-theme.css') -Raw
$indexPath = Join-Path $themeRoot 'templates\index.json'
$indexRaw = Get-Content -LiteralPath $indexPath -Raw
$index = $indexRaw -replace '(?s)^\s*/\*.*?\*/\s*', '' | ConvertFrom-Json

function Assert-Contains([string]$Value, [string]$Expected, [string]$Message) {
  if (-not $Value.Contains($Expected)) { throw $Message }
}

Assert-Contains $section "'home-customer-reviews.css' | asset_url }}&hrw=newsletter-heading-v1-20260820" 'Customer reviews must load their independent stylesheet with a cache version.'
Assert-Contains $section 'data-home-customer-reviews' 'Customer reviews must expose a stable section hook.'
Assert-Contains $section 'data-review-content-source="theme-editor"' 'Review copy must expose its traceable theme-editor source.'
Assert-Contains $section 'section.settings.summary_stars' 'Overall star count must be theme-editor configurable.'
Assert-Contains $section 'block.settings.stars' 'Each review star count must be theme-editor configurable.'
Assert-Contains $section 'block.settings.label' 'Each review label must be theme-editor configurable.'
Assert-Contains $section 'block.settings.text' 'Each review body must be theme-editor configurable.'
Assert-Contains $section 'block.settings.author' 'Each review author must be theme-editor configurable.'
Assert-Contains $section 'block.shopify_attributes' 'Review blocks must remain selectable in the theme editor.'
Assert-Contains $styles '.hrw-section' 'Customer review CSS must use the hrw namespace.'
Assert-Contains $styles 'scroll-snap-type: x mandatory' 'Review cards must use a mobile-friendly horizontal rail.'
Assert-Contains $styles 'scrollbar-width: none' 'The mobile review rail must hide the browser scrollbar while remaining swipeable.'
Assert-Contains $styles 'padding: 34px 0;' 'Customer reviews must use 34px vertical padding on mobile.'
Assert-Contains $styles 'padding: 72px 0 80px;' 'Customer reviews must retain their desktop padding.'
Assert-Contains $themeStyles '.newsletter h2 { margin: 0; font: 500 32px var(--display); }' 'Footer newsletter heading must retain its shared display typography declaration.'
Assert-Contains $styles 'font: 500 32px var(--display);' 'Customer review heading must reuse the exact Footer Newsletter font shorthand and display-family token.'

$reviewHeadingRule = [regex]::Match($styles, '(?s)\.hrw-section__heading\s*\{(?<body>.*?)\}')
if (-not $reviewHeadingRule.Success) {
  throw 'Customer review heading rule is missing.'
}
if ($reviewHeadingRule.Groups['body'].Value -match 'letter-spacing\s*:') {
  throw 'Customer review heading must not add letter spacing that differs from Footer Newsletter.'
}
if ($styles -match '(?s)@media\s*\(max-width:\s*749px\).*?\.hrw-section__heading\s*\{') {
  throw 'Customer review heading must not diverge from Footer Newsletter typography on mobile.'
}

if ($styles.Contains('padding: 52px 0 60px;')) {
  throw 'The old asymmetric mobile customer-review padding must be removed.'
}

if ($section -match '(?i)verified buyer|70[,.]934|Rosanne|Belinda|Charles') {
  throw 'Reference-site review claims or identities must not be copied into the theme.'
}

$nonHrwSelectors = [regex]::Matches($styles, '(?m)^\s*\.([a-z][a-z0-9_-]*)') |
  ForEach-Object { $_.Groups[1].Value } |
  Where-Object { -not $_.StartsWith('hrw-') }
if ($nonHrwSelectors.Count -gt 0) {
  throw "Customer review CSS contains an unscoped selector: $($nonHrwSelectors[0])"
}

if ($index.sections.customer_reviews.type -ne 'home-customer-reviews') {
  throw 'Homepage must include the customer reviews section.'
}

if ($index.order[-1] -ne 'customer_reviews') {
  throw 'Customer reviews must be the final homepage content section before the global footer.'
}

if ($index.sections.customer_reviews.block_order.Count -ne 3) {
  throw 'Homepage must start with three editable review cards.'
}

Write-Output 'Homepage customer review checks passed.'

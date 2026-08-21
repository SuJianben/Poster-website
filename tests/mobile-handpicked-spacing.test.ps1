$ErrorActionPreference = 'Stop'

$themeRoot = Split-Path -Parent $PSScriptRoot
$styles = Get-Content -LiteralPath (Join-Path $themeRoot 'assets\featured-flow.css') -Raw

if (-not $styles.Contains('.tilted-carousel { --tc-card-width:clamp(128px,44vw,220px); padding:34px 0; }')) {
  throw 'The Handpicked carousel must use 34px vertical padding on mobile.'
}

if (-not $styles.Contains('padding:72px 0;')) {
  throw 'The Handpicked desktop padding must remain 72px 0.'
}

if ($styles.Contains('.tilted-carousel { --tc-card-width:clamp(128px,44vw,220px); padding:64px 0; }')) {
  throw 'The old 64px mobile Handpicked padding must be removed.'
}

Write-Output 'Mobile Handpicked spacing checks passed.'

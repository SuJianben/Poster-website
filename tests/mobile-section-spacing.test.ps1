$ErrorActionPreference = 'Stop'

$themeRoot = Split-Path -Parent $PSScriptRoot
$styles = Get-Content -LiteralPath (Join-Path $themeRoot 'assets\poster-theme.css') -Raw

if (-not $styles.Contains('.section { padding: 34px 0; }')) {
  throw 'Mobile sections must use 34px vertical padding.'
}

$desktopSpacingCount = ([regex]::Matches($styles, [regex]::Escape('.section { padding: 64px 0; }'))).Count
if ($desktopSpacingCount -ne 1) {
  throw 'The desktop section padding must remain 64px 0 while the mobile override changes independently.'
}

Write-Output 'Mobile section spacing checks passed.'

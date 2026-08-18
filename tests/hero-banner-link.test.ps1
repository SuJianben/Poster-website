$ErrorActionPreference = 'Stop'

$themeRoot = Split-Path -Parent $PSScriptRoot
$section = Get-Content -LiteralPath (Join-Path $themeRoot 'sections\hero-poster.liquid') -Raw
$script = Get-Content -LiteralPath (Join-Path $themeRoot 'assets\gallery-hero.js') -Raw
$fixture = Join-Path $themeRoot 'tests\fixtures\hero-banner-link.html'

function Assert-Contains([string]$Value, [string]$Expected, [string]$Message) {
  if (-not $Value.Contains($Expected)) { throw $Message }
}

Assert-Contains $section '"type": "url"' 'Hero slide schema must expose a URL setting.'
Assert-Contains $section '"id": "link"' 'Hero slide URL setting must use the link id.'
Assert-Contains $section 'href="{{ block.settings.link }}"' 'Configured hero links must be rendered as href values.'
Assert-Contains $section 'data-phg-link' 'Linked hero slides must expose a dedicated link hook.'
Assert-Contains $section '<button class="phg__thumb-button"' 'Unlinked hero slides must keep the existing gallery button fallback.'
Assert-Contains $script "if (index !== activeIndex)" 'Inactive slide clicks must be handled as gallery navigation.'
Assert-Contains $script 'event.preventDefault();' 'Inactive linked slides must not navigate immediately.'
Assert-Contains $script "link.tabIndex = index === activeIndex ? 0 : -1;" 'Only the active hero link should be keyboard focusable.'
Assert-Contains $script "poster:hero-link-click" 'Hero link clicks must emit the analytics event.'
if (-not (Test-Path -LiteralPath $fixture)) { throw 'Hero banner browser fixture is missing.' }

Write-Output 'Hero banner link checks passed.'

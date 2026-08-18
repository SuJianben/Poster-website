$ErrorActionPreference = 'Stop'

$themeRoot = Split-Path -Parent $PSScriptRoot
$section = Get-Content -LiteralPath (Join-Path $themeRoot 'sections\main-product.liquid') -Raw
$customSection = Get-Content -LiteralPath (Join-Path $themeRoot 'sections\custom-product-main.liquid') -Raw
$script = Get-Content -LiteralPath (Join-Path $themeRoot 'assets\product-showcase.js') -Raw

$schemaMatch = [regex]::Match($section, '\{% schema %\}(?<schema>[\s\S]*?)\{% endschema %\}')
if (-not $schemaMatch.Success) { throw 'Main product section schema is missing.' }
$schema = $schemaMatch.Groups['schema'].Value | ConvertFrom-Json
$setting = $schema.settings | Where-Object { $_.id -eq 'show_thumbnail_navigation' }

if (-not $setting) { throw 'Thumbnail navigation setting is missing from the default product section.' }
if ($setting.type -ne 'checkbox') { throw 'Thumbnail navigation setting must use a checkbox.' }
if ($setting.default -ne $true) { throw 'Thumbnail navigation must remain enabled by default.' }

$conditionalCount = ([regex]::Matches($section, '\{% if section\.settings\.show_thumbnail_navigation %\}')).Count
if ($conditionalCount -ne 2) { throw "Expected two independently guarded thumbnail controls, found $conditionalCount." }
if (-not $section.Contains('data-ps-thumbnail-scroll="-1"')) { throw 'Previous thumbnail control is missing.' }
if (-not $section.Contains('data-ps-thumbnail-scroll="1"')) { throw 'Next thumbnail control is missing.' }
if (-not $section.Contains('data-ps-thumbnail-rail')) { throw 'Thumbnail rail must remain available when controls are hidden.' }
if (-not $section.Contains('data-ps-media-direction')) { throw 'Main image navigation must remain independent from thumbnail arrows.' }
if (-not $script.Contains("root.querySelectorAll('[data-ps-thumbnail-scroll]')")) { throw 'Thumbnail control script must tolerate zero rendered controls.' }
if ($customSection.Contains('show_thumbnail_navigation')) { throw 'Thumbnail navigation setting must not leak into custom product templates.' }

Write-Output 'Default product thumbnail navigation checks passed.'

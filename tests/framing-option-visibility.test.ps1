$ErrorActionPreference = 'Stop'

$themeRoot = Split-Path -Parent $PSScriptRoot
$visibilityPath = Join-Path $themeRoot 'assets\framing-option-visibility.js'
$productFramingPath = Join-Path $themeRoot 'assets\product-framing.js'
$customFramingPath = Join-Path $themeRoot 'assets\custom-framing.js'
$mainSectionPath = Join-Path $themeRoot 'sections\main-product.liquid'
$customSectionPath = Join-Path $themeRoot 'sections\custom-product-main.liquid'

foreach ($path in @($visibilityPath, $productFramingPath, $customFramingPath, $mainSectionPath, $customSectionPath)) {
  if (-not (Test-Path -LiteralPath $path)) { throw "Required file is missing: $path" }
}

$visibility = Get-Content -LiteralPath $visibilityPath -Raw
$productFraming = Get-Content -LiteralPath $productFramingPath -Raw
$customFraming = Get-Content -LiteralPath $customFramingPath -Raw
$mainSection = Get-Content -LiteralPath $mainSectionPath -Raw
$customSection = Get-Content -LiteralPath $customSectionPath -Raw

if ($visibility -notmatch "passepartout:\s*Object\.freeze\(\['white'\]\)") { throw 'Passepartout visibility must only allow white.' }
if ($visibility -notmatch "frame:\s*Object\.freeze\(\['white-wood', 'black-wood'\]\)") { throw 'Frame visibility must only allow white wood and black wood.' }

foreach ($script in @($productFraming, $customFraming)) {
  if ($script -notmatch 'PosterFramingVisibility\?\.isVisible') { throw 'Each framing renderer must use the shared visibility policy.' }
  if ($script -notmatch 'isFramingOptionVisible\(kind, variant\)') { throw 'Each framing renderer must filter rows through the shared visibility policy.' }
  if ($script -notmatch 'visible_passepartout_variant_count') { throw 'Visible passepartout counts must be included in analytics.' }
  if ($script -notmatch 'visible_frame_variant_count') { throw 'Visible frame counts must be included in analytics.' }
}

foreach ($section in @($mainSection, $customSection)) {
  $visibilityIndex = $section.IndexOf('framing-option-visibility.js')
  $rendererIndex = if ($section.Contains('product-framing.js')) { $section.IndexOf('product-framing.js') } else { $section.IndexOf('custom-framing.js') }
  if ($visibilityIndex -lt 0 -or $rendererIndex -lt 0 -or $visibilityIndex -gt $rendererIndex) {
    throw 'The shared visibility policy must load before the framing renderer.'
  }
  if ($section -notmatch 'psv=framing-visibility-20260818') { throw 'Framing visibility scripts must use the current cache version.' }
}

$nodeCheck = @'
globalThis.window = globalThis;
require(process.argv[1]);
const policy = globalThis.PosterFramingVisibility;
const cases = [
  ['passepartout', 'white', true],
  ['passepartout', 'pink', false],
  ['passepartout', 'red', false],
  ['frame', 'white-wood', true],
  ['frame', 'black-wood', true],
  ['frame', 'oak', false],
  ['frame', 'dark-oak', false],
  ['frame', 'black-alu', false],
  ['frame', 'brass-alu', false],
];
for (const [kind, styleSlug, expected] of cases) {
  const actual = policy.isVisible(kind, { styleSlug });
  if (actual !== expected) throw new Error(`${kind}/${styleSlug}: expected ${expected}, got ${actual}`);
}
'@

& node -e $nodeCheck $visibilityPath
if ($LASTEXITCODE -ne 0) { throw 'Runtime framing visibility checks failed.' }

Write-Output 'Framing option visibility checks passed.'

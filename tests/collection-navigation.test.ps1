$ErrorActionPreference = 'Stop'

$sectionPath = Join-Path $PSScriptRoot '..\sections\main-collection.liquid'
$templatePath = Join-Path $PSScriptRoot '..\templates\collection.json'
$scriptPath = Join-Path $PSScriptRoot '..\assets\collection-gallery.js'

$section = Get-Content -Raw $sectionPath
$template = Get-Content -Raw $templatePath | ConvertFrom-Json
$script = Get-Content -Raw $scriptPath

$expectedBlocks = [ordered]@{
  living_room = @{ collection = 'living-room-art'; label = 'Living room' }
  bedroom = @{ collection = 'bedroom-art'; label = 'Bedroom' }
  kitchen = @{ collection = 'kitchen-art'; label = 'Kitchen' }
  bathroom = @{ collection = 'bathroom-art'; label = 'Bathroom' }
  home_office = @{ collection = 'home-office-art'; label = 'Home Office' }
}

$main = $template.sections.main
if (@($main.block_order).Count -ne $expectedBlocks.Count) {
  throw 'Expected exactly five configured room collection links.'
}

foreach ($blockId in $expectedBlocks.Keys) {
  $block = $main.blocks.$blockId
  $expected = $expectedBlocks[$blockId]

  if ($block.type -ne 'collection_link') {
    throw "Expected $blockId to use the collection_link block type."
  }
  if ($block.settings.collection -ne $expected.collection -or $block.settings.label -ne $expected.label) {
    throw "Unexpected collection or label configured for $blockId."
  }
}

foreach ($hook in @('block.settings.collection', 'navigation_collection.url', 'navigation_collection.handle == collection.handle', 'aria-current="page"', 'block.shopify_attributes')) {
  if ($section -notmatch [regex]::Escape($hook)) {
    throw "Expected real collection navigation hook to exist: $hook"
  }
}

if ($section -match 'category_labels' -or $script -match 'cg-category-nav') {
  throw 'Legacy static-label navigation or click interception is still present.'
}

Write-Output 'PASS: Collection navigation uses five configurable Shopify collection links with active-page state.'

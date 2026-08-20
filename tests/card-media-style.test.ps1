$ErrorActionPreference = 'Stop'

$themeRoot = Split-Path -Parent $PSScriptRoot
$editorialStylePath = Join-Path $themeRoot 'assets/editorial-depth-cards.css'
$featuredStylePath = Join-Path $themeRoot 'assets/featured-flow.css'

$editorialStyle = Get-Content -Raw -LiteralPath $editorialStylePath
$featuredStyle = Get-Content -Raw -LiteralPath $featuredStylePath

function Assert-Contains {
  param(
    [string]$Text,
    [string]$Pattern,
    [string]$Message
  )

  if ($Text -notmatch $Pattern) {
    throw $Message
  }
}

Assert-Contains $editorialStyle '--depth-card-radius:\s*0;' 'Editorial product cards must remain square.'
Assert-Contains $featuredStyle '\.tilted-carousel__image\s*\{[^}]*background:\s*#fff;[^}]*border-radius:\s*0;' 'Handpicked cards must use a white square media surface.'
Assert-Contains $featuredStyle '\.tilted-carousel__image img\s*\{[^}]*height:\s*78%;[^}]*object-fit:\s*contain;[^}]*width:\s*76%;' 'Handpicked desktop artwork spacing must match the collection gallery.'
Assert-Contains $featuredStyle '@media\s*\(max-width:767px\)[^{]*\{[^}]*\.tilted-carousel[^}]*\}[^}]*\.tilted-carousel__image img\s*\{[^}]*height:\s*80%;[^}]*width:\s*82%;' 'Handpicked mobile artwork spacing must match the collection gallery.'

Write-Output 'Card media style regression checks passed.'

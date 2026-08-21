$ErrorActionPreference = 'Stop'

$themeRoot = Split-Path -Parent $PSScriptRoot
$section = Get-Content -LiteralPath (Join-Path $themeRoot 'sections\main-contact.liquid') -Raw
$styles = Get-Content -LiteralPath (Join-Path $themeRoot 'assets\contact-page.css') -Raw

function Assert-Contains([string]$Value, [string]$Expected, [string]$Message) {
  if (-not $Value.Contains($Expected)) { throw $Message }
}

$requiredInformation = @(
  'ZHILINK GLOBAL LTD',
  'Suite 302 4 Station Square, Cambridge, United Kingdom CB1 2GE',
  '+44 7529279167',
  'support@posterandform.com'
)

foreach ($value in $requiredInformation) {
  Assert-Contains $section $value "The Contact page schema must include the approved company information: $value"
}

Assert-Contains $section 'section.settings.show_company_information' 'The Contact page must provide a company-information visibility setting.'
Assert-Contains $section 'section.settings.company_name' 'The Contact page must render the configured company name.'
Assert-Contains $section 'section.settings.company_address' 'The Contact page must render the configured company address.'
Assert-Contains $section 'href="tel:' 'The company phone number must be callable.'
Assert-Contains $section 'href="mailto:' 'The company email address must open an email client.'
Assert-Contains $styles '.cp-contact__layout' 'The Contact page must define the company-information and form layout.'
Assert-Contains $styles 'grid-template-columns: 1fr;' 'The Contact page must stack company information and form on mobile.'

Write-Output 'Contact company information checks passed.'

$ErrorActionPreference = 'Stop'

$themeRoot = Split-Path -Parent $PSScriptRoot
$footer = Get-Content -LiteralPath (Join-Path $themeRoot 'sections\footer.liquid') -Raw
$locale = Get-Content -LiteralPath (Join-Path $themeRoot 'locales\en.default.json') -Raw | ConvertFrom-Json
$themeCss = Get-Content -LiteralPath (Join-Path $themeRoot 'assets\poster-theme.css') -Raw

function Assert-Contains([string]$Value, [string]$Expected, [string]$Message) {
  if (-not $Value.Contains($Expected)) { throw $Message }
}

Assert-Contains $footer "{% form 'customer'" 'The footer newsletter must use the native Shopify customer form.'
Assert-Contains $footer 'name="contact[tags]" value="newsletter"' 'The native form must tag the contact as a newsletter subscriber.'
Assert-Contains $footer 'name="contact[email]"' 'The native form must submit the email through contact[email].'
Assert-Contains $footer 'form.posted_successfully?' 'The native form must render Shopify submission success state.'
Assert-Contains $footer 'form.errors | default_errors' 'The native form must render Shopify validation errors.'
Assert-Contains $footer 'autocomplete="email"' 'The email field must support browser email autofill.'
Assert-Contains $themeCss '.newsletter .visually-hidden' 'The accessible newsletter label must remain visually hidden without changing the footer layout.'

if ($locale.newsletter.email_label -ne 'Email address') {
  throw 'The English newsletter email label is missing.'
}

if ($locale.newsletter.success -ne 'Thanks for subscribing.') {
  throw 'The English newsletter success message is missing.'
}

Write-Output 'Footer native newsletter checks passed.'

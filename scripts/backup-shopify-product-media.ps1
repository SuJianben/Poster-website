param(
    [Parameter(Mandatory = $true)]
    [string]$ManifestPath,

    [Parameter(Mandatory = $true)]
    [string]$OutputRoot,

    [ValidateRange(1, 12)]
    [int]$ThrottleLimit = 6
)

$ErrorActionPreference = 'Stop'

$resolvedManifest = (Resolve-Path -LiteralPath $ManifestPath).Path
$manifest = Get-Content -LiteralPath $resolvedManifest -Raw | ConvertFrom-Json
$resolvedOutput = [System.IO.Path]::GetFullPath($OutputRoot)
New-Item -ItemType Directory -Path $resolvedOutput -Force | Out-Null

$results = @($manifest.products | ForEach-Object -ThrottleLimit $ThrottleLimit -Parallel {
    $PSNativeCommandUseErrorActionPreference = $false
    $product = $_
    $outputRoot = $using:resolvedOutput
    $safeHandle = ($product.handle -replace '[^a-zA-Z0-9._-]', '-')
    if ([string]::IsNullOrWhiteSpace($safeHandle)) {
        $safeHandle = ($product.id -replace '[^0-9]', '')
    }

    $productRoot = Join-Path $outputRoot $safeHandle
    $mediaRoot = Join-Path $productRoot 'media'
    New-Item -ItemType Directory -Path $mediaRoot -Force | Out-Null

    $product | ConvertTo-Json -Depth 20 | Set-Content -LiteralPath (Join-Path $productRoot 'product-backup.json') -Encoding utf8

    $mediaResults = [System.Collections.Generic.List[object]]::new()
    $position = 0
    foreach ($media in $product.media) {
        $position++
        if ($media.mediaContentType -ne 'IMAGE' -or [string]::IsNullOrWhiteSpace($media.url)) {
            $mediaResults.Add([pscustomobject]@{
                position = $position
                mediaId = $media.id
                downloaded = $false
                reason = 'not-an-image-or-missing-url'
            })
            continue
        }

        $uri = [System.Uri]$media.url
        $extension = [System.IO.Path]::GetExtension($uri.AbsolutePath)
        if ([string]::IsNullOrWhiteSpace($extension)) {
            $extension = '.jpg'
        }
        $fileName = ('{0:D2}-{1}{2}' -f $position, ($media.id -replace '^.*/', ''), $extension)
        $targetPath = Join-Path $mediaRoot $fileName

        $downloaded = $false
        for ($attempt = 1; $attempt -le 3 -and -not $downloaded; $attempt++) {
            & curl.exe -4 -L --fail --silent --ssl-no-revoke --retry 3 --retry-all-errors --retry-delay 2 --connect-timeout 60 --max-time 300 --output $targetPath $media.url 2>$null
            $downloaded = ($LASTEXITCODE -eq 0)
            if (-not $downloaded) { Start-Sleep -Seconds (2 * $attempt) }
        }
        if (-not $downloaded) {
            throw "Media download failed with curl exit code $LASTEXITCODE`: $($media.url)"
        }
        $fileInfo = Get-Item -LiteralPath $targetPath
        if ($fileInfo.Length -le 0) {
            throw "Downloaded media is empty: $targetPath"
        }

        $mediaResults.Add([pscustomobject]@{
            position = $position
            mediaId = $media.id
            downloaded = $true
            file = $fileName
            bytes = $fileInfo.Length
            sha256 = (Get-FileHash -LiteralPath $targetPath -Algorithm SHA256).Hash
        })
    }

    $downloadedImages = @($mediaResults | Where-Object { $_.downloaded }).Count
    $expectedImages = @($product.media | Where-Object { $_.mediaContentType -eq 'IMAGE' -and -not [string]::IsNullOrWhiteSpace($_.url) }).Count
    $productResult = [pscustomobject]@{
        productId = $product.id
        title = $product.title
        handle = $product.handle
        expectedImages = $expectedImages
        downloadedImages = $downloadedImages
        valid = ($expectedImages -eq $downloadedImages)
        media = $mediaResults
    }
    $productResult | ConvertTo-Json -Depth 20 | Set-Content -LiteralPath (Join-Path $productRoot 'backup-validation.json') -Encoding utf8
    $productResult
})

$summary = [pscustomobject]@{
    generatedAt = (Get-Date).ToString('o')
    manifest = $resolvedManifest
    outputRoot = $resolvedOutput
    productCount = @($manifest.products).Count
    validProductCount = @($results | Where-Object { $_.valid }).Count
    failedProductCount = @($results | Where-Object { -not $_.valid }).Count
    products = $results
}

$summary | ConvertTo-Json -Depth 30 | Set-Content -LiteralPath (Join-Path $resolvedOutput 'backup-summary.json') -Encoding utf8

if ($summary.failedProductCount -gt 0) {
    throw "Backup validation failed for $($summary.failedProductCount) product(s)."
}

Write-Output ("Backed up {0} product(s); all image downloads validated." -f $summary.productCount)

# Builds a Chrome Web Store upload zip containing only the runtime files.
# Uses System.IO.Compression directly so ZIP entry paths use forward slashes
# (the spec-correct separator), avoiding Windows backslash entries that
# Compress-Archive would otherwise produce.
# Usage:  powershell -ExecutionPolicy Bypass -File .\package.ps1
$ErrorActionPreference = "Stop"
$root = $PSScriptRoot

$manifest = Get-Content (Join-Path $root "manifest.json") -Raw | ConvertFrom-Json
$version = $manifest.version

$dist = Join-Path $root "dist"
if (-not (Test-Path $dist)) { New-Item -ItemType Directory -Path $dist -Force | Out-Null }
$zipPath = Join-Path $dist "theater-mode-for-patreon-$version.zip"
if (Test-Path $zipPath) { Remove-Item $zipPath -Force }

# Runtime files only — no docs, license, git, or the packaging script itself.
# Map: source path on disk -> entry name inside the zip (forward slashes).
$files = [ordered]@{
  "manifest.json"     = "manifest.json"
  "background.js"     = "background.js"
  "theater.js"        = "theater.js"
  "icons/icon16.png"  = "icons/icon16.png"
  "icons/icon32.png"  = "icons/icon32.png"
  "icons/icon48.png"  = "icons/icon48.png"
  "icons/icon128.png" = "icons/icon128.png"
}

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::Open($zipPath, [System.IO.Compression.ZipArchiveMode]::Create)
try {
  foreach ($src in $files.Keys) {
    $full = Join-Path $root $src
    if (-not (Test-Path $full)) { throw "Missing runtime file: $src" }
    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile(
      $zip, $full, $files[$src],
      [System.IO.Compression.CompressionLevel]::Optimal) | Out-Null
  }
} finally {
  $zip.Dispose()
}

Write-Host "Built $zipPath"
Get-Item $zipPath | Select-Object Name, Length

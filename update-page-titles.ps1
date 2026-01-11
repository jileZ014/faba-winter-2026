# Update page titles to use Clash of the Barbarians 2026 branding

$sourceDir = "C:\Users\jange\Projects\Barbarian Tournament_2026\public"
$files = Get-ChildItem -Path $sourceDir -Include "*.html" -Recurse

foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw
    $originalContent = $content
    
    # Update titles with old branding
    $content = $content -replace "<title>Admin Dashboard - West Valley Basketball League</title>", "<title>Admin Dashboard - Clash of the Barbarians 2026</title>"
    $content = $content -replace "<title>Update Teams Structure - West Valley Basketball League</title>", "<title>Update Teams - Clash of the Barbarians 2026</title>"
    $content = $content -replace "<title>Coach Dashboard - AZ Flight Basketball League</title>", "<title>Coach Dashboard - Clash of the Barbarians 2026</title>"
    $content = $content -replace "<title>Staff Login - AZ Flight Basketball League</title>", "<title>Staff Login - Clash of the Barbarians 2026</title>"
    $content = $content -replace "<title>Setup Organizations - West Valley Basketball League</title>", "<title>Setup Organizations - Clash of the Barbarians 2026</title>"
    $content = $content -replace "<title>Update Games Collection - West Valley Basketball League</title>", "<title>Update Games - Clash of the Barbarians 2026</title>"
    $content = $content -replace "<title>404 - Page Not Found \| AZ Flight Basketball League</title>", "<title>404 - Page Not Found | Clash of the Barbarians 2026</title>"
    $content = $content -replace "<title>Scorekeeper Dashboard - AZ Flight Basketball League</title>", "<title>Scorekeeper Dashboard - Clash of the Barbarians 2026</title>"
    $content = $content -replace "<title>Comprehensive Test Script - West Valley Basketball League</title>", "<title>Test Suite - Clash of the Barbarians 2026</title>"
    $content = $content -replace "<title>AZ Flight Basketball League - Test</title>", "<title>Test Page - Clash of the Barbarians 2026</title>"
    $content = $content -replace "<title>AZ Flight Basketball - E2E Test Suite</title>", "<title>E2E Test Suite - Clash of the Barbarians 2026</title>"
    $content = $content -replace "<title>AZ Flight - System Test & Migration</title>", "<title>System Test - Clash of the Barbarians 2026</title>"
    
    # Update generic titles
    $content = $content -replace "<title>Page Not Found</title>", "<title>Page Not Found - Clash of the Barbarians 2026</title>"
    $content = $content -replace "<title>Import Clash of the Barbarians Data</title>", "<title>Data Import - Clash of the Barbarians 2026</title>"
    $content = $content -replace "<title>Quick Data Import</title>", "<title>Quick Import - Clash of the Barbarians 2026</title>"
    $content = $content -replace "<title>Debug Firebase Connection</title>", "<title>Debug - Clash of the Barbarians 2026</title>"
    $content = $content -replace "<title>Firebase Data Test</title>", "<title>Data Test - Clash of the Barbarians 2026</title>"
    
    # Update index-original-backup.html
    $content = $content -replace "<title>West Valley Basketball League \| Professional Youth Basketball Management</title>", "<title>Clash of the Barbarians 2026 - January 10, 2026 | Warrior Tournament Series</title>"
    
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Updated page title in: $($file.Name)" -ForegroundColor Green
    }
}

Write-Host "Page title update complete!" -ForegroundColor Cyan
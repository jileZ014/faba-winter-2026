# PowerShell script to update branding from Legacy to Barbarian Sports

$sourceDir = "C:\Users\jange\Projects\Barbarian Tournament_2026\public"

# Get all HTML, JS, and CSS files
$files = Get-ChildItem -Path $sourceDir -Recurse -Include "*.html", "*.js", "*.css"

foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw
    
    # Track if any changes were made
    $originalContent = $content
    
    # Replace text content
    $content = $content -replace "Legacy Winter League", "Clash of the Barbarians"
    $content = $content -replace "Legacy Youth Sports", "Barbarian Sports"
    $content = $content -replace "LYS", "Barbarian Sports"
    $content = $content -replace "legacy-winter25", "cotb26"
    $content = $content -replace "Winter 2025", "January 2026"
    $content = $content -replace "legacy-winter-league-2025", "cotb26"
    $content = $content -replace "legacywinter25", "cotb25"
    $content = $content -replace "Legacy", "Barbarian"
    
    # Update domain references
    $content = $content -replace "https://legacywinter25\.gametriq\.com", "https://cotb25.gametriq.com"
    $content = $content -replace "legacywinter25\.gametriq\.com", "cotb25.gametriq.com"
    
    # Update dates and years
    $content = $content -replace "2025", "2026"
    
    # Update specific tournament info
    $content = $content -replace "Phoenix, Arizona", "January 10, 2026"
    $content = $content -replace "Arizona's Premiere Basketball Events", "Warrior Tournament Series"
    
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Updated branding in: $($file.Name)" -ForegroundColor Green
    }
}

Write-Host "Branding update complete!" -ForegroundColor Cyan
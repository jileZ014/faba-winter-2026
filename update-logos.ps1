# PowerShell script to update logo references from legacy-logo to barbarian-logo

$sourceDir = "C:\Users\jange\Projects\Barbarian Tournament_2026\public"

# Get all HTML, JS, and CSS files
$files = Get-ChildItem -Path $sourceDir -Recurse -Include "*.html", "*.js", "*.css"

foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw
    
    # Track if any changes were made
    $originalContent = $content
    
    # Replace logo file references
    $content = $content -replace "legacy-logo-small\.png", "images/barbarian-logo.png"
    $content = $content -replace "legacy-logo-transparent\.png", "images/barbarian-logo.png"
    $content = $content -replace "/legacy-logo-transparent\.png", "/images/barbarian-logo.png"
    
    # Update alt text
    $content = $content -replace "alt=`"Legacy Youth Sports`"", "alt=`"Barbarian Sports`""
    
    # Update OG image URLs
    $content = $content -replace "https://legacywinter25\.gametriq\.com/legacy-logo-transparent\.png", "https://cotb25.gametriq.com/images/barbarian-logo.png"
    
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Updated logo references in: $($file.Name)" -ForegroundColor Green
    }
}

Write-Host "Logo reference update complete!" -ForegroundColor Cyan
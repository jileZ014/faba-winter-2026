# Fix CSS file references that were incorrectly renamed

$sourceDir = "C:\Users\jange\Projects\Barbarian Tournament_2026\public"
$files = Get-ChildItem -Path $sourceDir -Include "*.html" -Recurse

foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw
    $originalContent = $content
    
    # Fix CSS references that were incorrectly renamed
    $content = $content -replace "css/Barbarian-theme-blue\.css", "css/legacy-theme-blue.css"
    $content = $content -replace "css/Barbarian-theme\.css", "css/legacy-theme.css"
    $content = $content -replace "css/Barbarian-cards\.css", "css/legacy-cards.css"
    $content = $content -replace "css/Barbarian-responsive\.css", "css/legacy-responsive.css"
    
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Fixed CSS references in: $($file.Name)" -ForegroundColor Green
    }
}

Write-Host "CSS reference fix complete!" -ForegroundColor Cyan
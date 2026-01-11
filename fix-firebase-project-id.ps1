# Fix Firebase project ID inconsistencies - ensure all files use cotb26-d22f5

$sourceDir = "C:\Users\jange\Projects\Barbarian Tournament_2026\public"
$files = Get-ChildItem -Path $sourceDir -Include "*.html" -Recurse

foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw
    $originalContent = $content
    
    # Update project ID from cotb26 to cotb26-d22f5
    $content = $content -replace 'projectId: "cotb26"', 'projectId: "cotb26-d22f5"'
    
    # Also fix any auth domains
    $content = $content -replace 'authDomain: "cotb26\.firebaseapp\.com"', 'authDomain: "cotb26-d22f5.firebaseapp.com"'
    
    # Also fix storage bucket
    $content = $content -replace 'storageBucket: "cotb26\.firebasestorage\.app"', 'storageBucket: "cotb26-d22f5.firebasestorage.app"'
    
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Fixed Firebase project ID in: $($file.Name)" -ForegroundColor Green
    }
}

Write-Host "Firebase project ID fix complete!" -ForegroundColor Cyan
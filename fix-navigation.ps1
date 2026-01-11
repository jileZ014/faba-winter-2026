# Update navigation menus to reflect correct divisions (fixed version)

$sourceDir = "C:\Users\jange\Projects\Barbarian Tournament_2026\public"
$files = Get-ChildItem -Path $sourceDir -Include "*.html" -Recurse

foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw
    $originalContent = $content
    
    # Remove old navigation links individually
    $content = $content -replace '<li><a href="grade-3\.html"[^>]*>2/3RD GRADE</a></li>', ''
    $content = $content -replace '<li><a href="grade-girls\.html"[^>]*>7TH/8TH GIRLS</a></li>', ''
    
    # Make sure 6th grade link is present in all navigations that don't have it
    # First check if 6th grade is missing and add it after 5th grade
    if ($content -notmatch 'grade-6\.html') {
        $content = $content -replace '(<li><a href="grade-5\.html"[^>]*>5TH GRADE</a></li>)', '$1' + "`n" + '                    <li><a href="grade-6.html">6TH GRADE</a></li>'
    }
    
    # Clean up any double newlines or extra spacing
    $content = $content -replace '\n\s*\n\s*\n', "`n`n"
    
    # Fix active classes for each specific page
    if ($file.Name -eq "grade-4.html") {
        $content = $content -replace '<li><a href="grade-4\.html">4TH GRADE</a></li>', '<li><a href="grade-4.html" class="active">4TH GRADE</a></li>'
    } elseif ($file.Name -eq "grade-5.html") {
        $content = $content -replace '<li><a href="grade-5\.html">5TH GRADE</a></li>', '<li><a href="grade-5.html" class="active">5TH GRADE</a></li>'
    } elseif ($file.Name -eq "grade-6.html") {
        $content = $content -replace '<li><a href="grade-6\.html">6TH GRADE</a></li>', '<li><a href="grade-6.html" class="active">6TH GRADE</a></li>'
    } elseif ($file.Name -eq "grade-7.html") {
        $content = $content -replace '<li><a href="grade-7\.html">7TH GRADE</a></li>', '<li><a href="grade-7.html" class="active">7TH GRADE</a></li>'
    } elseif ($file.Name -eq "grade-8.html") {
        $content = $content -replace '<li><a href="grade-8\.html">8TH GRADE</a></li>', '<li><a href="grade-8.html" class="active">8TH GRADE</a></li>'
    }
    
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Updated navigation in: $($file.Name)" -ForegroundColor Green
    }
}

Write-Host "Navigation fix complete!" -ForegroundColor Cyan
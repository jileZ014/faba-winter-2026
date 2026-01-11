# Update navigation menus to reflect correct divisions

$sourceDir = "C:\Users\jange\Projects\Barbarian Tournament_2026\public"
$files = Get-ChildItem -Path $sourceDir -Include "*.html" -Recurse

foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw
    $originalContent = $content
    
    # Define the correct navigation structure
    $newNavigation = @'
            <nav class="main-nav">
                <ul>
                    <li><a href="index.html">HOME</a></li>
                    <li><a href="grade-4.html">4TH GRADE</a></li>
                    <li><a href="grade-5.html">5TH GRADE</a></li>
                    <li><a href="grade-6.html">6TH GRADE</a></li>
                    <li><a href="grade-7.html">7TH GRADE</a></li>
                    <li><a href="grade-8.html">8TH GRADE</a></li>
                </ul>
            </nav>
'@
    
    # Replace the entire navigation section
    $pattern = '<nav class="main-nav">.*?</nav>'
    $content = $content -replace $pattern, $newNavigation.Trim(), 'SingleLine'
    
    # Now fix the active class for each specific page
    if ($file.Name -eq "index.html") {
        $content = $content -replace '<li><a href="index.html">HOME</a></li>', '<li><a href="index.html" class="active">HOME</a></li>'
    } elseif ($file.Name -eq "grade-4.html") {
        $content = $content -replace '<li><a href="grade-4.html">4TH GRADE</a></li>', '<li><a href="grade-4.html" class="active">4TH GRADE</a></li>'
    } elseif ($file.Name -eq "grade-5.html") {
        $content = $content -replace '<li><a href="grade-5.html">5TH GRADE</a></li>', '<li><a href="grade-5.html" class="active">5TH GRADE</a></li>'
    } elseif ($file.Name -eq "grade-6.html") {
        $content = $content -replace '<li><a href="grade-6.html">6TH GRADE</a></li>', '<li><a href="grade-6.html" class="active">6TH GRADE</a></li>'
    } elseif ($file.Name -eq "grade-7.html") {
        $content = $content -replace '<li><a href="grade-7.html">7TH GRADE</a></li>', '<li><a href="grade-7.html" class="active">7TH GRADE</a></li>'
    } elseif ($file.Name -eq "grade-8.html") {
        $content = $content -replace '<li><a href="grade-8.html">8TH GRADE</a></li>', '<li><a href="grade-8.html" class="active">8TH GRADE</a></li>'
    }
    
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Updated navigation in: $($file.Name)" -ForegroundColor Green
    }
}

Write-Host "Navigation update complete!" -ForegroundColor Cyan
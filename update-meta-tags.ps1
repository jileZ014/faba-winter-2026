# Update meta tags and descriptions for Clash of the Barbarians 2026

$sourceDir = "C:\Users\jange\Projects\Barbarian Tournament_2026\public"
$files = Get-ChildItem -Path $sourceDir -Include "*.html" -Recurse

foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw
    $originalContent = $content
    
    # Update main descriptions to reference tournament instead of league
    $content = $content -replace 'Phoenix Arizona''s premier winter youth basketball league', 'Clash of the Barbarians 2026 - Arizona''s premier youth basketball tournament'
    $content = $content -replace 'Phoenix''s premier youth basketball league', 'Arizona''s premier youth basketball tournament'
    $content = $content -replace 'Arizona''s premier youth basketball league', 'Arizona''s premier youth basketball tournament'
    
    # Fix division-specific og:title tags
    if ($file.Name -eq "grade-5.html") {
        $content = $content -replace '<meta property="og:title" content="4th Grade Division - Clash of the Barbarians 2026">', '<meta property="og:title" content="5th Grade Division - Clash of the Barbarians 2026">'
        $content = $content -replace '<meta property="og:description" content="Follow the 4th Grade Division games', '<meta property="og:description" content="Follow the 5th Grade Division games'
        $content = $content -replace '<meta property="og:url" content="https://cotb25.gametriq.com/grade-4.html">', '<meta property="og:url" content="https://cotb25.gametriq.com/grade-5.html">'
    }
    
    if ($file.Name -eq "grade-7.html") {
        $content = $content -replace '<meta property="og:title" content="4th Grade Division - Clash of the Barbarians 2026">', '<meta property="og:title" content="7th Grade Division - Clash of the Barbarians 2026">'
        $content = $content -replace '<meta property="og:description" content="Follow the 4th Grade Division games', '<meta property="og:description" content="Follow the 7th Grade Division games'
        $content = $content -replace '<meta property="og:url" content="https://cotb25.gametriq.com/grade-4.html">', '<meta property="og:url" content="https://cotb25.gametriq.com/grade-7.html">'
    }
    
    if ($file.Name -eq "grade-8.html") {
        $content = $content -replace '<meta property="og:title" content="4th Grade Division - Clash of the Barbarians 2026">', '<meta property="og:title" content="8th Grade Division - Clash of the Barbarians 2026">'
        $content = $content -replace '<meta property="og:description" content="Follow the 4th Grade Division games', '<meta property="og:description" content="Follow the 8th Grade Division games'
        $content = $content -replace '<meta property="og:url" content="https://cotb25.gametriq.com/grade-4.html">', '<meta property="og:url" content="https://cotb25.gametriq.com/grade-8.html">'
    }
    
    # Update old URLs to the 2026 domain (cotb26 instead of cotb25)
    $content = $content -replace 'https://cotb25.gametriq.com', 'https://cotb26.gametriq.com'
    $content = $content -replace 'https://azflight.basketball', 'https://cotb26.gametriq.com'
    
    # Update the og:image path for index-original-backup.html
    $content = $content -replace 'https://azflight.basketball/assets/images/og-image.jpg', 'https://cotb26.gametriq.com/images/barbarian-logo.png'
    
    # Update og:title for index-original-backup.html
    $content = $content -replace '<meta property="og:title" content="West Valley Basketball League">', '<meta property="og:title" content="Clash of the Barbarians 2026 - January 10, 2026">'
    $content = $content -replace '<meta property="og:description" content="Arizona''s premier youth basketball league management system with live scoring and team management.">', '<meta property="og:description" content="Arizona''s premier youth basketball tournament with live scoring and professional administration.">'
    
    # Add missing og:title for grade-girls.html if not present
    if ($file.Name -eq "grade-girls.html" -and $content -notmatch 'og:title') {
        # Insert meta tags after viewport meta tag
        $metaInsert = '    <meta property="og:title" content="7th/8th Girls Division - Clash of the Barbarians 2026">
    <meta property="og:description" content="Follow the 7th/8th Girls Division games, standings, and player statistics in Arizona''s premier youth basketball tournament.">
    <meta property="og:url" content="https://cotb26.gametriq.com/grade-girls.html">
    <meta property="og:image" content="https://cotb26.gametriq.com/images/barbarian-logo.png">'
        
        $content = $content -replace '(<meta name="viewport"[^>]*>)', "`$1`n$metaInsert"
    }
    
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Updated meta tags in: $($file.Name)" -ForegroundColor Green
    }
}

Write-Host "Meta tags update complete!" -ForegroundColor Cyan
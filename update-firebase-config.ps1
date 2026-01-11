# PowerShell script to update Firebase configuration in all HTML files
# Replace legacy-winter25 config with cotb26-d22f5 config

$sourceDir = "C:\Users\jange\Projects\Barbarian Tournament_2026\public"
$htmlFiles = Get-ChildItem -Path $sourceDir -Filter "*.html" | Where-Object { $_.Name -match "^(index|admin|coach|scorekeeper-v2|grade-[4578])\.html$" }

$oldConfig = @'
        // Firebase configuration - Legacy Winter League 2025
        const firebaseConfig = {
            apiKey: "AIzaSyCj6-5BP9S1z2quiMkCExssDZHHeiaZKsI",
            authDomain: "legacy-winter25.firebaseapp.com",
            projectId: "legacy-winter25",
            storageBucket: "legacy-winter25.firebasestorage.app",
            messagingSenderId: "118067786266",
            appId: "1:118067786266:web:e0eb37eaf9492181e757a3",
            measurementId: "G-VDP4ZJ3RP8"
        };
'@

$newConfig = @'
        // Firebase configuration - Clash of the Barbarians 2026
        const firebaseConfig = {
            apiKey: "AIzaSyCt-zbPP-2JtWISqf5klwjXY2hnmN7g6iE",
            authDomain: "cotb26-d22f5.firebaseapp.com",
            projectId: "cotb26-d22f5",
            storageBucket: "cotb26-d22f5.firebasestorage.app",
            messagingSenderId: "436677601066",
            appId: "1:436677601066:web:8ccce90fe62764ae63a053",
            measurementId: "G-GB3NED184L"
        };
'@

foreach ($file in $htmlFiles) {
    $content = Get-Content -Path $file.FullName -Raw
    
    if ($content -match "legacy-winter25") {
        $content = $content -replace [regex]::Escape($oldConfig), $newConfig
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Updated Firebase config in: $($file.Name)" -ForegroundColor Green
    } else {
        Write-Host "No Firebase config found in: $($file.Name)" -ForegroundColor Yellow
    }
}

Write-Host "Firebase configuration update complete!" -ForegroundColor Cyan
$source = "C:\Users\jange\Desktop\Projects\Barbarian Tournament_2026"
$dest = "C:\Users\jange\Desktop\Projects\faba-winter-2026"

Get-ChildItem -Path $source -Recurse -File |
Where-Object { $_.Name -ne 'nul' -and $_.FullName -notlike '*node_modules*' } |
ForEach-Object {
    $destPath = $_.FullName.Replace($source, $dest)
    $destDir = Split-Path $destPath -Parent
    if (!(Test-Path $destDir)) {
        New-Item -ItemType Directory -Path $destDir -Force | Out-Null
    }
    Copy-Item $_.FullName $destPath -Force
}
Write-Host "Copy complete!"

Add-Type -AssemblyName System.Drawing

$sourceDir = "C:\Users\PC\.gemini\antigravity\brain\d4a57ac8-565d-446d-90c5-f3ee202a060b\.user_uploaded"
$destDir = "C:\Users\PC\.gemini\antigravity\scratch\telatiro-web\assets\img"

if (-not (Test-Path $destDir)) {
    New-Item -ItemType Directory -Path $destDir -Force | Out-Null
}

# Image 1: media_1787824147780.jpg -> Extract woman giving bag to courier
$file1 = Join-Path $sourceDir "media_1787824147780.jpg"
if (Test-Path $file1) {
    $img1 = [System.Drawing.Image]::FromFile($file1)
    Write-Output "Image 1 Dimensions: $($img1.Width) x $($img1.Height)"
    
    # In this screenshot (e.g. 720x1600 or 1080x2400):
    # The desktop hero image with the woman giving bag to courier is located in the upper middle area.
    # Let's crop it proportionately:
    $w = $img1.Width
    $h = $img1.Height
    
    # Coordinates of woman & courier in media_1787824147780.jpg:
    # Desktop hero photo is roughly at X: 35% to 75%, Y: 36% to 48% of the vertical image
    $cropX = [int]($w * 0.35)
    $cropY = [int]($h * 0.362)
    $cropW = [int]($w * 0.40)
    $cropH = [int]($h * 0.115)
    
    $rect = New-Object System.Drawing.Rectangle($cropX, $cropY, $cropW, $cropH)
    $bmp1 = New-Object System.Drawing.Bitmap($cropW, $cropH)
    $g1 = [System.Drawing.Graphics]::FromImage($bmp1)
    $g1.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g1.DrawImage($img1, (New-Object System.Drawing.Rectangle(0, 0, $cropW, $cropH)), $rect, [System.Drawing.GraphicsUnit]::Pixel)
    $g1.Dispose()
    
    $outPath1 = Join-Path $destDir "hero-entrega.jpg"
    $bmp1.Save($outPath1, [System.Drawing.Imaging.ImageFormat]::Jpeg)
    $bmp1.Dispose()
    $img1.Dispose()
    Write-Output "Saved hero-entrega.jpg ($cropW x $cropH)"
}

# Image 2: media_1787824147843.jpg -> Extract bag on doormat with door hanger tag
$file2 = Join-Path $sourceDir "media_1787824147843.jpg"
if (Test-Path $file2) {
    $img2 = [System.Drawing.Image]::FromFile($file2)
    Write-Output "Image 2 Dimensions: $($img2.Width) x $($img2.Height)"
    
    $w2 = $img2.Width
    $h2 = $img2.Height
    
    # Top right photo is the garbage bag on the doormat outside door:
    # Roughly X: 60% to 100%, Y: 16% to 34%
    $cropX2 = [int]($w2 * 0.60)
    $cropY2 = [int]($h2 * 0.16)
    $cropW2 = [int]($w2 * 0.40)
    $cropH2 = [int]($h2 * 0.18)
    
    $rect2 = New-Object System.Drawing.Rectangle($cropX2, $cropY2, $cropW2, $cropH2)
    $bmp2 = New-Object System.Drawing.Bitmap($cropW2, $cropH2)
    $g2 = [System.Drawing.Graphics]::FromImage($bmp2)
    $g2.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g2.DrawImage($img2, (New-Object System.Drawing.Rectangle(0, 0, $cropW2, $cropH2)), $rect2, [System.Drawing.GraphicsUnit]::Pixel)
    $g2.Dispose()
    
    $outPath2 = Join-Path $destDir "bolsa-felpudo.jpg"
    $bmp2.Save($outPath2, [System.Drawing.Imaging.ImageFormat]::Jpeg)
    $bmp2.Dispose()
    $img2.Dispose()
    Write-Output "Saved bolsa-felpudo.jpg ($cropW2 x $cropH2)"
}

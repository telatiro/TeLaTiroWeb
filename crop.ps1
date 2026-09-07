Add-Type -AssemblyName System.Drawing

$src1 = "C:\Users\PC\.gemini\antigravity\scratch\telatiro-web\assets\hero-mockup.jpg"
$src2 = "C:\Users\PC\.gemini\antigravity\scratch\telatiro-web\assets\brand-mockup.jpg"

if (Test-Path $src1) {
    $img1 = [System.Drawing.Bitmap]::FromFile($src1)
    $w1 = $img1.Width
    $h1 = $img1.Height
    Write-Host "Img1 size: $w1 x $h1"

    # Crop Woman handing bag to courier:
    # In hero-mockup.jpg (720x1600 or 1080x2400):
    # Desktop hero section is roughly X: 35%..75%, Y: 36%..48%
    $cx1 = [int]($w1 * 0.35)
    $cy1 = [int]($h1 * 0.363)
    $cw1 = [int]($w1 * 0.395)
    $ch1 = [int]($h1 * 0.114)

    $cropBmp1 = New-Object System.Drawing.Bitmap($cw1, $ch1)
    $g1 = [System.Drawing.Graphics]::FromImage($cropBmp1)
    $g1.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g1.DrawImage($img1, (New-Object System.Drawing.Rectangle(0, 0, $cw1, $ch1)), $cx1, $cy1, $cw1, $ch1, [System.Drawing.GraphicsUnit]::Pixel)
    $g1.Dispose()
    
    $out1 = "C:\Users\PC\.gemini\antigravity\scratch\telatiro-web\assets\hero-entrega.jpg"
    $cropBmp1.Save($out1, [System.Drawing.Imaging.ImageFormat]::Jpeg)
    $cropBmp1.Dispose()
    $img1.Dispose()
    Write-Host "Created hero-entrega.jpg ($cw1 x $ch1)"
}

if (Test-Path $src2) {
    $img2 = [System.Drawing.Bitmap]::FromFile($src2)
    $w2 = $img2.Width
    $h2 = $img2.Height
    Write-Host "Img2 size: $w2 x $h2"

    # Crop Bag on doormat with door hanger tag:
    # In brand-mockup.jpg, top-right image:
    # X: 60%..99%, Y: 16.2%..34%
    $cx2 = [int]($w2 * 0.60)
    $cy2 = [int]($h2 * 0.162)
    $cw2 = [int]($w2 * 0.39)
    $ch2 = [int]($h2 * 0.178)

    $cropBmp2 = New-Object System.Drawing.Bitmap($cw2, $ch2)
    $g2 = [System.Drawing.Graphics]::FromImage($cropBmp2)
    $g2.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g2.DrawImage($img2, (New-Object System.Drawing.Rectangle(0, 0, $cw2, $ch2)), $cx2, $cy2, $cw2, $ch2, [System.Drawing.GraphicsUnit]::Pixel)
    $g2.Dispose()

    $out2 = "C:\Users\PC\.gemini\antigravity\scratch\telatiro-web\assets\bolsa-felpudo.jpg"
    $cropBmp2.Save($out2, [System.Drawing.Imaging.ImageFormat]::Jpeg)
    $cropBmp2.Dispose()

    # Also crop the delivery uniform courier if desired (bottom right):
    # Courier standing in uniform: X: 60%..98%, Y: 58%..72%
    $cx3 = [int]($w2 * 0.60)
    $cy3 = [int]($h2 * 0.585)
    $cw3 = [int]($w2 * 0.38)
    $ch3 = [int]($h2 * 0.13)
    $cropBmp3 = New-Object System.Drawing.Bitmap($cw3, $ch3)
    $g3 = [System.Drawing.Graphics]::FromImage($cropBmp3)
    $g3.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g3.DrawImage($img2, (New-Object System.Drawing.Rectangle(0, 0, $cw3, $ch3)), $cx3, $cy3, $cw3, $ch3, [System.Drawing.GraphicsUnit]::Pixel)
    $g3.Dispose()

    $out3 = "C:\Users\PC\.gemini\antigravity\scratch\telatiro-web\assets\personal-uniforme.jpg"
    $cropBmp3.Save($out3, [System.Drawing.Imaging.ImageFormat]::Jpeg)
    $cropBmp3.Dispose()

    $img2.Dispose()
    Write-Host "Created bolsa-felpudo.jpg and personal-uniforme.jpg"
}

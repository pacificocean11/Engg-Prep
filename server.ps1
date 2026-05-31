$port = 8000
$rootPath = Get-Location

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()
Write-Host "Server started at http://localhost:$port/"
Write-Host "Press Ctrl+C to stop the server"

$mimeTypes = @{
    '.html' = 'text/html; charset=utf-8'
    '.css' = 'text/css; charset=utf-8'
    '.js' = 'application/javascript; charset=utf-8'
    '.json' = 'application/json; charset=utf-8'
    '.png' = 'image/png'
    '.jpg' = 'image/jpeg'
    '.jpeg' = 'image/jpeg'
    '.gif' = 'image/gif'
    '.svg' = 'image/svg+xml'
    '.webp' = 'image/webp'
    '.ico' = 'image/x-icon'
    '.woff' = 'font/woff'
    '.woff2' = 'font/woff2'
    '.ttf' = 'font/ttf'
}

while ($true) {
    $context = $listener.GetContext()
    $request = $context.Request
    $response = $context.Response
    
    $filePath = Join-Path $rootPath ($request.Url.LocalPath -replace '^/', '')
    
    if ($filePath.EndsWith('/') -or (Test-Path -PathType Container $filePath)) {
        $filePath = Join-Path $filePath 'index.html'
    }
    
    if (Test-Path $filePath) {
        $extension = [System.IO.Path]::GetExtension($filePath).ToLower()
        $contentType = $mimeTypes[$extension]
        if (-not $contentType) {
            $contentType = 'application/octet-stream'
        }
        
        $content = [System.IO.File]::ReadAllBytes($filePath)
        $response.ContentLength64 = $content.Length
        $response.ContentType = $contentType
        $response.OutputStream.Write($content, 0, $content.Length)
    } else {
        $response.StatusCode = 404
        $response.StatusDescription = "Not Found"
        $response.ContentType = 'text/plain; charset=utf-8'
        $buffer = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
        $response.OutputStream.Write($buffer, 0, $buffer.Length)
    }
    
    $response.OutputStream.Close()
}

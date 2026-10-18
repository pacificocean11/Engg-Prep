const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const PORT = 8000;
const ROOT = __dirname;

function streamDriveVideo(driveId, req, res) {
    const driveUrl = `https://drive.usercontent.google.com/download?id=${driveId}&export=download`;
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    };
    if (req.headers.range) {
        headers['Range'] = req.headers.range;
    }

    const driveReq = https.get(driveUrl, { headers }, driveRes => {
        if (driveRes.statusCode === 302 || driveRes.statusCode === 303 || driveRes.statusCode === 307) {
            const redirectUrl = driveRes.headers.location;
            https.get(redirectUrl, { headers }, redRes => {
                res.writeHead(redRes.statusCode, {
                    'Content-Type': 'video/mp4',
                    'Content-Length': redRes.headers['content-length'] || '',
                    'Content-Range': redRes.headers['content-range'] || '',
                    'Accept-Ranges': 'bytes',
                    'Access-Control-Allow-Origin': '*',
                    'Cache-Control': 'public, max-age=86400'
                });
                redRes.pipe(res);
            }).on('error', err => {
                res.writeHead(500);
                res.end(err.message);
            });
            return;
        }

        res.writeHead(driveRes.statusCode, {
            'Content-Type': 'video/mp4',
            'Content-Length': driveRes.headers['content-length'] || '',
            'Content-Range': driveRes.headers['content-range'] || '',
            'Accept-Ranges': 'bytes',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'public, max-age=86400'
        });
        driveRes.pipe(res);
    });

    driveReq.on('error', err => {
        res.writeHead(500);
        res.end(err.message);
    });

    req.on('close', () => {
        driveReq.destroy();
    });
}

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm'
};

const COMPRESSIBLE = new Set(['.html', '.css', '.js', '.json', '.svg', '.txt']);

const server = http.createServer((req, res) => {
    let rawUrl = (req.url || '/').split('?')[0];
    let decodedUrl = decodeURIComponent(rawUrl);

    // Google Drive video stream proxy endpoint
    if (decodedUrl.startsWith('/api/drive-stream/')) {
        const driveId = decodedUrl.replace('/api/drive-stream/', '').trim();
        streamDriveVideo(driveId, req, res);
        return;
    }

    let filePath = path.join(ROOT, decodedUrl);

    // Prevent directory traversal
    if (!filePath.startsWith(ROOT)) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('403 Forbidden');
        return;
    }

    if (filePath.endsWith(path.sep) || (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory())) {
        filePath = path.join(filePath, 'index.html');
    }

    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found');
            return;
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';
        const totalSize = stats.size;
        const range = req.headers.range;

        // Video streaming with byte-range support
        if (range && (ext === '.mp4' || ext === '.webm')) {
            const parts = range.replace(/bytes=/, '').split('-');
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : totalSize - 1;
            const chunksize = (end - start) + 1;
            const fileStream = fs.createReadStream(filePath, { start, end, highWaterMark: 256 * 1024 });

            res.writeHead(206, {
                'Content-Range': `bytes ${start}-${end}/${totalSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunksize,
                'Content-Type': contentType,
            });

            fileStream.pipe(res);
            res.on('close', () => fileStream.destroy());
            fileStream.on('error', () => {
                if (!res.headersSent) res.writeHead(500);
                res.end();
            });
            return;
        }

        // Conditional GET / ETag support for instantaneous reloads
        const etag = `W/"${stats.size.toString(16)}-${stats.mtime.getTime().toString(16)}"`;
        if (req.headers['if-none-match'] === etag) {
            res.writeHead(304, {
                'ETag': etag,
                'Cache-Control': 'no-cache',
            });
            res.end();
            return;
        }

        const acceptEncoding = req.headers['accept-encoding'] || '';
        const canGzip = COMPRESSIBLE.has(ext) && acceptEncoding.includes('gzip');

        const headers = {
            'Content-Type': contentType,
            'Accept-Ranges': 'bytes',
            'ETag': etag,
            'Cache-Control': 'no-cache',
        };

        if (canGzip) {
            headers['Content-Encoding'] = 'gzip';
            res.writeHead(200, headers);

            const fileStream = fs.createReadStream(filePath, { highWaterMark: 256 * 1024 });
            const gzip = zlib.createGzip({ level: 4 }); // Fast compression

            fileStream.pipe(gzip).pipe(res);

            res.on('close', () => {
                fileStream.destroy();
                gzip.destroy();
            });

            fileStream.on('error', () => {
                if (!res.headersSent) res.writeHead(500);
                res.end();
            });
        } else {
            headers['Content-Length'] = totalSize;
            res.writeHead(200, headers);

            const fileStream = fs.createReadStream(filePath, { highWaterMark: 256 * 1024 });
            fileStream.pipe(res);

            res.on('close', () => fileStream.destroy());
            fileStream.on('error', () => {
                if (!res.headersSent) res.writeHead(500);
                res.end();
            });
        }
    });
});

// Configure keep-alive timeouts to prevent socket stalls
server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;

server.listen(PORT, () => {
    console.log(`⚡ Optimized Dev Server running at http://localhost:${PORT}/`);
    console.log('Press Ctrl+C to stop');
});

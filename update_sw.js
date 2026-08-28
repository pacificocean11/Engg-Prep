const fs = require('fs');

function incrementCache(filePath) {
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        // Look for CACHE_NAME = 'app-cache-vX'
        const match = content.match(/const\s+CACHE_NAME\s*=\s*['"`]app-cache-v(\d+)['"`]/);
        if (match) {
            const oldVersion = parseInt(match[1]);
            const newVersion = oldVersion + 1;
            content = content.replace(match[0], `const CACHE_NAME = 'app-cache-v${newVersion}'`);
            fs.writeFileSync(filePath, content);
            console.log(`Updated ${filePath} to version ${newVersion}`);
        } else {
            console.log(`Could not find CACHE_NAME in ${filePath}`);
        }
    }
}

incrementCache('sw.js');
incrementCache('www/sw.js');

const puppeteer = require('puppeteer');
(async () => {
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    
    await page.goto('http://127.0.0.1:8000/login.html', { waitUntil: 'networkidle0' });
    await page.evaluate(() => {
        localStorage.setItem('enggtv_user', JSON.stringify({
            username: 'admin',
            uid: 'Yc73rbNGX7hqcz9yq5KqvGxYRFn2',
            email: 'admin@engg.tv'
        }));
    });
    
    await page.goto('http://127.0.0.1:8000/index.html', { waitUntil: 'networkidle0' });
    
    // Find coordinates of study btn
    const studyBtn = await page.$('li[data-page="study"]');
    if (studyBtn) {
        const box = await studyBtn.boundingBox();
        const x = box.x + box.width / 2;
        const y = box.y + box.height / 2;
        
        console.log(`Clicking at ${x}, ${y}`);
        
        // Find what's actually at that point
        const elementId = await page.evaluate((cx, cy) => {
            const el = document.elementFromPoint(cx, cy);
            return el ? el.tagName + (el.id ? '#' + el.id : '') + (el.className ? '.' + el.className.split(' ').join('.') : '') : 'none';
        }, x, y);
        console.log('Element at point:', elementId);
        
        await page.mouse.click(x, y);
        await page.waitForTimeout(1000);
        
        const activePage = await page.$eval('.page.active', el => el.id);
        console.log('Active page after click:', activePage);
    }
    
    await browser.close();
})();

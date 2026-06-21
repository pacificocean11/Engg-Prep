const puppeteer = require('puppeteer');

(async () => {
    console.log('Launching browser...');
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
    
    console.log('Navigating to login page to set local storage...');
    await page.goto('http://localhost:3000/login.html');
    
    console.log('Setting localStorage for authentication bypass...');
    await page.evaluate(() => {
        localStorage.setItem('enggtv_show_intro', 'true');
        localStorage.setItem('enggtv_authenticated', 'true');
        localStorage.setItem('enggtv_discipline', 'Mechanical');
        localStorage.setItem('enggtv_user', JSON.stringify({
            uid: "demo123",
            username: "demo",
            email: "demo@engg.tv",
            tier: "premium",
            discipline: "Mechanical",
            userPoints: 420
        }));
    });
    
    console.log('Navigating to index.html...');
    await page.goto('http://localhost:3000/index.html', { waitUntil: 'domcontentloaded' });
    
    console.log('Waiting for dashboard to be visible...');
    await page.waitForSelector('#dashboard', { visible: true, timeout: 10000 });
    
    console.log('Waiting 3 seconds for UI to settle...');
    await new Promise(r => setTimeout(r, 3000));
    
    console.log('Taking screenshot...');
    await page.screenshot({ path: 'www/app_dashboard_preview.png' });
    
    console.log('Screenshot saved to www/app_dashboard_preview.png');
    await browser.close();
})();

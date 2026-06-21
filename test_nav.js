const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    // Catch errors
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
    
    // To set localStorage BEFORE navigation, we can go to the empty page of the same origin,
    // or just intercept the navigation, or use page.evaluateOnNewDocument
    await page.evaluateOnNewDocument(() => {
        localStorage.setItem('enggtv_authenticated', 'true');
        localStorage.setItem('enggtv_user', JSON.stringify({username: 'test', tier: 'premium'}));
    });
    
    await page.goto('file://' + path.resolve('www/index.html'));
    
    await new Promise(r => setTimeout(r, 1000));
    
    // Simulate click
    try {
        await page.click('#bottom-nav li[data-page="study"]');
        console.log("Clicked study button!");
    } catch (e) {
        console.log("Click failed:", e.message);
    }
    
    // Check if bottom nav exists
    const navExists = await page.evaluate(() => {
        const nav = document.querySelector('#bottom-nav');
        if (!nav) return false;
        
        const rect = nav.getBoundingClientRect();
        return {
            x: rect.x, y: rect.y, w: rect.width, h: rect.height,
            isPointerEventsNone: window.getComputedStyle(nav).pointerEvents
        };
    });
    console.log("Nav state:", navExists);

    await browser.close();
})();

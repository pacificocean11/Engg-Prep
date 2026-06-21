const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
    
    await page.goto('file://' + path.resolve('www/index.html'));
    
    // wait a bit for initialization
    await new Promise(r => setTimeout(r, 1000));
    
    console.log("Clicking 'study' on bottom nav...");
    try {
        await page.click('nav#bottom-nav li[data-page="study"]');
        console.log("Clicked successfully.");
    } catch (e) {
        console.log("Click failed:", e.message);
    }
    
    // wait a bit to see if there are errors
    await new Promise(r => setTimeout(r, 1000));
    
    await browser.close();
})();

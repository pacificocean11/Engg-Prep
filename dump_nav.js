const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    await page.goto('file://' + path.resolve('www/index.html'));
    
    // wait a bit for initialization
    await new Promise(r => setTimeout(r, 1000));
    
    const html = await page.evaluate(() => {
        const nav = document.querySelector('nav#bottom-nav');
        return nav ? nav.outerHTML : 'NOT FOUND';
    });
    
    console.log("Nav element:", html);
    
    await browser.close();
})();

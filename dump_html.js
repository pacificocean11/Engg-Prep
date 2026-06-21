const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    await page.goto('file://' + path.resolve('www/index.html'));
    
    // wait a bit for initialization
    await new Promise(r => setTimeout(r, 1000));
    
    const htmlInfo = await page.evaluate(() => {
        return {
            len: document.body.innerHTML.length,
            end: document.body.innerHTML.substring(document.body.innerHTML.length - 1000),
            navs: Array.from(document.querySelectorAll('nav')).map(n => n.id)
        };
    });
    
    console.log(htmlInfo);
    
    await browser.close();
})();

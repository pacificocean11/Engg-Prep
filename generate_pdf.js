const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        
        const filePath = `file:///${path.join(__dirname, 'analytic_geometry_handbook.html').replace(/\\/g, '/')}`;
        console.log(`Navigating to ${filePath}`);
        
        await page.goto(filePath);
        
        // Give it a tiny bit of extra time to render
        await new Promise(r => setTimeout(r, 2000));
        
        await page.pdf({
            path: 'FE_Mechanical_Handbook_Sample.pdf',
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20px',
                right: '20px',
                bottom: '20px',
                left: '20px'
            }
        });
        
        console.log('PDF generated successfully!');
        await browser.close();
    } catch (e) {
        console.error('Error generating PDF:', e);
        process.exit(1);
    }
})();

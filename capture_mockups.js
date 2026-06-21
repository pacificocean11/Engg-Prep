const puppeteer = require('puppeteer');

(async () => {
    console.log('Launching browser...');
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    
    console.log('Navigating to login page to set local storage...');
    await page.goto('http://localhost:3000/login.html');
    await page.evaluate(() => {
        localStorage.setItem('enggtv_show_intro', 'true');
        localStorage.setItem('enggtv_authenticated', 'true');
        localStorage.setItem('enggtv_discipline', 'Mechanical');
        localStorage.setItem('enggtv_user', JSON.stringify({
            uid: "admin123",
            username: "admin",
            email: "admin@engg.tv",
            tier: "premium",
            discipline: "Mechanical",
            userPoints: 2450
        }));
    });
    
    async function prepareDashboard() {
        await page.waitForSelector('#dashboard', { visible: true, timeout: 10000 });
        await new Promise(r => setTimeout(r, 1000));
        // Inject fake high progress visually
        await page.evaluate(() => {
            const overallText = document.getElementById('overall-progress-text');
            if(overallText) overallText.innerText = '63% Completed';
            
            const circleText = document.getElementById('overall-progress-circle-text');
            if(circleText) circleText.innerText = '63%';
            
            const circle = document.getElementById('overall-progress-circle');
            if(circle) {
                const circumference = 2 * Math.PI * 42;
                circle.style.strokeDasharray = circumference;
                circle.style.strokeDashoffset = circumference - (circumference * 0.63);
                circle.style.transition = 'none'; // force it immediately
            }
            
            const pointsBar = document.getElementById('points-progress-bar');
            if(pointsBar) {
                pointsBar.style.width = '80%';
                pointsBar.style.transition = 'none';
            }
            
            const pointsText = document.getElementById('points-needed-text');
            if(pointsText) pointsText.innerText = '2450 Points Earned';
            
            const streakDisplay = document.getElementById('settings-streak-display');
            if(streakDisplay) streakDisplay.innerText = '14 Days';
            
            const greeting = document.getElementById('user-greeting');
            if(greeting) greeting.innerText = 'Welcome back, Admin';
        });
        await new Promise(r => setTimeout(r, 500));
    }
    
    // 1. Desktop
    console.log('Capturing Desktop...');
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
    await page.goto('http://localhost:3000/index.html', { waitUntil: 'domcontentloaded' });
    await prepareDashboard();
    await page.screenshot({ path: 'www/desktop.png' });
    
    // 2. Tablet
    console.log('Capturing Tablet...');
    await page.setViewport({ width: 768, height: 1024, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await prepareDashboard();
    await page.screenshot({ path: 'www/tablet.png' });
    
    // 3. Mobile
    console.log('Capturing Mobile...');
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await prepareDashboard();
    await page.screenshot({ path: 'www/mobile.png' });
    
    // 4. Generate Composite Mockup
    console.log('Generating Composite Mockup...');
    await page.setViewport({ width: 1400, height: 800, deviceScaleFactor: 2 });
    await page.goto('http://localhost:3000/mockup_generator.html', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: 'www/multi_device_mockups.png', omitBackground: true });
    
    console.log('All screenshots saved!');
    await browser.close();
})();

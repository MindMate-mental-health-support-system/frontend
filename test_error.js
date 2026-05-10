import puppeteer from 'puppeteer';

(async () => {
    try {
        console.log('Launching browser...');
        const browser = await puppeteer.launch({ headless: 'new' });
        const page = await browser.newPage();

        // Listen to console errors
        page.on('console', msg => {
            if (msg.type() === 'error') {
                console.log('BROWSER CONSOLE ERROR:', msg.text());
            }
        });

        page.on('pageerror', err => {
            console.log('BROWSER PAGE ERROR:', err.toString());
        });

        console.log('Navigating to http://localhost:5174...');
        await page.goto('http://localhost:5174', { waitUntil: 'networkidle0', timeout: 10000 });

        const content = await page.content();
        console.log('Page loaded. Body length:', content.length);

        await browser.close();
        console.log('Done.');
    } catch (err) {
        console.error('Puppeteer Script Error:', err);
        process.exit(1);
    }
})();

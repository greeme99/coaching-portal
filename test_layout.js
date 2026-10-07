const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:4321');
  const appShellDisplay = await page.$eval('.app-shell', el => window.getComputedStyle(el).display);
  const sidebarNavDisplay = await page.$eval('.sidebar-nav', el => window.getComputedStyle(el).display);
  const flexDir = await page.$eval('.sidebar-nav', el => window.getComputedStyle(el).flexDirection);
  console.log('app-shell display:', appShellDisplay);
  console.log('sidebar-nav display:', sidebarNavDisplay);
  console.log('sidebar-nav flex-dir:', flexDir);
  await browser.close();
})();

import puppeteer from "puppeteer";

const main = async () => {

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    await page.goto("https://www.saskhealthauthority.ca/your-health/conditions-illnesses-services-wellness/all-z/immunizations/immunizations-services-and-locations")
    await page.setViewport({width: 1080, height: 1024});
};


main();

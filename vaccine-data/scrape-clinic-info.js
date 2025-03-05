// importing libraries
const puppeteer = require('puppeteer');
const fs = require('fs');

// Use set environment browser if set, if not use puppeteer chromium
const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || puppeteer.executablePath();

// Check for the "Next" and controlling the flag
async function getNextButton(page){
  const nextButton = await page.$('.paginate_button.next:not(.disabled)');
  if (nextButton) {
    await page.click('.paginate_button.next');
    await page.waitForSelector('.c-table tbody tr');
    return true;
  }
  return false;
}

// Function for scrapping the data of each page
async function pageDataCollecting() {
  const browser = await puppeteer.launch({executablePath});
  const page = await browser.newPage();
  
  let clinicInfo = []; 
  let flag = true; // with this flag we can control the next page bottm
  let url = "https://www.saskhealthauthority.ca/your-health/conditions-illnesses-services-wellness/all-z/immunizations/immunizations-services-and-locations";

  await page.goto(url, { waitUntil: 'domcontentloaded' });

  while (flag) {
    await page.waitForSelector('.c-table');
    const data = await page.evaluate(() => {
      let rows = [];
      document.querySelectorAll('.c-table tbody tr').forEach(row => {
        let cells = row.querySelectorAll('td');
        if (cells.length > 0) {
          rows.push({
            serviceArea: cells[0].innerText.trim().split("\n\n")[0],
            name: cells[0].innerText.trim().split("\n\n")[1],
            address: cells[1].innerText.trim(),
            contactInfo: cells[2].innerText.trim(),
            hours: cells[3].innerText.trim(),
            services: cells[4].innerText.trim().split("\n\n")
          });
        }
      });
      return rows;
    });
    clinicInfo = clinicInfo.concat(data);
    flag = await getNextButton(page)
  }
  fs.writeFileSync('clinic.json', JSON.stringify({"time-created": Date.now(), "clinics": clinicInfo}, null, 2));
  await browser.close();
}

pageDataCollecting()

// importing libraries
const puppeteer = require('puppeteer');
const fs = require('fs');

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
  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Variables
  let clinicInfo = []; 
  let flag = true; // with this flag we can control the next page bottm
  let url = "https://www.saskhealthauthority.ca/your-health/conditions-illnesses-services-wellness/all-z/immunizations/immunizations-services-and-locations";

  // Navigate the page to a URL.
  await page.goto(url, { waitUntil: 'domcontentloaded' });

  while (flag) {
    
    // Wait for the table to load
    await page.waitForSelector('.c-table');

    // Extract table data
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
            Services: cells[4].innerText.trim().split("\n\n"),
          });
        }
      });
      return rows;
    });
    clinicInfo = clinicInfo.concat(data);
    // Wait for the next page to load
    flag = await getNextButton(page)
  }
  // Save data to a JSON file
  fs.writeFileSync('clinic.json', JSON.stringify(clinicInfo, null, 2));
  await browser.close();
}

pageDataCollecting() 

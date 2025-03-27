// importing libraries
const puppeteer = require('puppeteer');
const fs = require('fs');

// Use set environment browser if set, if not use puppeteer chromium
const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || puppeteer.executablePath();

/**
 * Checks for the "next" button on the page and clicks it if enabled.
 *
 * @param page the puppeteer page.
 * @returns returns true if next page exists and is clicked, false otherwise.
 */
async function getNextButton(page) {
  const nextButton = await page.$('.paginate_button.next:not(.disabled)');
  if (nextButton) {
    await page.click('.paginate_button.next');
    await page.waitForSelector('.c-table tbody tr');
    return true;
  }
  return false;
}

/**
 * Retrieves the coordinates for a given query using openstreetmap.
 * I decided to use openstreetmap because it does not require an api key.
 *
 * @param query the search query string.
 * @returns returns an object containing latitude and longitude.
 */
async function getCoordinates(query) {

  
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`;
  // openstreetmap requires a 1 second delay between requests
  await new Promise(res => setTimeout(res, 1000));

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'clinicScraper/1.0 (your-email@example.com)'
      }
    });
    const data = await response.json();
    if (data && data.length > 0) {
      return { 
        latitude: data[0].lat, 
        longitude: data[0].lon 
      };
    }
  } catch (error) {
    console.error(`error fetching coordinates for "${query}":`, error);
  }
  return { latitude: null, longitude: null };
}

/**
 * Scrapes clinic data from the website, gets it's cordinates
 * and writes the data to a json file.
 */
async function pageDataCollecting() {
  console.log("------------------------------------------------------------------");
  console.log("THIS WILL BE VERY SLOW (about 3-6 min)");
  console.log("------------------------------------------------------------------");


  const browser = await puppeteer.launch({ executablePath });
  const page = await browser.newPage();
  
  let clinicInfo = [];
  let flag = true; // With this flag we control pagination
  const url = "https://www.saskhealthauthority.ca/your-health/conditions-illnesses-services-wellness/all-z/immunizations/immunizations-services-and-locations";

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
    flag = await getNextButton(page);
  }
  
  let successCounter = 0
  // fetch coords for each clinic
  for (let i = 0; i < clinicInfo.length; i++, successCounter++) {
    const clinic = clinicInfo[i];
    console.log("Searching cordinates for: ", clinic.name)

    // search for address + serviceArea + "Saskatchewan"
    const fullQuery = `${clinic.address} ${clinic.serviceArea} Saskatchewan`;
    let coords = await getCoordinates(fullQuery);

    // if that search fails just look for the serviceArea + "Saskatchewan"
    if (coords.latitude === null || coords.longitude === null) {
      const fallbackQuery = `${clinic.serviceArea} Saskatchewan`;
      coords = await getCoordinates(fallbackQuery);
    }
    // if it works save the cords
    if (coords.latitude !== null && coords.longitude !== null) {
      clinic.latitude = parseFloat(coords.latitude);
      clinic.longitude = parseFloat(coords.longitude);
    }
    else {
      successCounter--;
    }
    
  }

  console.log(`found ${successCounter} of ${clinicInfo.length} clinic coordinates`);
  console.log("note: The app will still work if some clinic coordnates are not found");



  fs.writeFileSync('clinic.json', JSON.stringify({
    "time-created": Date.now(),
    "clinics": clinicInfo
  }, null, 2));
  
  await browser.close();
}

pageDataCollecting();
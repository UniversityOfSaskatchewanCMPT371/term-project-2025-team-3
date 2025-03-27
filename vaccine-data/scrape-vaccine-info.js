const puppeteer = require("puppeteer");
const fs = require("fs");

const vaccine = async () => {
  const url =
    "https://www.saskatchewan.ca/residents/health/accessing-health-care-services/immunization-services/when-to-get-immunized";
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle2" });

  const vaccineDataEnglish = await page.evaluate(() => {
    const data = [];
    const tables = Array.from(
      document.querySelectorAll(".compacttable tbody")
    ).slice(0, 2);

    if (!tables) return data;

    tables.forEach((table) => {
      const rows = table.querySelectorAll("tr");
      rows.forEach((row) => {
        const cells = row.querySelectorAll("td");
        const age = cells[0]?.innerText.trim();
        const vaccinesCell = cells[1];
        const entries = [];

        if (vaccinesCell) {
          let currentLink = null;

          vaccinesCell.childNodes.forEach((node) => {
            if (node.nodeName === "A") {
              if (currentLink) {
                if (currentLink.description === '') {
                  currentLink.description = currentLink.name;
                } else {
                  const match = currentLink.description.match(/\(([^)]+)\)/);
                  if (match && match[1]) {
                    currentLink.description = match[1]; // Only take what's inside the parentheses
                  }
                }
              }
              // Start a new entry when we find a link
              currentLink = {
                name: node.textContent.trim(),
                url: node.href.split("/").reverse()[3],
                description: "", // will be filled in by the following text
              };
              entries.push(currentLink);
            } else if (node.nodeName === "EM" && currentLink) {
              const desc = node.textContent.replace(/[\n\r]+/g, " ").trim();
              if (desc) {
                // Remove unwanted descriptions that match specific patterns
                if (
                  !desc.startsWith("(for") &&
                  !desc.startsWith("Influenza - recommended every year")
                ) {
                  currentLink.description +=
                    (currentLink.description ? " " : "") + desc;
                }
              }
            } else if (node.nodeName === "#text" && currentLink) {
              // If the next node is text, treat it as a description
              const desc = node.textContent.replace(/[\n\r]+/g, " ").trim();
              if (desc) {
                // Remove unwanted descriptions that match specific patterns
                if (
                  !desc.startsWith("(for") &&
                  !desc.startsWith("Influenza - recommended every year") &&
                  !desc.startsWith("for") && !desc.startsWith("-") && !desc.startsWith("(high")
                ) {
                  currentLink.description +=
                    (currentLink.description ? " " : "") + desc;
                } 
              }
            } else if (
              node.nodeName === "#text" &&
              node.textContent.trim() === "Influenza - recommended every year"
            ) {
              currentLink = {
                name: node.textContent.trim().split(" - ")[0],
                url: "",
                description: node.textContent.trim().split(" - ")[0], // use the same text as the description
              };
              entries.push(currentLink);
            }
          });
        }

        data.push({
          age,
          vaccines: entries,
        });
      });
    });

    return (
      data
        .flatMap((entry) => {
          return entry.vaccines.map((vaccine) => {
            return {
              age: entry.age,
              vaccineName: vaccine.name,
              productId: vaccine.url,
              diseases: vaccine.description,
            };
          });
        })
        // Now combine entries with the same vaccineName
        .reduce((acc, curr) => {
          // Check if the vaccineName already exists in the accumulator
          const existingEntry = acc.find(
            (entry) => entry.vaccineName === curr.vaccineName
          );

          if (existingEntry) {
            // If the productId is different and not empty, treat them as separate entries
            if (
              curr.productId &&
              curr.productId !== "" &&
              existingEntry.productId !== "" &&
              curr.productId !== existingEntry.productId
            ) {
              acc.push({
                starting: curr.age,
                vaccineName: curr.vaccineName,
                productId: curr.productId,
                associatedDiseases: {english: curr.diseases === "" ? curr.vaccineName : curr.diseases, french: []},
              });
            } else {
              // If productId is empty or matches the existing one, keep the earliest age
              existingEntry.starting =
                Math.min(parseAge(existingEntry.starting), parseAge(curr.age)) +
                " months";
              // Update productId only if it is empty
              if (!existingEntry.productId && curr.productId) {
                existingEntry.productId = curr.productId;
              }
              // Combine diseases without duplicates
            }
          } else {
            // If it doesn't exist, add it to the accumulator
            acc.push({
              starting: curr.age,
              vaccineName: curr.vaccineName,
              productId: curr.productId,
              associatedDiseases: {english: curr.diseases === "" ? [curr.vaccineName] : curr.diseases.replace("(", "").replace(")", "").replace(" & ", ", ").split(", "), french: []},
            });
          }

          return acc;
        }, [])
    );

    // Helper function to parse and compare ages as integers
    function parseAge(age) {
      const ageMatch = age.match(/(\d+)/);
      return ageMatch ? parseInt(ageMatch[0]) : 0;
    }
  });

  console.log(vaccineDataEnglish);

  const output = {
    timestamp: Math.floor(Date.now() / 1000),
    vaccines: vaccineDataEnglish.map((vaccine) => {
      return {
        ...vaccine,
        productId: isNaN(vaccine.productId) ? vaccine.productId : Number(vaccine.productId)
      }
    }),
  };

  fs.writeFileSync("vaccineData.json", JSON.stringify(output, null, 2));
  console.log("Data saved to vaccineData.json");

  await browser.close();
};

vaccine();

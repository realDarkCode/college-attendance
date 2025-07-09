const puppeteer = require("puppeteer");
const fs = require('fs').promises;
const path = require('path');

const credentialsFilePath = path.join(
  process.cwd(),
  "data",
  "credentials.json"
);

const statusFilePath = path.join(process.cwd(), 'data', 'scrape-status.json');

const readCredentials = async () => {
  try {
    await fs.access(credentialsFilePath);
    const fileContent = await fs.readFile(credentialsFilePath, "utf-8");
    return JSON.parse(fileContent);
  } catch (error) {
    throw new Error("Credentials file not found or is unreadable.");
  }
};

const updateStatus = async (message, progress) => {
  try {
    await fs.writeFile(statusFilePath, JSON.stringify({ message, progress, timestamp: new Date().toISOString() }));
  } catch (error) {
    console.error('Failed to write status:', error);
  }
};

async function scrapeAttendance() {
  await updateStatus('Initializing scraper...', 0);

  let credentials;
  try {
    credentials = await readCredentials();
    if (!credentials.username || !credentials.password) {
      console.error("Username or password is not set in credentials.json.");
      await updateStatus('Error: Credentials not set. Please update them in Settings.', -1);
      return;
    }
  } catch (error) {
    console.error("Could not read credentials file.", error);
    await updateStatus('Error: Credentials file not found. Please set them in Settings.', -1);
    return;
  }

  let browser;
  try {
    console.log("Launching browser...");
    await updateStatus('Launching browser...', 10);
    browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    console.log("Navigating to login page...");
    await updateStatus('Navigating to login page...', 25);
    await page.goto("https://ac.ncpsc.edu.bd/index.php", { waitUntil: "networkidle2" });

    console.log("Entering credentials...");
    await page.type("#content > div.contentright1 > form > table > tbody > tr:nth-child(3) > td:nth-child(2) > input", credentials.username);
    await page.type("#content > div.contentright1 > form > table > tbody > tr:nth-child(4) > td:nth-child(2) > input", credentials.password);

    console.log("Clicking login button...");
    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle2" }),
      page.click("#content > div.contentright1 > form > table > tbody > tr:nth-child(5) > td:nth-child(2) > input.button"),
    ]);

    console.log("Login successful!");
    await updateStatus('Login successful', 40);

    console.log("Navigating to attendance page...");
    await updateStatus('Navigating to attendance page...', 60);
    await page.goto("https://ac.ncpsc.edu.bd/index.php/attendance", { waitUntil: "networkidle2" });

    console.log("Scraping attendance data...");
    await updateStatus('Scraping attendance data...', 75);
    const attendanceData = await page.evaluate(() => {
      const workingDays = document.querySelector("#content > div.contentright1 > div > table.list_table > tbody > tr:nth-child(2) > td:nth-child(1)")?.innerText.trim();
      const present = document.querySelector("#content > div.contentright1 > div > table.list_table > tbody > tr:nth-child(2) > td:nth-child(2)")?.innerText.trim();
      const absent = document.querySelector("#content > div.contentright1 > div > table.list_table > tbody > tr:nth-child(2) > td:nth-child(4)")?.innerText.trim();
      const leave = document.querySelector("#content > div.contentright1 > div > table.list_table > tbody > tr:nth-child(2) > td:nth-child(3)")?.innerText.trim();
      const name = document.querySelector("#content > div.contentright1 > div > table.profile > tbody > tr:nth-child(1) > td:nth-child(3) > b")?.innerText.trim();
      return {
        name,
        data: {
          workingDays: parseInt(workingDays, 10) || 0,
          present: parseInt(present, 10) || 0,
          absent: parseInt(absent, 10) || 0,
          leave: parseInt(leave, 10) || 0,
        },
      };
    });

    console.log("Scraping complete!");
    await updateStatus('Scraping complete!', 100);
    return {
      date: new Date().toISOString().split("T")[0],
      ...attendanceData,
    };
  } catch (error) {
    console.error("An error occurred during scraping:", error);
    if (browser) {
      const page = (await browser.pages())[0];
      if(page) await page.screenshot({ path: "error_screenshot.png" });
    }
    await updateStatus(`Error: Scraping failed. Check console for details.`, -1);
    throw new Error("Failed to scrape attendance data.");
  } finally {
    if (browser) {
      console.log("Closing browser...");
      await browser.close();
    }
  }
}

module.exports = { scrapeAttendance };

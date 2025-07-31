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
      const errorMsg = 'Credentials not set. Please update them in Settings.';
      await updateStatus(`Error: ${errorMsg}`, -1);
      return { error: errorMsg };
    }
  } catch (error) {
    console.error("Could not read credentials file.", error);
    const errorMsg = 'Credentials file not found. Please set them in Settings.';
    await updateStatus(`Error: ${errorMsg}`, -1);
    return { error: errorMsg };
  }

  let browser;
  try {
    console.log("Launching browser...");
    await updateStatus('Launching browser...', 10);
    browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    console.log("Navigating to login page...");
    await updateStatus('Navigating to login page...', 25);
    
    try {
      await page.goto("https://ac.ncpsc.edu.bd/index.php", { waitUntil: "networkidle2", timeout: 30000 });
    } catch (navigationError) {
      console.error("Failed to navigate to login page:", navigationError);
      const errorMsg = 'Unable to reach the website. Check your internet connection.';
      await updateStatus(`Error: ${errorMsg}`, -1);
      return { error: errorMsg };
    }

    console.log("Entering credentials...");
    await page.type("#content > div.contentright1 > form > table > tbody > tr:nth-child(3) > td:nth-child(2) > input", credentials.username);
    await page.type("#content > div.contentright1 > form > table > tbody > tr:nth-child(4) > td:nth-child(2) > input", credentials.password);

    console.log("Clicking login button...");
    try {
      await Promise.all([
        page.waitForNavigation({ waitUntil: "networkidle2", timeout: 30000 }),
        page.click("#content > div.contentright1 > form > table > tbody > tr:nth-child(5) > td:nth-child(2) > input.button"),
      ]);
    } catch (loginError) {
      console.error("Login failed:", loginError);
      const errorMsg = 'Login failed. Please check your credentials.';
      await updateStatus(`Error: ${errorMsg}`, -1);
      return { error: errorMsg };
    }

    // Check if login was successful by looking for error messages or redirect
    const currentUrl = page.url();
    if (currentUrl.includes('login') || currentUrl.includes('error')) {
      console.error("Login failed - still on login page or error page");
      const errorMsg = 'Invalid credentials. Please check your username and password.';
      await updateStatus(`Error: ${errorMsg}`, -1);
      return { error: errorMsg };
    }

    console.log("Login successful!");
    await updateStatus('Login successful', 40);

    console.log("Navigating to attendance page...");
    await updateStatus('Navigating to attendance page...', 60);
    
    try {
      await page.goto("https://ac.ncpsc.edu.bd/index.php/attendance", { waitUntil: "networkidle2", timeout: 30000 });
    } catch (attendancePageError) {
      console.error("Failed to navigate to attendance page:", attendancePageError);
      const errorMsg = 'Unable to access attendance page.';
      await updateStatus(`Error: ${errorMsg}`, -1);
      return { error: errorMsg };
    }

    console.log("Scraping attendance data...");
    await updateStatus('Scraping attendance data...', 75);
    const attendanceData = await page.evaluate(() => {
      const workingDays = document.querySelector("#content > div.contentright1 > div > table.list_table > tbody > tr:nth-child(2) > td:nth-child(1)")?.innerText.trim();
      const present = document.querySelector("#content > div.contentright1 > div > table.list_table > tbody > tr:nth-child(2) > td:nth-child(2)")?.innerText.trim();
      const absent = document.querySelector("#content > div.contentright1 > div > table.list_table > tbody > tr:nth-child(2) > td:nth-child(4)")?.innerText.trim();
      const leave = document.querySelector("#content > div.contentright1 > div > table.list_table > tbody > tr:nth-child(2) > td:nth-child(3)")?.innerText.trim();
      const name = document.querySelector("#content > div.contentright1 > div > table.profile > tbody > tr:nth-child(1) > td:nth-child(3) > b")?.innerText.trim();
      
      // Check if any of the required elements are missing
      if (!workingDays || !present || !absent || !leave) {
        return null;
      }
      
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

    if (!attendanceData) {
      console.error("Failed to scrape attendance data - elements not found");
      const errorMsg = 'Unable to extract attendance data. Website structure may have changed.';
      await updateStatus(`Error: ${errorMsg}`, -1);
      return { error: errorMsg };
    }

    console.log("Scraping complete!");
    await updateStatus('Scraping complete!', 100);
    // Get the current date in the user's local timezone (+06:00)
    const now = new Date();
    const options = {
      timeZone: 'Asia/Dhaka', // Corresponds to +06:00 timezone
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    };
    // 'en-CA' locale formats the date as YYYY-MM-DD, which is what we need.
    const dateString = new Intl.DateTimeFormat('en-CA', options).format(now);

    console.log(`Scraped data for local date: ${dateString}`);

    return {
      date: dateString,
      ...attendanceData,
    };
  } catch (error) {
    console.error("An error occurred during scraping:", error);
    if (browser) {
      const page = (await browser.pages())[0];
      if(page) await page.screenshot({ path: "error_screenshot.png" });
    }
    
    // Determine error type and provide appropriate message
    let errorMessage = 'An unexpected error occurred during scraping.';
    if (error.message.includes('timeout') || error.message.includes('net::')) {
      errorMessage = 'Network timeout or connection issue.';
    } else if (error.message.includes('Cannot read properties') || error.message.includes('querySelector')) {
      errorMessage = 'Website structure changed or page not loaded correctly.';
    }
    
    await updateStatus(`Error: ${errorMessage}`, -1);
    return { error: errorMessage };
  } finally {
    if (browser) {
      console.log("Closing browser...");
      await browser.close();
    }
  }
}

module.exports = { scrapeAttendance };

import fs from "fs/promises";
import path from "path";
import { scrapeAttendance } from "../../lib/scraper";
import { readAttendanceData, writeAttendanceData } from "../../lib/serverUtils";
import { getDayStatusFromData, getTodayDateString } from "../../lib/utils";

// Define the path for the data file - keeping for directory creation
const dataFilePath = path.join(process.cwd(), "data", "attendance.json");

// Helper function to ensure the data directory exists
async function ensureDirectoryExists(filePath) {
  const dirname = path.dirname(filePath);
  try {
    await fs.stat(dirname);
  } catch (err) {
    if (err.code === "ENOENT") {
      await fs.mkdir(dirname, { recursive: true });
    }
  }
}

export default async function handler(req, res) {
  // Ensure this is a POST request
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    console.log("API: Starting scrape process...");
    const scrapedData = await scrapeAttendance();

    // Handle error cases - either null return or error object
    if (!scrapedData || scrapedData.error) {
      console.log(
        "API: Scraping failed:",
        scrapedData?.error || "Unknown error"
      );

      // Get the current date for error entry
      const dateString = getTodayDateString();

      await ensureDirectoryExists(dataFilePath);

      // Read existing data
      let allData = await readAttendanceData();

      // Create error entry with specific error message
      const errorEntry = {
        date: dateString,
        name: null,
        data: null,
        dayStatus: "Error",
        fetchedAt: new Date().toISOString(),
        error: scrapedData?.error || "Unknown scraping error",
      };

      // Add or update error entry
      const existingEntryIndex = allData.findIndex(
        (entry) => entry.date === dateString
      );

      if (existingEntryIndex !== -1) {
        allData[existingEntryIndex] = errorEntry;
        console.log(`API: Updated error entry for date: ${dateString}`);
      } else {
        allData.push(errorEntry);
        console.log(`API: Added new error entry for date: ${dateString}`);
      }

      // Write updated data back to file
      await writeAttendanceData(allData);
      return res.status(500).json({
        success: false,
        message: `Scraping failed: ${scrapedData?.error || "Unknown error"}`,
        data: errorEntry,
      });
    }

    console.log("API: Scrape process completed.");

    // Validate scraped data structure
    if (!scrapedData.data || typeof scrapedData.data !== "object") {
      throw new Error(
        "Invalid scraped data structure - missing or invalid data object"
      );
    }

    await ensureDirectoryExists(dataFilePath);

    // Read existing data using utility
    let allData = await readAttendanceData();

    // Determine the day status using utility function
    let dayStatus = "No Change";
    if (!scrapedData.dayStatus) {
      // If dayStatus wasn't set by scraper (e.g., notifications disabled), calculate it
      dayStatus = getDayStatusFromData(scrapedData, allData);
    } else {
      // Use the dayStatus from scraper
      dayStatus = scrapedData.dayStatus;
    }

    // Add the calculated status to the scraped data
    scrapedData.dayStatus = dayStatus;
    scrapedData.fetchedAt = new Date().toISOString();

    // Add new data or update if an entry for the same date already exists
    const existingEntryIndex = allData.findIndex(
      (entry) => entry.date === scrapedData.date
    );

    if (existingEntryIndex !== -1) {
      // Update existing entry
      allData[existingEntryIndex] = scrapedData;
      console.log(
        `API: Updated data for date: ${scrapedData.date} with status: ${dayStatus}`
      );
    } else {
      // Add new entry
      allData.push(scrapedData);
      console.log(
        `API: Added new data for date: ${scrapedData.date} with status: ${dayStatus}`
      );
    }

    // Write the updated data back to the file using utility
    await writeAttendanceData(allData);
    console.log("API: Data successfully saved to", dataFilePath);

    res.status(200).json({
      success: true,
      message: "Scraping successful!",
      data: scrapedData,
    });
  } catch (error) {
    console.error("API: An error occurred in the scrape handler:", error);
    res.status(500).json({
      success: false,
      message: "Scraping failed.",
      error: error.message,
    });
  }
}

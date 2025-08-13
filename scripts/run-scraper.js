const fs = require("fs");
const path = require("path");
const { scrapeAttendance } = require("../lib/scraper");
const {
  getDayStatusFromData,
  getTodayDateString,
} = require("../lib/serverUtils");

// Convert async utility functions to sync for this script
const readAttendanceDataSync = () => {
  const attendanceFilePath = path.join(
    __dirname,
    "..",
    "data",
    "attendance.json"
  );
  if (!fs.existsSync(attendanceFilePath)) {
    return [];
  }
  const fileContent = fs.readFileSync(attendanceFilePath, "utf-8");
  return JSON.parse(fileContent);
};

const writeAttendanceDataSync = (data) => {
  const attendanceFilePath = path.join(
    __dirname,
    "..",
    "data",
    "attendance.json"
  );
  fs.writeFileSync(attendanceFilePath, JSON.stringify(data, null, 2));
};

const wasScrapedTodaySync = () => {
  const attendance = readAttendanceDataSync();
  const todayStr = getTodayDateString();
  return attendance.some((entry) => entry.date === todayStr);
};

const getDayStatus = (newData, previousData) => {
  if (!previousData) return "No Change"; // First entry
  if (newData.present > previousData.present) return "Present";
  if (newData.absent > previousData.absent) return "Absent";
  if (newData.leave > previousData.leave) return "Leave";
  return "No Change";
};

// --- Main Execution Logic ---

const run = async () => {
  console.log(
    new Date().toLocaleDateString(),
    "Checking if scraping is needed for today..."
  );

  if (wasScrapedTodaySync()) {
    console.log(
      new Date().toLocaleDateString(),
      "Already scraped today. Exiting."
    );
    return;
  }

  console.log(
    new Date().toLocaleDateString(),
    "Scraping not found for today. Starting scraper..."
  );
  try {
    const scrapedData = await scrapeAttendance();
    if (!scrapedData) {
      console.error(
        new Date().toLocaleDateString(),
        "Scraper returned no data. Exiting."
      );
      return;
    }

    const attendance = readAttendanceDataSync();

    // Use the utility function to determine day status if not already set
    let dayStatus;
    if (scrapedData.dayStatus) {
      dayStatus = scrapedData.dayStatus;
    } else {
      dayStatus = getDayStatusFromData(scrapedData, attendance);
    }

    // Use the date returned from the scraper to ensure consistency
    const newEntry = {
      date: scrapedData.date, // Use the timezone-correct date from the scraper
      name: scrapedData.name,
      data: scrapedData.data,
      dayStatus: dayStatus,
      fetchedAt: new Date().toISOString(), // UTC timestamp for when it was fetched
      notificationSent: scrapedData.notificationSent || false,
      notificationSentAt: scrapedData.notificationSentAt || null,
    };

    attendance.push(newEntry);
    writeAttendanceDataSync(attendance);

    console.log(
      new Date().toLocaleDateString(),
      "Successfully scraped attendance data and saved it."
    );
  } catch (error) {
    console.error(
      new Date().toLocaleDateString(),
      "An error occurred during scraping:",
      error
    );
  }
};

run();

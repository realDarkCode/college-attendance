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
  
  try {
    if (!fs.existsSync(attendanceFilePath)) {
      return [];
    }
    
    const fileContent = fs.readFileSync(attendanceFilePath, "utf-8");
    
    // Check if file is empty or just whitespace
    if (!fileContent.trim()) {
      console.log("Attendance file is empty, returning empty array");
      return [];
    }
    
    const data = JSON.parse(fileContent);
    
    // Ensure data is an array
    if (!Array.isArray(data)) {
      console.log("Attendance data is not an array, returning empty array");
      return [];
    }
    
    return data;
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.log("Invalid JSON in attendance file, returning empty array");
      return [];
    }
    console.error("Error reading attendance data:", error);
    return [];
  }
};

const writeAttendanceDataSync = (data) => {
  const attendanceFilePath = path.join(
    __dirname,
    "..",
    "data",
    "attendance.json"
  );
  
  try {
    // Ensure data directory exists
    const dataDir = path.dirname(attendanceFilePath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // Ensure data is an array
    const dataToWrite = Array.isArray(data) ? data : [];
    
    fs.writeFileSync(attendanceFilePath, JSON.stringify(dataToWrite, null, 2));
  } catch (error) {
    console.error("Error writing attendance data:", error);
    throw error;
  }
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
    new Date().toLocaleTimeString(),
    "Running attendance scraper..."
  );

  // Check if already scraped today, but continue anyway for auto-service
  if (wasScrapedTodaySync()) {
    console.log(
      new Date().toLocaleDateString(),
      new Date().toLocaleTimeString(), 
      "Already scraped today, but running again to check for updates..."
    );
  }

  console.log(
    new Date().toLocaleDateString(),
    new Date().toLocaleTimeString(),
    "Starting scraper..."
  );
  try {
    const scrapedData = await scrapeAttendance();
    if (!scrapedData) {
      console.error(
        new Date().toLocaleDateString(),
        new Date().toLocaleTimeString(),
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

    // Check if today's data already exists
    const todayStr = scrapedData.date;
    const existingEntry = attendance.find(entry => entry.date === todayStr);
    
    if (existingEntry) {
      // Update existing entry instead of adding duplicate
      console.log(
        new Date().toLocaleDateString(),
        new Date().toLocaleTimeString(),
        "Updating existing entry for today..."
      );
      
      existingEntry.data = scrapedData.data;
      existingEntry.dayStatus = dayStatus;
      existingEntry.fetchedAt = new Date().toISOString();
      existingEntry.notificationSent = scrapedData.notificationSent || false;
      existingEntry.notificationSentAt = scrapedData.notificationSentAt || null;
      
      writeAttendanceDataSync(attendance);
    } else {
      // Add new entry
      const newEntry = {
        date: scrapedData.date,
        name: scrapedData.name,
        data: scrapedData.data,
        dayStatus: dayStatus,
        fetchedAt: new Date().toISOString(),
        notificationSent: scrapedData.notificationSent || false,
        notificationSentAt: scrapedData.notificationSentAt || null,
      };

      attendance.push(newEntry);
      writeAttendanceDataSync(attendance);
    }

    console.log(
      new Date().toLocaleDateString(),
      new Date().toLocaleTimeString(),
      "Successfully scraped attendance data and saved it."
    );
  } catch (error) {
    console.error(
      new Date().toLocaleDateString(),
      new Date().toLocaleTimeString(),
      "An error occurred during scraping:",
      error
    );
  }
};

run();

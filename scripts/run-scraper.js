const fs = require("fs");
const path = require("path");
const { scrapeAttendance } = require("../lib/scraper");

const attendanceFilePath = path.join(
  __dirname,
  "..",
  "data",
  "attendance.json"
);

// --- Helper Functions (from API routes) ---

const readAttendanceData = () => {
  if (!fs.existsSync(attendanceFilePath)) {
    return [];
  }
  const fileContent = fs.readFileSync(attendanceFilePath, "utf-8");
  return JSON.parse(fileContent);
};

const writeAttendanceData = (data) => {
  fs.writeFileSync(attendanceFilePath, JSON.stringify(data, null, 2));
};

const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const wasScrapedToday = () => {
  const attendance = readAttendanceData();
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

  if (wasScrapedToday()) {
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

    const attendance = readAttendanceData();
    const previousEntry =
      attendance.length > 0 ? attendance[attendance.length - 1] : null;

    const newEntry = {
      date: getTodayDateString(),
      name: scrapedData.name,
      data: scrapedData.data,
      dayStatus: getDayStatus(
        scrapedData.data,
        previousEntry ? previousEntry.data : null
      ),
      fetchedAt: new Date().toISOString(),
    };

    attendance.push(newEntry);
    writeAttendanceData(attendance);

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

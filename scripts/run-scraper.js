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
  // Use the same timezone-aware logic as the main scraper
  const now = new Date();
  const options = {
    timeZone: 'Asia/Dhaka', // Corresponds to +06:00 timezone
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  };
  // 'en-CA' locale formats the date as YYYY-MM-DD
  return new Intl.DateTimeFormat('en-CA', options).format(now);
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

    // Use the date returned from the scraper to ensure consistency
    const newEntry = {
      date: scrapedData.date, // Use the timezone-correct date from the scraper
      name: scrapedData.name,
      data: scrapedData.data,
      dayStatus: getDayStatus(
        scrapedData.data,
        previousEntry ? previousEntry.data : null
      ),
      fetchedAt: new Date().toISOString(), // UTC timestamp for when it was fetched
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

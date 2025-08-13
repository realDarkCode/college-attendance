const fs = require("fs").promises;
const path = require("path");

// Client-side utility functions that don't require server modules (CommonJS versions)
const getTodayDateString = () => {
  // Use Bangladesh timezone (+06:00)
  const now = new Date();
  const options = {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  };
  // 'en-CA' locale formats the date as YYYY-MM-DD
  return new Intl.DateTimeFormat("en-CA", options).format(now);
};

const getDayStatusFromData = (scrapedData, allData) => {
  // Sort data by date to ensure it's in chronological order
  const sortedData = [...allData].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  // Find the last entry that is NOT from the same day as the current scrape
  const previousDayEntries = sortedData.filter(
    (entry) => entry.date < scrapedData.date
  );
  const previousEntry =
    previousDayEntries.length > 0
      ? previousDayEntries[previousDayEntries.length - 1]
      : null;

  // Determine the status for the current day by comparing with the previous day
  let dayStatus = "No Change"; // Default to 'No Change'

  if (previousEntry && previousEntry.data) {
    // Prioritize checking for absence or leave first
    if (scrapedData.data.absent > previousEntry.data.absent) {
      dayStatus = "Absent";
    } else if (scrapedData.data.leave > previousEntry.data.leave) {
      dayStatus = "Leave";
    } else if (scrapedData.data.present > previousEntry.data.present) {
      dayStatus = "Present";
    }
  } else {
    // This is the first ever scrape or previous entry has no data. Set a baseline status.
    if (scrapedData.data.present > 0) {
      dayStatus = "Present";
    } else if (scrapedData.data.absent > 0) {
      dayStatus = "Absent";
    } else {
      dayStatus = "Initial Data";
    }
  }

  return dayStatus;
};

// Server-side utility functions that require file system access

const getAttendanceFilePath = () => {
  return path.join(process.cwd(), "data", "attendance.json");
};

const getConfigFilePath = () => {
  return path.join(process.cwd(), "data", "config.json");
};

const readAttendanceData = async () => {
  try {
    const fileContent = await fs.readFile(getAttendanceFilePath(), "utf-8");
    return JSON.parse(fileContent);
  } catch (error) {
    if (error.code === "ENOENT") {
      return []; // Return empty array if file doesn't exist
    }
    throw error;
  }
};

const readConfigData = async () => {
  try {
    const fileContent = await fs.readFile(getConfigFilePath(), "utf-8");
    return JSON.parse(fileContent);
  } catch (error) {
    if (error.code === "ENOENT") {
      return {
        username: "",
        password: "",
        calendarOnly: false,
        notifications: true,
      };
    }
    throw error;
  }
};

const writeAttendanceData = async (data) => {
  await fs.writeFile(getAttendanceFilePath(), JSON.stringify(data, null, 2));
};

const wasScrapedToday = async () => {
  const attendance = await readAttendanceData();
  const todayStr = getTodayDateString();
  return attendance.some((entry) => entry.date === todayStr);
};

const getTodayEntry = async () => {
  const attendance = await readAttendanceData();
  const todayStr = getTodayDateString();
  return attendance.find((entry) => entry.date === todayStr);
};

const shouldSendNotification = async (newDayStatus, newData) => {
  const todayStr = getTodayDateString();
  const attendance = await readAttendanceData();
  const todayEntry = attendance.find((entry) => entry.date === todayStr);

  if (!todayEntry) {
    // First time fetching for today - always send notification
    return { should: true, reason: "First fetch for today" };
  }

  if (todayEntry.dayStatus !== newDayStatus) {
    // Status changed from previous fetch today - send notification
    return {
      should: true,
      reason: `Status changed from ${todayEntry.dayStatus} to ${newDayStatus}`,
    };
  }

  if (!todayEntry.notificationSent) {
    // Status same but notification wasn't sent before - send notification
    return { should: true, reason: "Notification wasn't sent previously" };
  }

  return {
    should: false,
    reason: "Notification already sent and status unchanged",
  };
};

const getNotificationMessageWithIcon = (dayStatus, studentName) => {
  const baseIcon = path.join(
    process.cwd(),
    "public",
    "android-chrome-192x192.png"
  );

  switch (dayStatus) {
    case "Present":
      return {
        title: "✅ Attendance Status",
        message: `You are marked PRESENT today!`,
        icon: baseIcon,
      };
    case "Absent":
      return {
        title: "❌ Attendance Alert",
        message: `You are marked ABSENT today!`,
        icon: baseIcon,
      };
    case "Leave":
      return {
        title: "🏖️ Attendance Status",
        message: `You are on LEAVE today!`,
        icon: baseIcon,
      };
    case "No Change":
      return {
        title: "📊 Attendance Status",
        message: `No attendance change detected today.`,
        icon: baseIcon,
      };
    default:
      return {
        title: "📝 Attendance Update",
        message: `Attendance data updated successfully.`,
        icon: baseIcon,
      };
  }
};

module.exports = {
  getTodayDateString,
  getDayStatusFromData,
  getAttendanceFilePath,
  getConfigFilePath,
  readAttendanceData,
  readConfigData,
  writeAttendanceData,
  wasScrapedToday,
  getTodayEntry,
  shouldSendNotification,
  getNotificationMessageWithIcon,
};

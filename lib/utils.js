import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Client-side utility functions that don't require server modules

export const getTodayDateString = () => {
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

export const getDayStatusFromData = (scrapedData, allData) => {
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

export const getNotificationMessage = (dayStatus, studentName) => {
  switch (dayStatus) {
    case "Present":
      return {
        title: "✅ Attendance Status",
        message: `You are marked PRESENT today!`,
      };
    case "Absent":
      return {
        title: "❌ Attendance Alert",
        message: `You are marked ABSENT today!`,
      };
    case "Leave":
      return {
        title: "🏖️ Attendance Status",
        message: `You are on LEAVE today!`,
      };
    case "No Change":
      return {
        title: "📊 Attendance Status",
        message: `No attendance change detected today.`,
      };
    default:
      return {
        title: "📝 Attendance Update",
        message: `Attendance data updated successfully.`,
      };
  }
};

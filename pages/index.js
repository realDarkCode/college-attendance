import { useState, useEffect, useRef } from "react";
import Calendar from "../components/Calendar";
import Link from "next/link";
import MonthlyStats from "../components/MonthlyStats";

// A new component for displaying the loading progress
const LoadingIndicator = ({ progress, message }) => (
  <div className="w-full bg-gray-800 p-6 rounded-lg shadow-lg my-8">
    <h3 className="text-xl font-semibold text-cyan-400 mb-4">
      Scraping in Progress...
    </h3>
    <p className="text-gray-400 mb-2">{message}</p>
    <div className="w-full bg-gray-700 rounded-full h-4">
      <div
        className="bg-cyan-500 h-4 rounded-full transition-all duration-500 ease-out"
        style={{ width: `${progress}%` }}
      ></div>
    </div>
    {progress > 0 && (
      <p className="text-right text-sm font-mono mt-1">{progress}%</p>
    )}
  </div>
);

export default function Home() {
  const [attendance, setAttendance] = useState([]);
  const [isScrapedToday, setIsScrapedToday] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [studentName, setStudentName] = useState("");

  // New state for scraping progress
  const [isScraping, setIsScraping] = useState(false);
  const [scrapeProgress, setScrapeProgress] = useState(0);
  const [scrapeMessage, setScrapeMessage] = useState("");
  const [uiMessage, setUiMessage] = useState({ text: "", type: "" }); // To show persistent messages

  const pollingInterval = useRef(null);

  useEffect(() => {
    fetchAttendance();
    fetchStatus();
    // Cleanup interval on unmount
    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, []);

  const fetchAttendance = async () => {
    try {
      const res = await fetch("/api/attendance");
      const data = await res.json();
      setAttendance(data);
      if (data.length > 0) {
        setStudentName(data[data.length - 1].name);
      }
    } catch (error) {
      console.error("Failed to fetch attendance", error);
    }
  };

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/status");
      const data = await res.json();
      setIsScrapedToday(data.isScrapedToday);
    } catch (error) {
      console.error("Failed to fetch status", error);
    }
  };

  const pollScrapeStatus = async () => {
    try {
      const res = await fetch("/api/scrape-status");
      const data = await res.json();

      setScrapeMessage(data.message);
      setScrapeProgress(data.progress);

      // Stop polling if complete or failed
      // Stop polling if complete or failed
      if (data.progress >= 100) {
        clearInterval(pollingInterval.current);
        pollingInterval.current = null;
        setIsScraping(false);
        setUiMessage({ text: "Scraping successful!", type: "success" });
        setTimeout(() => setUiMessage({ text: "", type: "" }), 5000); // Clear after 5s
        fetchAttendance();
        fetchStatus();
      } else if (data.progress < 0) {
        clearInterval(pollingInterval.current);
        pollingInterval.current = null;
        setIsScraping(false);
        setUiMessage({ text: data.message, type: "error" });
      }
    } catch (error) {
      console.error("Polling error:", error);
      const errorMsg = "Error: Could not get scrape status.";
      setScrapeMessage(errorMsg);
      setUiMessage({ text: errorMsg, type: "error" });
      setIsScraping(false);
      clearInterval(pollingInterval.current);
    }
  };

  const handleScrape = async () => {
    setIsScraping(true);
    setScrapeMessage("Initializing...");
    setScrapeProgress(0);

    // Start polling immediately
    pollingInterval.current = setInterval(pollScrapeStatus, 1000);

    // Clear previous messages and trigger the scrape API
    setUiMessage({ text: "", type: "" });
    try {
      await fetch("/api/scrape", { method: "POST" });
    } catch (error) {
      console.error("Scraping trigger error:", error);
      const errorMsg = "Error: Failed to start scraper.";
      setScrapeMessage(errorMsg);
      setUiMessage({ text: errorMsg, type: "error" });
      setIsScraping(false);
      clearInterval(pollingInterval.current);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-cyan-400">
                College Attendance Tracker
              </h1>
              {studentName && (
                <p className="text-lg text-gray-400 mt-4">
                  Student: {studentName}
                </p>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p
                  className={`text-sm ${
                    isScrapedToday ? "text-green-400" : "text-yellow-400"
                  }`}
                >
                  {isScrapedToday
                    ? "✔ Scraped for today"
                    : "❗ Needs scraping for today"}
                </p>
              </div>
              <Link
                href="/settings"
                className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md transition-colors"
              >
                Settings
              </Link>
            </div>
          </div>
        </header>

        {uiMessage.text && (
          <div
            className={`p-4 mb-6 text-sm rounded-lg flex justify-between items-center ${
              uiMessage.type === "error"
                ? "bg-red-900/50 text-red-300"
                : "bg-green-900/50 text-green-300"
            }`}
          >
            <span>{uiMessage.text}</span>
            {uiMessage.text.includes("Credentials") && (
              <Link
                href="/settings"
                className="font-bold underline hover:text-cyan-400 ml-4"
              >
                Go to Settings
              </Link>
            )}
          </div>
        )}

        {isScraping && (
          <LoadingIndicator progress={scrapeProgress} message={scrapeMessage} />
        )}

        <MonthlyStats attendanceData={attendance} currentDate={currentDate} />

        <div className="relative bg-gray-800 p-6 rounded-lg shadow-lg mt-8">
          <div className="flex justify-end">
            <button
              onClick={handleScrape}
              disabled={isScraping}
              className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              {isScraping ? "Scraping..." : "Fetch Latest Attendance"}
            </button>
          </div>
          <Calendar
            attendanceData={attendance}
            currentDate={currentDate}
            setCurrentDate={setCurrentDate}
          />
        </div>
      </div>
    </div>
  );
}

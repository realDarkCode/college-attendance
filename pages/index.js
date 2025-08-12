import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Head from "next/head";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Calendar from "../components/Calendar";
import MonthlyStats from "../components/MonthlyStats";

// A new component for displaying the loading progress
const LoadingIndicator = ({ progress, message }) => (
  <Card className="w-full my-8">
    <CardHeader>
      <CardTitle>Scraping in Progress...</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-muted-foreground mb-2">{message}</p>
      <div className="w-full bg-muted rounded-full h-4">
        <div
          className="bg-primary h-4 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      {progress > 0 && (
        <p className="text-right text-sm font-mono mt-1">{progress}%</p>
      )}
    </CardContent>
  </Card>
);

export default function Home() {
  const [attendance, setAttendance] = useState([]);
  const [isScrapedToday, setIsScrapedToday] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [studentName, setStudentName] = useState("");
  const [holidays, setHolidays] = useState([]);

  // New state for scraping progress
  const [isScraping, setIsScraping] = useState(false);
  const [scrapeProgress, setScrapeProgress] = useState(0);
  const [scrapeMessage, setScrapeMessage] = useState("");
  const [uiMessage, setUiMessage] = useState({ text: "", type: "" }); // To show persistent messages
  const [lastFetched, setLastFetched] = useState(null);
  const [timeNow, setTimeNow] = useState(Date.now());
  const [autoFetchAttempted, setAutoFetchAttempted] = useState(false);

  const pollingInterval = useRef(null);

  const shouldAutoFetch = (lastFetchTime) => {
    if (!lastFetchTime) return true;

    const lastFetch = new Date(lastFetchTime);
    const now = new Date();

    // If it's the same day and before 10 AM, and last fetch was before today 10 AM
    if (
      now.getDate() === lastFetch.getDate() &&
      now.getMonth() === lastFetch.getMonth() &&
      now.getFullYear() === lastFetch.getFullYear()
    ) {
      return now.getHours() >= 10 && lastFetch.getHours() < 10;
    }

    // If it's a new day and it's after 10 AM
    return now.getHours() >= 10;
  };

  useEffect(() => {
    const interval = setInterval(() => setTimeNow(Date.now()), 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  // Auto-fetch when conditions are met
  useEffect(() => {
    if (lastFetched && !isScraping && !autoFetchAttempted) {
      if (shouldAutoFetch(lastFetched)) {
        console.log("Auto-fetching attendance data...");
        handleScrape();
      }
      setAutoFetchAttempted(true);
    }
  }, [lastFetched, isScraping, autoFetchAttempted]);

  // Initial data fetch
  useEffect(() => {
    const fetchInitialData = async () => {
      await fetchAttendance();
      await fetchStatus();
      await fetchHolidays();

      // After initial data is loaded, check if we need to auto-fetch
      if (
        lastFetched &&
        shouldAutoFetch(lastFetched) &&
        !isScraping &&
        !autoFetchAttempted
      ) {
        console.log("Initial auto-fetch triggered");
        handleScrape();
        setAutoFetchAttempted(true);
      }
    };

    fetchInitialData();

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
        const latestEntry = data[data.length - 1];
        setStudentName(latestEntry.name);
        if (latestEntry.fetchedAt) {
          setLastFetched(latestEntry.fetchedAt);
        }
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

  const fetchHolidays = async () => {
    try {
      const res = await fetch("/api/holidays");
      if (!res.ok) throw new Error("Failed to fetch holidays");
      const data = await res.json();
      setHolidays(data);
    } catch (error) {
      console.error("Failed to fetch holidays", error);
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

  const formatRelativeTime = (isoString, now) => {
    if (!isoString) return { text: "Never fetched", color: "text-red-400" };

    const date = new Date(isoString);
    const diffInSeconds = Math.floor((now - date) / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);

    let text, color;

    // Determine the time text
    if (diffInSeconds < 60) {
      text = `${diffInSeconds} second${diffInSeconds !== 1 ? "s" : ""} ago`;
    } else if (diffInMinutes < 60) {
      text = `${diffInMinutes} minute${diffInMinutes !== 1 ? "s" : ""} ago`;
    } else if (diffInHours < 24) {
      text = `${diffInHours} hour${diffInHours !== 1 ? "s" : ""} ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      text = `${diffInDays} day${diffInDays !== 1 ? "s" : ""} ago`;
    }

    // Determine the color based on time passed
    if (diffInHours <= 2) {
      color = "text-success"; // Green for recent (0-2 hours)
    } else if (diffInHours <= 4) {
      color = "text-warning"; // Yellow for somewhat old (2-4 hours)
    } else if (diffInHours <= 8) {
      color = "text-orange-400"; // orange for somewhat old (4-8 hours)
    } else {
      color = "text-destructive"; // Light red for old (>8 hours)
    }

    return { text, color };
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
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 md:p-8 font-sans overflow-x-hidden">
      <Head>
        <title>College Attendance Tracker</title>
      </Head>
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div>
              <h1 className="text-4xl font-bold">
                <span className="text-primary">Attendance</span> Tracker
              </h1>
              {studentName && (
                <p className="text-lg text-muted-foreground mt-4">
                  Student Name:{" "}
                  <span className="text-foreground">{studentName}</span>
                </p>
              )}
            </div>
            <div className="flex gap-4">
              <Link href="/settings" passHref>
                <Button variant="outline">Settings</Button>
              </Link>
            </div>
          </div>
        </header>

        {uiMessage.text && (
          <div
            className={`p-4 mb-6 text-sm rounded-lg flex justify-between items-center ${
              uiMessage.type === "error"
                ? "bg-destructive/10 text-destructive"
                : "bg-success/10 text-success"
            }`}
          >
            <span>{uiMessage.text}</span>
            {uiMessage.text.includes("Credentials") && (
              <Link
                href="/settings"
                className="font-bold underline hover:text-primary ml-4"
              >
                Go to Settings
              </Link>
            )}
          </div>
        )}

        {isScraping && (
          <LoadingIndicator progress={scrapeProgress} message={scrapeMessage} />
        )}

        <MonthlyStats
          attendanceData={attendance}
          currentDate={currentDate}
          holidays={holidays}
        />

        <Card className="mt-8 bg-card-secondary">
          <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            {lastFetched && (
              <p className="text-sm order-2 sm:order-1 self-center">
                Last updated:{" "}
                <span
                  className={formatRelativeTime(lastFetched, timeNow).color}
                >
                  {formatRelativeTime(lastFetched, timeNow).text}
                </span>
              </p>
            )}
            <div className="flex justify-end w-full sm:w-auto order-1 sm:order-2">
              <Button onClick={handleScrape} disabled={isScraping}>
                {isScraping ? "Updating..." : "Update Latest Attendance"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Calendar
              attendanceData={attendance}
              holidays={holidays}
              currentDate={currentDate}
              setCurrentDate={setCurrentDate}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

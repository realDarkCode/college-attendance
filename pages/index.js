import MonthlyStats from "@/components/MonthlyStats";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LoadingSpinner, SkeletonLoader } from "@/components/ui/loading";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { RefreshCw, Settings } from "lucide-react";
import Head from "next/head";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Calendar from "../components/Calendar";

// A new component for displaying the loading progress
const LoadingIndicator = ({ progress, message }) => (
  <div className="w-full my-8 glass-card p-6">
    <h3 className="font-semibold text-lg mb-4">Scraping in Progress...</h3>
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
  </div>
);

export default function Home() {
  const [attendance, setAttendance] = useState([]);
  const [isScrapedToday, setIsScrapedToday] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [studentName, setStudentName] = useState("");
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [calendarLoading, setCalendarLoading] = useState(false);

  // New state for scraping progress
  const [isScraping, setIsScraping] = useState(false);
  const [scrapeProgress, setScrapeProgress] = useState(0);
  const [scrapeMessage, setScrapeMessage] = useState("");
  const [uiMessage, setUiMessage] = useState({ text: "", type: "" }); // To show persistent messages
  const [lastFetched, setLastFetched] = useState(null);
  const [timeNow, setTimeNow] = useState(Date.now());
  const [autoFetchAttempted, setAutoFetchAttempted] = useState(false);
  const [preferences, setPreferences] = useState({
    calendarOnly: false,
    notifications: true,
  });

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
      setLoading(true);
      try {
        const [attendanceData, , holidaysData] = await Promise.all([
          fetchAttendance(),
          fetchStatus(),
          fetchHolidays(),
          fetchPreferences(),
        ]);

        // Check if we need to auto-scrape for today after initial data load
        setHolidays(holidaysData); // Ensure holidays are set before checking
        if (shouldAutoScrapeToday(attendanceData)) {
          console.log("Auto-scraping for today's data...");
          setAutoFetchAttempted(true);
          setTimeout(() => handleScrape(), 1000); // Small delay to ensure UI is ready
        } else if (
          lastFetched &&
          shouldAutoFetch(lastFetched) &&
          !isScraping &&
          !autoFetchAttempted
        ) {
          console.log("Initial auto-fetch triggered");
          handleScrape();
          setAutoFetchAttempted(true);
        }
      } finally {
        setLoading(false);
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
      
      // Ensure data is an array before using spread operator
      const attendanceArray = Array.isArray(data) ? data : [];
      setAttendance([...attendanceArray]); // Force array re-render with spread
      
      if (attendanceArray.length > 0) {
        const latestEntry = attendanceArray[attendanceArray.length - 1];
        setStudentName(latestEntry.name);
        if (latestEntry.fetchedAt) {
          setLastFetched(latestEntry.fetchedAt);
        }
      }
      return attendanceArray; // Return data for further processing
    } catch (error) {
      console.error("Failed to fetch attendance", error);
      setAttendance([]); // Set empty array on error
      return [];
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
      
      // Ensure data is an array before using spread operator
      const holidaysArray = Array.isArray(data) ? data : [];
      setHolidays([...holidaysArray]); // Force array re-render with spread
      return holidaysArray;
    } catch (error) {
      console.error("Failed to fetch holidays", error);
      setHolidays([]); // Set empty array on error
      return [];
    }
  };

  const fetchPreferences = async () => {
    try {
      const res = await fetch("/api/config");
      if (!res.ok) throw new Error("Failed to fetch preferences");
      const data = await res.json();
      setPreferences({
        calendarOnly: data.calendarOnly || false,
        notifications:
          data.notifications !== undefined ? data.notifications : true,
      });
    } catch (error) {
      console.error("Failed to fetch preferences", error);
    }
  };

  // Check if today's data exists
  const hasTodaysData = (attendanceData) => {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    return attendanceData.some(entry => entry.date === today);
  };

  // Check if we need to auto-scrape for today
  const shouldAutoScrapeToday = (attendanceData) => {
    if (isScraping || autoFetchAttempted) return false;
    
    // Don't auto-scrape on weekends (Friday=5, Saturday=6)
    const today = new Date();
    const dayOfWeek = today.getDay();
    if (dayOfWeek === 5 || dayOfWeek === 6) return false;
    
    // Don't auto-scrape if it's a holiday
    const todayStr = today.toISOString().split('T')[0];
    const isHoliday = holidays.some(holiday => holiday.date === todayStr);
    if (isHoliday) return false;
    
    // Auto-scrape if no data for today
    return !hasTodaysData(attendanceData);
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
        
        // Refresh all data after a short delay to ensure server has processed everything
        setTimeout(async () => {
          console.log("Refreshing all data after scrape completion...");
          const [newAttendanceData] = await Promise.all([
            fetchAttendance(),
            fetchStatus(),
            fetchHolidays(),
          ]);
          
          // Force a complete re-render by updating currentDate slightly
          setCurrentDate(new Date(currentDate.getTime()));
          console.log("Data refresh completed, UI should update now");
        }, 1000); // Increased delay to 1 second for better reliability
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
    if (!isoString)
      return { text: "Never fetched", color: "text-destructive-foreground" };

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
      color = "text-success-foreground"; // Green for recent (0-2 hours)
    } else if (diffInHours <= 4) {
      color = "text-warning-foreground"; // Yellow for somewhat old (2-4 hours)
    } else if (diffInHours <= 8) {
      color = "text-warning-foreground"; // orange for somewhat old (4-8 hours)
    } else {
      color = "text-destructive-foreground"; // Light red for old (>8 hours)
    }

    return { text, color };
  };

  const handleScrape = async () => {
    setIsScraping(true);
    setCalendarLoading(true);
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
    } finally {
      setCalendarLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="glass-bg min-h-screen text-foreground p-4 sm:p-6 md:p-8">
        <Head>
          <title>Attendance Tracker</title>
        </Head>
        <div className="max-w-4xl mx-auto page-transition">
          <header className="mb-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              <div>
                <SkeletonLoader className="h-10 w-64 mb-4" />
                <SkeletonLoader className="h-6 w-48" />
              </div>
              <div className="flex gap-4">
                <SkeletonLoader className="h-10 w-24" />
                <SkeletonLoader className="h-10 w-32" />
              </div>
            </div>
          </header>

          <div className="space-y-8">
            <Card className="glass-card">
              <CardHeader>
                <SkeletonLoader className="h-6 w-40" />
              </CardHeader>
              <CardContent>
                <SkeletonLoader className="h-32 w-full" />
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <SkeletonLoader className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <SkeletonLoader className="h-80 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-container min-h-screen text-foreground p-4 sm:p-6 md:p-8 font-sans overflow-x-hidden">
      <Head>
        <title>Attendance Tracker</title>
      </Head>
      <div className="max-w-4xl mx-auto page-transition">
        <header className="mb-6 lg:mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div className="w-full">
              <h1 className="text-3xl sm:text-4xl font-bold">
                <span className="text-primary">Attendance</span> Tracker
              </h1>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
              <Link href="/settings" passHref>
                <Button
                  variant="outline"
                  className="bg-muted/30 backdrop-blur-sm w-full sm:w-auto"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>
              </Link>
              {preferences.calendarOnly && lastFetched ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={handleScrape}
                      disabled={isScraping}
                      className="w-full sm:w-auto"
                    >
                      {isScraping ? (
                        <LoadingSpinner size="sm" text="Scraping..." />
                      ) : (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Update Now
                        </>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      Last updated:{" "}
                      {formatRelativeTime(lastFetched, timeNow).text}
                    </p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <Button
                  onClick={handleScrape}
                  disabled={isScraping}
                  className="w-full sm:w-auto"
                >
                  {isScraping ? (
                    <LoadingSpinner size="sm" text="Scraping..." />
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Update Now
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
          {!preferences.calendarOnly && (
            <div className="flex w-full justify-between px-2 my-4 items-center">
              {studentName && (
                <p className="text-base sm:text-lg text-muted-foreground">
                  Name:{" "}
                  <span className="text-foreground font-medium">
                    {studentName}
                  </span>
                </p>
              )}
              {lastFetched && (
                <p className="text-base   text-muted-foreground">
                  Last updated:{" "}
                  <span
                    className={formatRelativeTime(lastFetched, timeNow).color}
                  >
                    {formatRelativeTime(lastFetched, timeNow).text}
                  </span>
                </p>
              )}
            </div>
          )}
        </header>

        {uiMessage.text && (
          <div
            className={`p-4 mb-6 text-sm rounded-lg flex justify-between items-center ${
              uiMessage.type === "error"
                ? "bg-destructive/10 text-destructive-foreground"
                : "bg-success/10 text-success-foreground"
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

        <div className="space-y-6 lg:space-y-8">
          {!preferences.calendarOnly && (
            <div className="glass-card p-6">
              <MonthlyStats
                attendanceData={attendance}
                currentDate={currentDate}
                holidays={holidays}
              />
            </div>
          )}
          <div className="glass-card">
            <div className="p-6">
              <div className="relative">
                <Calendar
                  key={`calendar-${attendance.length}-${holidays.length}-${currentDate.getTime()}`}
                  attendanceData={attendance}
                  holidays={holidays}
                  currentDate={currentDate}
                  setCurrentDate={setCurrentDate}
                  onCalendarLoading={setCalendarLoading}
                />
                {calendarLoading && (
                  <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center rounded-lg">
                    <LoadingSpinner text="Updating calendar..." />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

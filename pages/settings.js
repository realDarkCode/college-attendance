import HolidayManager from "@/components/HolidayManager";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  AlertCircle,
  CalendarDays,
  CodeXml,
  Eye,
  EyeOff,
  Github,
  Home,
  Save,
  Trash2,
  UserCog,
} from "lucide-react";
import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Settings() {
  const [holidays, setHolidays] = useState([]);
  const [message, setMessage] = useState("");
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [credMessage, setCredMessage] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchHolidays(), fetchCredentials()]);
      setLoading(false);
    };
    loadData();
  }, []);

  const validateCredentials = () => {
    const newErrors = {};

    if (!credentials.username.trim()) {
      newErrors.username = "Username is required";
    } else if (credentials.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    if (!credentials.password.trim()) {
      newErrors.password = "Password is required";
    } else if (credentials.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fetchCredentials = async () => {
    try {
      const res = await fetch("/api/credentials");
      if (!res.ok) throw new Error("Failed to fetch credentials");
      const data = await res.json();
      setCredentials(data);
    } catch (error) {
      console.error(error);
      setCredMessage(error.message);
    }
  };

  const fetchHolidays = async () => {
    try {
      const res = await fetch("/api/holidays");
      if (!res.ok) throw new Error("Failed to fetch holidays");
      const data = await res.json();
      // Sort holidays by date (most recent first)
      const sortedHolidays = data.sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );
      setHolidays(sortedHolidays);
    } catch (error) {
      console.error(error);
      setMessage(error.message);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleAddHoliday = async (holidayData) => {
    try {
      setMessage("Adding holiday...");
      
      // Handle both single holidays and range holidays (now all individual)
      const res = await fetch("/api/holidays", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(holidayData),
      });
      const result = await res.json();
      setMessage(result.message);
      
      // Refresh holidays list
      fetchHolidays();
    } catch (error) {
      setMessage("Failed to add holiday.");
    }
  };

  // Group holidays for display
  const groupedHolidays = () => {
    const groups = {};
    const singleHolidays = [];
    const processedHolidays = new Set();

    // Sort holidays by date first
    const sortedHolidays = [...holidays].sort((a, b) => new Date(a.date) - new Date(b.date));

    sortedHolidays.forEach((holiday, index) => {
      if (processedHolidays.has(holiday.date)) return;

      // Check if this holiday has a rangeId (explicitly grouped)
      if (holiday.rangeId) {
        if (!groups[holiday.rangeId]) {
          groups[holiday.rangeId] = {
            name: holiday.name,
            dates: [],
            rangeId: holiday.rangeId,
            isRange: true
          };
        }
        groups[holiday.rangeId].dates.push(holiday.date);
        processedHolidays.add(holiday.date);
      } else {
        // Look for consecutive holidays with the same name
        const consecutiveHolidays = [holiday];
        processedHolidays.add(holiday.date);
        
        let currentDate = new Date(holiday.date);
        for (let i = index + 1; i < sortedHolidays.length; i++) {
          currentDate.setDate(currentDate.getDate() + 1);
          const nextDateStr = currentDate.toISOString().split('T')[0];
          const nextHoliday = sortedHolidays[i];
          
          if (nextHoliday.date === nextDateStr && 
              nextHoliday.name === holiday.name && 
              !processedHolidays.has(nextHoliday.date)) {
            consecutiveHolidays.push(nextHoliday);
            processedHolidays.add(nextHoliday.date);
          } else {
            break;
          }
        }

        if (consecutiveHolidays.length > 1) {
          // Create a group for consecutive holidays
          const groupId = `auto_${holiday.date}_${consecutiveHolidays[consecutiveHolidays.length - 1].date}_${holiday.name}`;
          groups[groupId] = {
            name: holiday.name,
            dates: consecutiveHolidays.map(h => h.date),
            rangeId: groupId,
            isRange: true
          };
        } else {
          // Single holiday
          singleHolidays.push(holiday);
        }
      }
    });

    // Format display dates for groups
    Object.values(groups).forEach(group => {
      group.dates.sort();
      group.startDate = group.dates[0];
      group.endDate = group.dates[group.dates.length - 1];
      group.displayDate = group.dates.length === 1 
        ? formatDate(group.startDate)
        : `${formatDate(group.startDate)} - ${formatDate(group.endDate)}`;
    });

    // Combine and sort all holidays by date (most recent first)
    const allGroups = [...singleHolidays, ...Object.values(groups)];
    return allGroups.sort((a, b) => {
      const dateA = a.isRange ? a.startDate : a.date;
      const dateB = b.isRange ? b.startDate : b.date;
      return new Date(dateB) - new Date(dateA);
    });
  };

  const handleRemoveHoliday = async (holidayToRemove) => {
    try {
      if (holidayToRemove.isRange) {
        // Remove all holidays in the range by rangeId
        setMessage(`Removing ${holidayToRemove.dates.length} holidays...`);
        for (const date of holidayToRemove.dates) {
          const res = await fetch("/api/holidays", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ date }),
          });
          if (!res.ok) {
            throw new Error("Failed to remove holiday");
          }
        }
        setMessage(`Removed ${holidayToRemove.dates.length} holidays from range: ${holidayToRemove.name}`);
      } else {
        // Remove single holiday
        setMessage("Removing holiday...");
        const res = await fetch("/api/holidays", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ date: holidayToRemove.date }),
        });
        const result = await res.json();
        setMessage(result.message);
      }
      
      // Refresh holidays list
      fetchHolidays();
    } catch (error) {
      setMessage("Failed to remove holiday.");
    }
  };

  const handleUpdateCredentials = async (e) => {
    e.preventDefault();

    if (!validateCredentials()) {
      return;
    }

    setUpdating(true);
    setCredMessage("Updating...");
    setErrors({}); // Clear any previous errors

    try {
      const res = await fetch("/api/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      const result = await res.json();
      setCredMessage(result.message);
    } catch (error) {
      setCredMessage("Failed to update credentials.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <>
        <Head>
          <title>Settings - Attendance Tracker</title>
        </Head>
        <main className="glass-bg min-h-screen text-foreground p-4 sm:p-6 lg:p-8">
          <div className="container mx-auto page-transition">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <Skeleton className="h-8 w-32" />
              <div className="flex gap-3">
                <Skeleton className="h-10 w-10" />
                <Skeleton className="h-10 w-32" />
              </div>
            </div>

            {/* Credentials Section Skeleton */}
            <Card className="glass-card mb-8">
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <Skeleton className="h-10 w-32" />
              </CardContent>
            </Card>

            {/* Holiday Section Skeleton */}
            <Card className="glass-card">
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Settings - Attendance Tracker</title>
      </Head>
      <main className="glass-bg min-h-screen text-foreground p-4 sm:p-6 lg:p-8">
        <div className="container mx-auto page-transition">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-responsive">
              Settings
            </h1>
            <div className="flex gap-3">
              <ThemeToggle />
              <Link href="/" passHref>
                <Button variant="outline" className="w-full sm:w-auto">
                  <Home className="mr-2 h-4 w-4" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>

          {/* Credentials Section */}
          <Card className="glass-card mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCog className="h-5 w-5 text-primary" />
                Login Credentials
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateCredentials} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    value={credentials.username}
                    onChange={(e) => {
                      setCredentials({
                        ...credentials,
                        username: e.target.value,
                      });
                      // Clear error when user starts typing
                      if (errors.username) {
                        setErrors({ ...errors, username: "" });
                      }
                    }}
                    placeholder="Enter your username"
                    disabled={updating}
                    className={errors.username ? "border-red-500" : ""}
                  />
                  {errors.username && (
                    <div className="flex items-center gap-1 text-sm text-red-500">
                      <AlertCircle className="h-4 w-4" />
                      {errors.username}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={passwordVisible ? "text" : "password"}
                      value={credentials.password}
                      onChange={(e) => {
                        setCredentials({
                          ...credentials,
                          password: e.target.value,
                        });
                        // Clear error when user starts typing
                        if (errors.password) {
                          setErrors({ ...errors, password: "" });
                        }
                      }}
                      placeholder="Enter your password"
                      disabled={updating}
                      className={errors.password ? "border-red-500" : ""}
                    />
                    <button
                      type="button"
                      onClick={() => setPasswordVisible(!passwordVisible)}
                      className="absolute inset-y-0 right-0 px-3 flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                      disabled={updating}
                    >
                      {passwordVisible ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <div className="flex items-center gap-1 text-sm text-red-500">
                      <AlertCircle className="h-4 w-4" />
                      {errors.password}
                    </div>
                  )}
                </div>
                <Button
                  type="submit"
                  disabled={updating}
                  className="w-full sm:w-auto"
                >
                  {updating ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Updating...
                    </div>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Update Credentials
                    </>
                  )}
                </Button>
              </form>
              {credMessage && (
                <p
                  className={`mt-4 text-sm ${
                    credMessage.includes("successfully") ||
                    credMessage.includes("saved")
                      ? "text-green-600"
                      : credMessage.includes("error") ||
                        credMessage.includes("failed")
                      ? "text-red-500"
                      : "text-muted-foreground"
                  }`}
                >
                  {credMessage}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Holiday Management Section */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-primary" />
                Manage Holidays
              </CardTitle>
            </CardHeader>
            <CardContent>
              <HolidayManager
                onAddHoliday={handleAddHoliday}
                message={message}
              />

              <Separator className="my-6 bg-border/50" />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-foreground">
                    Custom Holidays
                  </h3>
                  <span className="text-xs text-muted-foreground bg-muted/30 px-2 py-1 rounded-full border border-border/50">
                    {groupedHolidays().length}{" "}
                    {groupedHolidays().length === 1 ? "entry" : "entries"}
                  </span>
                </div>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {groupedHolidays().map((holiday, index) => (
                    <div
                      key={holiday.rangeId || holiday.date || index}
                      className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-background/50 backdrop-blur-sm rounded-lg border border-border/50 hover:bg-background/70 transition-all duration-200 gap-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 flex-grow">
                        <span className="text-xs font-mono bg-primary/20 text-primary px-2 py-1 rounded-md w-fit border border-primary/30">
                          {holiday.isRange ? holiday.displayDate : formatDate(holiday.date)}
                        </span>
                        <span className="font-medium text-foreground">
                          {holiday.name}
                        </span>
                        {holiday.isRange && (
                          <span className="text-xs text-muted-foreground bg-accent/20 px-2 py-1 rounded-md">
                            {holiday.dates.length} days
                          </span>
                        )}
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveHoliday(holiday)}
                        className="w-full sm:w-auto bg-destructive/90 hover:bg-destructive text-destructive-foreground shadow-sm transition-all duration-200"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {holiday.isRange ? `Remove ${holiday.dates.length} days` : 'Remove'}
                      </Button>
                    </div>
                  ))}
                </div>
                {groupedHolidays().length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <CalendarDays className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No holidays added yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <footer className="footer">
            <div className="text-sm text-muted-foreground">
              Made with{" "}
              <CodeXml className="inline h-4 w-4 mx-1 text-primary" />
              by{" "}
              <a
                href="https://github.com/realDarkCode"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 hover:text-primary transition-colors"
              >
                <Github className="h-4 w-4" />
                darkcode
              </a>
            </div>
          </footer>
        </div>
      </main>
    </>
  );
}

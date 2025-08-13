import HolidayManager from "@/components/HolidayManager";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  AlertCircle,
  Bell,
  CalendarDays,
  CodeXml,
  Eye,
  EyeOff,
  HeartIcon,
  Home,
  Save,
  ShieldUser,
  Trash2,
  UserCog,
} from "lucide-react";
import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Settings() {
  const [holidays, setHolidays] = useState([]);
  const [message, setMessage] = useState("");
  const [config, setConfig] = useState({
    username: "",
    password: "",
    calendarOnly: false,
    notifications: true,
  });
  const [credMessage, setCredMessage] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchHolidays(), fetchConfig()]);
      setLoading(false);
    };
    loadData();
  }, []);

  const validateCredentials = () => {
    const newErrors = {};

    if (!config.username.trim()) {
      newErrors.username = "Username is required";
    } else if (config.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    if (!config.password.trim()) {
      newErrors.password = "Password is required";
    } else if (config.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fetchConfig = async () => {
    try {
      const res = await fetch("/api/config");
      if (!res.ok) throw new Error("Failed to fetch configuration");
      const data = await res.json();
      setConfig(data);
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
    const sortedHolidays = [...holidays].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    sortedHolidays.forEach((holiday, index) => {
      if (processedHolidays.has(holiday.date)) return;

      // Check if this holiday has a rangeId (explicitly grouped)
      if (holiday.rangeId) {
        if (!groups[holiday.rangeId]) {
          groups[holiday.rangeId] = {
            name: holiday.name,
            dates: [],
            rangeId: holiday.rangeId,
            isRange: true,
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
          const nextDateStr = currentDate.toISOString().split("T")[0];
          const nextHoliday = sortedHolidays[i];

          if (
            nextHoliday.date === nextDateStr &&
            nextHoliday.name === holiday.name &&
            !processedHolidays.has(nextHoliday.date)
          ) {
            consecutiveHolidays.push(nextHoliday);
            processedHolidays.add(nextHoliday.date);
          } else {
            break;
          }
        }

        if (consecutiveHolidays.length > 1) {
          // Create a group for consecutive holidays
          const groupId = `auto_${holiday.date}_${
            consecutiveHolidays[consecutiveHolidays.length - 1].date
          }_${holiday.name}`;
          groups[groupId] = {
            name: holiday.name,
            dates: consecutiveHolidays.map((h) => h.date),
            rangeId: groupId,
            isRange: true,
          };
        } else {
          // Single holiday
          singleHolidays.push(holiday);
        }
      }
    });

    // Format display dates for groups
    Object.values(groups).forEach((group) => {
      group.dates.sort();
      group.startDate = group.dates[0];
      group.endDate = group.dates[group.dates.length - 1];
      group.displayDate =
        group.dates.length === 1
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
        setMessage(
          `Removed ${holidayToRemove.dates.length} holidays from range: ${holidayToRemove.name}`
        );
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
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      const result = await res.json();
      setCredMessage(result.message);
    } catch (error) {
      setCredMessage("Failed to update configuration.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="glass-container min-h-screen text-foreground p-4 sm:p-6 md:p-8 font-sans overflow-x-hidden">
        <Head>
          <title>Settings - Attendance Tracker</title>
        </Head>
        <main className="max-w-4xl mx-auto page-transition">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <Skeleton className="h-8 w-32" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
          <div className="space-y-8">
            <Card className="glass-card">
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
                <div className="flex justify-end">
                  <Skeleton className="h-10 w-32" />
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="glass-container min-h-screen text-foreground p-4 sm:p-6 md:p-8 font-sans overflow-x-hidden">
      <Head>
        <title>Settings - Attendance Tracker</title>
      </Head>
      <main className="max-w-4xl mx-auto page-transition">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
            Settings
          </h1>
          <div className="flex items-center gap-2">
            <Link href="/" passHref>
              <Button variant="outline">
                <Home className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>

        <div className="space-y-8">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldUser className="h-5 w-5 text-primary" />
                Login Credentials
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateCredentials} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        type="text"
                        value={config.username}
                        onChange={(e) => {
                          setConfig({
                            ...config,
                            username: e.target.value,
                          });
                          // Clear error when user starts typing
                          if (errors.username) {
                            setErrors({ ...errors, username: "" });
                          }
                        }}
                        placeholder="Enter your username"
                        disabled={updating}
                        className={
                          errors.username ? "border-destructive-foreground" : ""
                        }
                      />
                      {errors.username && (
                        <div className="flex items-center gap-1 text-sm text-destructive-foreground border-destructive-foreground">
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
                          value={config.password}
                          onChange={(e) => {
                            setConfig({
                              ...config,
                              password: e.target.value,
                            });
                            // Clear error when user starts typing
                            if (errors.password) {
                              setErrors({ ...errors, password: "" });
                            }
                          }}
                          placeholder="Enter your password"
                          disabled={updating}
                          className={
                            errors.password
                              ? "border-destructive-foreground"
                              : ""
                          }
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
                        <div className="flex items-center gap-1 text-sm text-destructive-foreborder-destructive-foreground">
                          <AlertCircle className="h-4 w-4" />
                          {errors.password}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={updating}>
                      <Save className="mr-2 h-4 w-4" />
                      {updating ? "Saving..." : "Save credential"}
                    </Button>
                  </div>
                </div>

                {credMessage && (
                  <p className="mt-4 text-sm text-center text-muted-foreground">
                    {credMessage}
                  </p>
                )}
                <Separator className="my-6 bg-border/50" />

                <div className="space-y-6">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <UserCog className="h-5 w-5 text-primary" />
                    User Preferences
                  </h3>

                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 glass-card rounded-lg">
                      <div className="space-y-1">
                        <Label
                          htmlFor="calendar-only"
                          className="text-base font-medium"
                        >
                          Calendar Only
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Hide monthly stats and user info, show only the
                          calendar
                        </p>
                      </div>
                      <Switch
                        id="calendar-only"
                        checked={config.calendarOnly}
                        onCheckedChange={(checked) =>
                          setConfig({
                            ...config,
                            calendarOnly: checked,
                          })
                        }
                        disabled={updating}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 glass-card rounded-lg">
                      <div className="space-y-1">
                        <Label
                          htmlFor="notifications"
                          className="flex items-center gap-2 text-base font-medium"
                        >
                          <Bell className="h-4 w-4" />
                          Notifications
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Enable or disable system notifications
                        </p>
                      </div>
                      <Switch
                        id="notifications"
                        checked={config.notifications}
                        onCheckedChange={(checked) =>
                          setConfig({
                            ...config,
                            notifications: checked,
                          })
                        }
                        disabled={updating}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 glass-card rounded-lg">
                      <div className="space-y-1">
                        <Label
                          htmlFor="theme-toggle"
                          className="text-base font-medium"
                        >
                          Theme
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Choose your preferred color theme
                        </p>
                      </div>
                      <ThemeToggle />
                    </div>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>

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
                          {holiday.isRange
                            ? holiday.displayDate
                            : formatDate(holiday.date)}
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
                        {holiday.isRange
                          ? `Remove ${holiday.dates.length} days`
                          : "Remove"}
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
          <footer className="mt-12 py-8 text-center glass-card">
            <div className="text-sm text-base-foreground flex items-center justify-center gap-1">
              Made with{" "}
              <HeartIcon className="inline size-5 text-destructive-foreground" />{" "}
              by{" "}
              <a
                href="https://github.com/realDarkCode"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1 text-primary transition-colors hover:text-underline"
              >
                <CodeXml className="inline size-5  text-primary" />
                DarkCode
              </a>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}

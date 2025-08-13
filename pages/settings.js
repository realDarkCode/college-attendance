import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import {
  CalendarDays,
  CalendarIcon,
  Eye,
  EyeOff,
  Home,
  Plus,
  Save,
  Trash2,
  UserCog,
} from "lucide-react";
import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Settings() {
  const [holidays, setHolidays] = useState([]);
  const [newHoliday, setNewHoliday] = useState({ date: "", name: "" });
  const [selectedDate, setSelectedDate] = useState(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [credMessage, setCredMessage] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);

  useEffect(() => {
    fetchHolidays();
    fetchCredentials();
  }, []);

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
      // Sort holidays by date
      const sortedHolidays = data.sort(
        (a, b) => new Date(a.date) - new Date(b.date)
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

  const handleDateSelect = (date) => {
    if (date) {
      const formattedDate = date.toISOString().split("T")[0];
      setNewHoliday({ ...newHoliday, date: formattedDate });
      setSelectedDate(date);
      setCalendarOpen(false);
    }
  };

  const handleAddHoliday = async (e) => {
    e.preventDefault();
    if (!newHoliday.date || !newHoliday.name) return;
    try {
      const res = await fetch("/api/holidays", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newHoliday),
      });
      const result = await res.json();
      setMessage(result.message);
      if (res.ok) {
        // Sort holidays by date before setting
        const sortedHolidays = result.holidays.sort(
          (a, b) => new Date(a.date) - new Date(b.date)
        );
        setHolidays(sortedHolidays);
        setNewHoliday({ date: "", name: "" });
        setSelectedDate(null);
      }
    } catch (error) {
      setMessage("Failed to add holiday.");
    }
  };

  const handleRemoveHoliday = async (dateToRemove) => {
    try {
      const res = await fetch("/api/holidays", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: dateToRemove }),
      });
      const result = await res.json();
      setMessage(result.message);
      if (res.ok) {
        // Sort holidays by date before setting
        const sortedHolidays = result.holidays.sort(
          (a, b) => new Date(a.date) - new Date(b.date)
        );
        setHolidays(sortedHolidays);
      }
    } catch (error) {
      setMessage("Failed to remove holiday.");
    }
  };

  const handleUpdateCredentials = async (e) => {
    e.preventDefault();
    setCredMessage("Updating...");
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
    }
  };

  return (
    <>
      <Head>
        <title>Settings - Attendance Tracker</title>
      </Head>
      <main className="glass-bg min-h-screen text-foreground p-4 sm:p-8">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Settings</h1>
            <Link href="/" passHref>
              <Button variant="outline">
                <Home className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <Card className="glass-card">
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
                      onChange={(e) =>
                        setCredentials({
                          ...credentials,
                          username: e.target.value,
                        })
                      }
                      placeholder="Enter your username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={passwordVisible ? "text" : "password"}
                        value={credentials.password}
                        onChange={(e) =>
                          setCredentials({
                            ...credentials,
                            password: e.target.value,
                          })
                        }
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        onClick={() => setPasswordVisible(!passwordVisible)}
                        className="absolute inset-y-0 right-0 px-3 flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {passwordVisible ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <Button type="submit">
                    <Save className="mr-2 h-4 w-4" />
                    Update Credentials
                  </Button>
                </form>
                {credMessage && (
                  <p className="mt-4 text-sm text-muted-foreground">
                    {credMessage}
                  </p>
                )}
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
                <form onSubmit={handleAddHoliday} className="space-y-4 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="holiday-date">Holiday Date</Label>
                      <Popover
                        open={calendarOpen}
                        onOpenChange={setCalendarOpen}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal bg-card/50 backdrop-blur-sm hover:bg-card/70 border-card-border"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {selectedDate
                              ? formatDate(newHoliday.date)
                              : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={handleDateSelect}
                            disabled={(date) => date < new Date("1900-01-01")}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="holiday-name">Holiday Name</Label>
                      <Input
                        id="holiday-name"
                        type="text"
                        value={newHoliday.name}
                        onChange={(e) =>
                          setNewHoliday({ ...newHoliday, name: e.target.value })
                        }
                        placeholder="Enter holiday name"
                        className="w-full"
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full md:w-auto">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Holiday
                  </Button>
                </form>
                {message && (
                  <p className="mb-4 text-sm text-center text-muted-foreground">
                    {message}
                  </p>
                )}
                <Separator />
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">
                    Custom Holidays ({holidays.length})
                  </h3>
                  <ul className="space-y-2">
                    {holidays.map((holiday) => (
                      <li
                        key={holiday.date}
                        className="flex justify-between items-center p-4 bg-muted/50 rounded-lg border border-border/50 backdrop-blur-sm"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                          <span className="text-sm font-mono bg-primary/20 text-primary px-2 py-1 rounded">
                            {formatDate(holiday.date)}
                          </span>
                          <span className="font-medium text-secondary-foreground">
                            {holiday.name}
                          </span>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveHoliday(holiday.date)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remove
                        </Button>
                      </li>
                    ))}
                  </ul>
                  {holidays.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No holidays added yet
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}

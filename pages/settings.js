import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Settings() {
  const [holidays, setHolidays] = useState([]);
  const [newHoliday, setNewHoliday] = useState({ date: "", name: "" });
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
      setHolidays(data);
    } catch (error) {
      console.error(error);
      setMessage(error.message);
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
        setHolidays(result.holidays);
        setNewHoliday({ date: "", name: "" });
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
        setHolidays(result.holidays);
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
      <main className="min-h-screen bg-background text-foreground p-4 sm:p-8">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Settings</h1>
            <Link href="/" passHref>
              <Button variant="outline">Back to Home</Button>
            </Link>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Login Credentials</CardTitle>
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
                        className="absolute inset-y-0 right-0 px-3 flex items-center text-sm text-muted-foreground"
                      >
                        {passwordVisible ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>
                  <Button type="submit">Update Credentials</Button>
                </form>
                {credMessage && (
                  <p className="mt-4 text-sm text-muted-foreground">
                    {credMessage}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Manage Holidays</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddHoliday} className="flex gap-2 mb-4">
                  <Input
                    type="date"
                    value={newHoliday.date}
                    onChange={(e) =>
                      setNewHoliday({ ...newHoliday, date: e.target.value })
                    }
                    className="w-full"
                  />
                  <Input
                    type="text"
                    value={newHoliday.name}
                    onChange={(e) =>
                      setNewHoliday({ ...newHoliday, name: e.target.value })
                    }
                    placeholder="Holiday Name"
                    className="w-full"
                  />
                  <Button type="submit">Add</Button>
                </form>
                {message && (
                  <p className="mb-4 text-sm text-center text-muted-foreground">
                    {message}
                  </p>
                )}
                <Separator />
                <ul className="mt-4 space-y-2">
                  {holidays.map((holiday) => (
                    <li
                      key={holiday.date}
                      className="flex justify-between items-center p-2 bg-muted rounded-md"
                    >
                      <span>
                        {holiday.date} - {holiday.name}
                      </span>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveHoliday(holiday.date)}
                      >
                        Remove
                      </Button>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}

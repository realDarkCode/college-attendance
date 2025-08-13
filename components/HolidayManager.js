import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CalendarIcon, Plus } from "lucide-react";
import { useState } from "react";

const HolidayManager = ({ onAddHoliday, message }) => {
  const [singleDate, setSingleDate] = useState(null);
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const [holidayName, setHolidayName] = useState("");
  const [singleCalendarOpen, setSingleCalendarOpen] = useState(false);
  const [rangeCalendarOpen, setRangeCalendarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("single");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatDate = (date) => {
    if (!date) return "Select date";
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateRange = (range) => {
    if (!range?.from) return "Select date range";
    if (!range?.to) return `From ${formatDate(range.from)}`;
    return `${formatDate(range.from)} - ${formatDate(range.to)}`;
  };

  const validateHoliday = (date, name) => {
    const newErrors = {};

    if (!date) {
      newErrors.date = "Please select a date";
    }

    if (!name.trim()) {
      newErrors.name = "Holiday name is required";
    } else if (name.trim().length < 2) {
      newErrors.name = "Holiday name must be at least 2 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSingleDateSubmit = async (e) => {
    e.preventDefault();

    if (!validateHoliday(singleDate, holidayName)) {
      return;
    }

    setIsSubmitting(true);
    const formattedDate = singleDate.toISOString().split("T")[0];
    await onAddHoliday({ date: formattedDate, name: holidayName.trim() });

    // Reset form on success
    setSingleDate(null);
    setHolidayName("");
    setErrors({});
    setIsSubmitting(false);
  };

  const handleRangeSubmit = async (e) => {
    e.preventDefault();

    if (!validateHoliday(dateRange?.from, holidayName)) {
      return;
    }

    setIsSubmitting(true);

    // Generate all dates in range
    const dates = [];
    const startDate = new Date(dateRange.from);
    const endDate = dateRange.to ? new Date(dateRange.to) : startDate;

    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      dates.push(new Date(d).toISOString().split("T")[0]);
    }

    // Generate a unique range ID for grouping
    const rangeId = `${dates[0]}_${
      dates[dates.length - 1]
    }_${holidayName.trim()}`;

    // Add each date individually but with range metadata
    for (const date of dates) {
      await onAddHoliday({
        date,
        name: holidayName.trim(),
        isRange: true,
        rangeId: rangeId,
        totalDays: dates.length,
      });
    }

    // Reset form on success
    setDateRange({ from: null, to: null });
    setHolidayName("");
    setErrors({});
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-muted/50 backdrop-blur-sm border border-border/50">
          <TabsTrigger
            value="single"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all duration-200 cursor-pointer"
          >
            Single Day
          </TabsTrigger>
          <TabsTrigger
            value="range"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all duration-200 cursor-pointer"
          >
            Date Range
          </TabsTrigger>
        </TabsList>

        <TabsContent value="single" className="mt-6 space-y-4">
          <form onSubmit={handleSingleDateSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label
                  htmlFor="single-date"
                  className="text-sm font-medium text-foreground"
                >
                  Holiday Date
                </Label>
                <Popover
                  open={singleCalendarOpen}
                  onOpenChange={setSingleCalendarOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-start text-left font-normal bg-background/50 backdrop-blur-sm hover:bg-background/70 border-border  transition-all duration-200 ${
                        errors.date
                          ? "border-destructive-foreground focus-visible:ring-destructive-foreground"
                          : ""
                      }`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span
                        className={
                          singleDate
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }
                      >
                        {formatDate(singleDate)}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto p-0 bg-popover border border-border shadow-lg"
                    align="start"
                  >
                    <Calendar
                      mode="single"
                      selected={singleDate}
                      onSelect={(date) => {
                        setSingleDate(date);
                        setSingleCalendarOpen(false);
                        // Clear error when user selects date
                        if (errors.date) {
                          setErrors({ ...errors, date: "" });
                        }
                      }}
                      disabled={(date) => date < new Date("1900-01-01")}
                      initialFocus
                      className="rounded-md"
                    />
                  </PopoverContent>
                </Popover>
                {errors.date && (
                  <div className="flex items-center gap-2 text-sm text-destructive-foreground">
                    <AlertCircle className="h-4 w-4" />
                    {errors.date}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="single-name"
                  className="text-sm font-medium text-foreground"
                >
                  Holiday Name
                </Label>
                <Input
                  id="single-name"
                  type="text"
                  value={holidayName}
                  onChange={(e) => {
                    setHolidayName(e.target.value);
                    // Clear error when user starts typing
                    if (errors.name) {
                      setErrors({ ...errors, name: "" });
                    }
                  }}
                  placeholder="Enter holiday name"
                  className={`w-full bg-background/50 backdrop-blur-sm border-border transition-all duration-200 focus:bg-background/70 ${
                    errors.name
                      ? "border-destructive-foreground focus-visible:ring-destructive-foreground"
                      : ""
                  }`}
                  disabled={isSubmitting}
                />
                {errors.name && (
                  <div className="flex items-center gap-2 text-sm text-destructive-foreground">
                    <AlertCircle className="h-4 w-4" />
                    {errors.name}
                  </div>
                )}
              </div>
            </div>

            <Separator className="bg-border/50" />

            <Button
              type="submit"
              className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm transition-all duration-200"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Adding Holiday...
                </div>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Single Holiday
                </>
              )}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="range" className="mt-6 space-y-4">
          <form onSubmit={handleRangeSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label
                  htmlFor="range-date"
                  className="text-sm font-medium text-foreground"
                >
                  Date Range
                </Label>
                <Popover
                  open={rangeCalendarOpen}
                  onOpenChange={setRangeCalendarOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-start text-left font-normal bg-background/50 backdrop-blur-sm hover:bg-background/70 border-border transition-all duration-200 ${
                        errors.date
                          ? "border-destructive-foreground focus-visible:ring-destructive-foreground"
                          : ""
                      }`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span
                        className={
                          dateRange?.from
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }
                      >
                        {formatDateRange(dateRange)}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto p-0 bg-popover border border-border shadow-lg"
                    align="start"
                  >
                    <Calendar
                      mode="range"
                      selected={dateRange}
                      onSelect={(range) => {
                        setDateRange(range);
                        // Clear error when user selects range
                        if (errors.date) {
                          setErrors({ ...errors, date: "" });
                        }
                      }}
                      disabled={(date) => date < new Date("1900-01-01")}
                      numberOfMonths={1}
                      initialFocus
                      className="rounded-md"
                    />
                  </PopoverContent>
                </Popover>
                {errors.date && (
                  <div className="flex items-center gap-2 text-sm text-destructive-foreground">
                    <AlertCircle className="h-4 w-4" />
                    {errors.date}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="range-name"
                  className="text-sm font-medium text-foreground"
                >
                  Holiday Name
                </Label>
                <Input
                  id="range-name"
                  type="text"
                  value={holidayName}
                  onChange={(e) => {
                    setHolidayName(e.target.value);
                    // Clear error when user starts typing
                    if (errors.name) {
                      setErrors({ ...errors, name: "" });
                    }
                  }}
                  placeholder="Enter holiday name"
                  className={`w-full bg-background/50 backdrop-blur-sm border-border transition-all duration-200 focus:bg-background/70 ${
                    errors.name
                      ? "border-destructive-foreground focus-visible:ring-destructive-foreground"
                      : ""
                  }`}
                  disabled={isSubmitting}
                />
                {errors.name && (
                  <div className="flex items-center gap-2 text-sm text-destructive-foreground">
                    <AlertCircle className="h-4 w-4" />
                    {errors.name}
                  </div>
                )}
              </div>
            </div>

            <Separator className="bg-border/50" />

            <Button
              type="submit"
              className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm transition-all duration-200"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Adding Holidays...
                </div>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Range Holidays
                </>
              )}
            </Button>
          </form>
        </TabsContent>
      </Tabs>

      {message && (
        <div className="text-center">
          <Separator className="bg-border/50 mb-4" />
          <p className="text-sm text-muted-foreground bg-muted/30 px-4 py-2 rounded-lg border border-border/50 backdrop-blur-sm">
            {message}
          </p>
        </div>
      )}
    </div>
  );
};

export default HolidayManager;

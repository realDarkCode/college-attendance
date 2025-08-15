import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";

const getStatusIcon = (status) => {
  switch (status) {
    case "Error":
      return <AlertTriangle className="size-5 " />;

    default:
      return null;
  }
};

const CalendarTooltip = ({ entry, holidayInfo, children }) => {
  if (!entry && !holidayInfo) return <>{children}</>;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent className="bg-popover border-border backdrop-blur-md text-popover-foreground">
          {holidayInfo && (
            <p className="font-bold text-popover-foreground">
              {holidayInfo.name}
            </p>
          )}
          {entry && holidayInfo && <hr className="my-1 border-border" />}
          {entry && (
            <>
              <p className="font-bold text-popover-foreground">{entry.date}</p>
              <p className="text-popover-foreground">
                Status:{" "}
                <span
                  className={`font-semibold ${
                    entry.dayStatus === "Present"
                      ? "text-success-foreground"
                      : entry.dayStatus === "Absent"
                      ? "text-destructive-foreground"
                      : entry.dayStatus === "Leave"
                      ? "text-warning-foreground"
                      : entry.dayStatus === "Error"
                      ? "text-destructive-foreground"
                      : entry.dayStatus === "No Change"
                      ? "text-primary"
                      : entry.dayStatus === "Unavailable"
                      ? "text-muted-foreground"
                      : entry.dayStatus === "Holiday"
                      ? "text-accent-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {entry.dayStatus}
                </span>
              </p>
              <hr className="my-1 border-border" />
              {entry.data ? (
                <>
                  <p className="text-popover-foreground">
                    Working Days:{" "}
                    <span className="font-medium text-popover-foreground">
                      {entry.data.workingDays}
                    </span>
                  </p>
                  <p className="text-popover-foreground">
                    Present:{" "}
                    <span className="font-medium text-popover-foreground">
                      {entry.data.present}
                    </span>
                  </p>
                  <p className="text-popover-foreground">
                    Absent:{" "}
                    <span className="font-medium text-popover-foreground">
                      {entry.data.absent}
                    </span>
                  </p>
                  <p className="text-popover-foreground">
                    Leave:{" "}
                    <span className="font-medium text-popover-foreground">
                      {entry.data.leave}
                    </span>
                  </p>
                </>
              ) : entry.dayStatus === "Error" && entry.error ? (
                <div className="text-destructive-foreground">
                  <p className="font-semibold">Error Details:</p>
                  <p className="text-xs mt-1">{entry.error}</p>
                </div>
              ) : (
                <p className="text-destructive-foreground">
                  Data unavailable due to error
                </p>
              )}
            </>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default function Calendar({
  attendanceData,
  holidays = [], // Default to empty array
  currentDate,
  setCurrentDate,
  onCalendarLoading,
}) {
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  );
  const lastDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  );
  const startingDay = firstDayOfMonth.getDay(); // 0 for Sunday, 1 for Monday, etc.
  const totalDays = lastDayOfMonth.getDate();

  const changeMonth = (offset) => {
    // Add loading transition
    if (typeof onCalendarLoading === "function") {
      onCalendarLoading(true);
      setTimeout(() => onCalendarLoading(false), 300);
    }

    const newDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + offset,
      1
    );
    setCurrentDate(newDate);
  };

  const getStatusForDate = (day) => {
    const dateStr = `${currentDate.getFullYear()}-${String(
      currentDate.getMonth() + 1
    ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const entry = attendanceData.find((d) => d.date === dateStr);
    return entry ? entry.dayStatus : null;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Present":
        return "attendance-present backdrop-blur-md";
      case "Absent":
        return "attendance-absent backdrop-blur-md";
      case "Leave":
        return "attendance-leave backdrop-blur-md";
      case "Error":
        return "attendance-error backdrop-blur-md";
      case "No Change":
        return "attendance-no-change backdrop-blur-md";
      case "Unavailable":
        return "attendance-unavailable backdrop-blur-sm";
      case "Holiday":
        return "attendance-holiday backdrop-blur-md";
      default:
        return "border-border/20 backdrop-blur-sm hover:bg-muted/25";
    }
  };

  return (
    <Card className="glass-card calendar-transition">
      <CardHeader className="flex flex-row items-center justify-between">
        <Button variant="outline" size="icon" onClick={() => changeMonth(-1)}>
          <ChevronLeft className="size-5" />
        </Button>
        <CardTitle className="text-xl sm:text-2xl font-semibold text-center">
          {currentDate.toLocaleString("default", {
            month: "long",
            year: "numeric",
          })}
        </CardTitle>
        <Button variant="outline" size="icon" onClick={() => changeMonth(1)}>
          <ChevronRight className="size-5" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center">
          {daysOfWeek.map((day) => (
            <div
              key={day}
              className="font-bold text-primary text-xs sm:text-base"
            >
              <span className="hidden sm:inline ">{day}</span>
              <span className="sm:hidden">{day.charAt(0)}</span>
            </div>
          ))}
          {Array.from({ length: startingDay }).map((_, index) => (
            <div key={`empty-${index}`} className="w-full h-12 sm:h-16"></div>
          ))}
          {Array.from({ length: totalDays }).map((_, dayIndex) => {
            const day = dayIndex + 1;
            const dateStr = `${currentDate.getFullYear()}-${String(
              currentDate.getMonth() + 1
            ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const dayOfWeek = new Date(
              currentDate.getFullYear(),
              currentDate.getMonth(),
              day
            ).getDay();

            const isWeeklyHoliday = dayOfWeek === 5 || dayOfWeek === 6; // Friday or Saturday
            const isFutureDate =
              new Date(currentDate.getFullYear(), currentDate.getMonth(), day) >
              new Date();
            const customHoliday = holidays.find((h) => h.date === dateStr);

            const entry = attendanceData.find((d) => d.date === dateStr);
            let status = entry ? entry.dayStatus : "Unavailable";

            // Keep future dates as unavailable (same as past dates without data)
            // Only holidays should override the unavailable status

            if (isWeeklyHoliday || customHoliday) {
              status = "Holiday";
            }

            const today = new Date();
            const isToday =
              day === today.getDate() &&
              currentDate.getMonth() === today.getMonth() &&
              currentDate.getFullYear() === today.getFullYear();

            const dayClasses = [
              "relative w-full h-12 sm:h-16 flex items-center justify-center rounded-lg transition-all attendance-base duration-200 text-sm sm:text-base cursor-pointer hover:scale-105",
              getStatusColor(status),
              isToday ? "ring-1 ring-primary shadow shadow-primary" : "",
            ];

            return (
              <CalendarTooltip
                key={day}
                entry={entry}
                holidayInfo={
                  customHoliday
                    ? { name: customHoliday.name }
                    : isWeeklyHoliday
                    ? { name: "Weekly Holiday" }
                    : null
                }
              >
                <div className={dayClasses.join(" ")}>
                  <div className="flex items-center justify-center gap-1">
                    {(status === "Error" || status === "No Change") &&
                      getStatusIcon(status)}
                    <span>{day}</span>
                    {status !== "Error" &&
                      status !== "No Change" &&
                      getStatusIcon(status)}
                  </div>
                </div>
              </CalendarTooltip>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "./ui/button";

const CalendarTooltip = ({ entry, holidayInfo, children }) => {
  if (!entry && !holidayInfo) return <>{children}</>;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent>
          {holidayInfo && <p className="font-bold">{holidayInfo.name}</p>}
          {entry && holidayInfo && <hr className="my-1 border-border" />}
          {entry && (
            <>
              <p className="font-bold">{entry.date}</p>
              <p>
                Status:{" "}
                <span
                  className={`font-semibold ${
                    entry.dayStatus === "Present"
                      ? "text-success"
                      : entry.dayStatus === "Absent"
                      ? "text-destructive"
                      : entry.dayStatus === "Leave"
                      ? "text-warning"
                      : entry.dayStatus === "Error"
                      ? "text-destructive"
                      : "text-muted-foreground"
                  }`}
                >
                  {entry.dayStatus}
                </span>
              </p>
              <hr className="my-1 border-border" />
              {entry.data ? (
                <>
                  <p>
                    Working Days:{" "}
                    <span className="font-semibold text-muted-foreground">
                      {entry.data.workingDays}
                    </span>
                  </p>
                  <p>
                    Present:{" "}
                    <span className="font-semibold text-muted-foreground">
                      {entry.data.present}
                    </span>
                  </p>
                  <p>
                    Absent:{" "}
                    <span className="font-semibold text-muted-foreground">
                      {entry.data.absent}
                    </span>
                  </p>
                  <p>
                    Leave:{" "}
                    <span className="font-semibold text-muted-foreground">
                      {entry.data.leave}
                    </span>
                  </p>
                </>
              ) : entry.dayStatus === "Error" && entry.error ? (
                <div className="text-destructive">
                  <p className="font-semibold">Error Details:</p>
                  <p className="text-xs mt-1">{entry.error}</p>
                </div>
              ) : (
                <p className="text-destructive">
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
        return "bg-success/50 border border-success";
      case "Absent":
        return "bg-destructive/50 border border-destructive";
      case "Leave":
        return "bg-warning/50 border border-warning";
      case "Error":
        return "bg-destructive/50 border border-destructive";
      case "No Change":
        return "bg-accent/50 border border-accent-foreground";
      case "Unavailable":
        return "bg-muted/5 border border-muted-foreground";
      case "Holiday":
        return "bg-muted/40 border border-muted-foreground";
      default:
        return "border-transparent";
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <Button variant="outline" size="icon" onClick={() => changeMonth(-1)}>
          &lt;
        </Button>
        <CardTitle className="text-xl sm:text-2xl font-semibold text-center">
          {currentDate.toLocaleString("default", {
            month: "long",
            year: "numeric",
          })}
        </CardTitle>
        <Button variant="outline" size="icon" onClick={() => changeMonth(1)}>
          &gt;
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center">
          {daysOfWeek.map((day) => (
            <div
              key={day}
              className="font-bold text-primary text-xs sm:text-base"
            >
              <span className="hidden sm:inline">{day}</span>
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

            if (isFutureDate && status === "Unavailable") {
              // Don't mark future dates as unavailable unless they are holidays
              status = null;
            }

            if (isWeeklyHoliday || customHoliday) {
              status = "Holiday";
            }

            const today = new Date();
            const isToday =
              day === today.getDate() &&
              currentDate.getMonth() === today.getMonth() &&
              currentDate.getFullYear() === today.getFullYear();

            const dayClasses = [
              "w-full h-12 sm:h-16 flex items-center justify-center rounded-lg transition-colors text-sm sm:text-base",
              getStatusColor(status),
              isToday ? "border-2 border-primary" : "border",
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
                <div className={dayClasses.join(" ")}>{day}</div>
              </CalendarTooltip>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

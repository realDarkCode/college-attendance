import { useState, useEffect } from "react";

export default function Calendar({
  attendanceData,
  currentDate,
  setCurrentDate,
}) {
  const [holidays, setHolidays] = useState([]);

  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const res = await fetch("/api/holidays");
        const data = await res.json();
        setHolidays(data);
      } catch (error) {
        console.error("Failed to fetch holidays:", error);
      }
    };
    fetchHolidays();
  }, []);

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
        return "bg-green-500/50 border border-green-400";
      case "Absent":
        return "bg-red-500/50 border border-red-400";
      case "Leave":
        return "bg-yellow-500/50 border border-yellow-400";
      case "No Change":
        return "bg-gray-600/90 border border-gray-500";
      case "Unavailable":
        return "bg-gray-700/05 border border-gray-600";
      case "Holiday":
        return "bg-blue-500/40 border border-blue-400";
      default:
        return "border-transparent";
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => changeMonth(-1)}
          className="bg-gray-700 hover:bg-gray-600 p-2 rounded-full"
        >
          &lt;
        </button>
        <h2 className="text-2xl font-semibold">
          {currentDate.toLocaleString("default", {
            month: "long",
            year: "numeric",
          })}
        </h2>
        <button
          onClick={() => changeMonth(1)}
          className="bg-gray-700 hover:bg-gray-600 p-2 rounded-full"
        >
          &gt;
        </button>
      </div>
      <div className="grid grid-cols-7 gap-2 text-center">
        {daysOfWeek.map((day) => (
          <div key={day} className="font-bold text-cyan-400">
            {day}
          </div>
        ))}
        {Array.from({ length: startingDay }).map((_, index) => (
          <div key={`empty-${index}`} className="w-full h-16"></div>
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
          const isCustomHoliday = holidays.includes(dateStr);

          const entry = attendanceData.find((d) => d.date === dateStr);
          let status = entry ? entry.dayStatus : "Unavailable";

          if (isFutureDate && status === "Unavailable") {
            // Don't mark future dates as unavailable unless they are holidays
            status = null;
          }

          if (isWeeklyHoliday || isCustomHoliday) {
            status = "Holiday";
          }

          const today = new Date();
          const isToday =
            day === today.getDate() &&
            currentDate.getMonth() === today.getMonth() &&
            currentDate.getFullYear() === today.getFullYear();

          return (
            <div key={day} className="relative group">
              <div
                className={`w-full h-16 flex items-center justify-center rounded-lg transition-colors ${getStatusColor(
                  status
                )} ${isToday ? "border-2 border-cyan-400" : ""}`}
              >
                {day}
              </div>
              {entry && (
                <div className="absolute bottom-full mb-2 w-max p-2 bg-gray-900 border border-gray-600 rounded-md shadow-lg text-xs text-left opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  <p className="font-bold">{entry.date}</p>
                  <p>
                    Status:{" "}
                    <span
                      className={`font-semibold ${
                        status === "Present"
                          ? "text-green-400"
                          : status === "Absent"
                          ? "text-red-400"
                          : status === "Leave"
                          ? "text-yellow-400"
                          : "text-blue-400"
                      }`}
                    >
                      {status}
                    </span>
                  </p>
                  <hr className="my-1 border-gray-600" />
                  <p>Present: {entry.data.present}</p>
                  <p>Absent: {entry.data.absent}</p>
                  <p>Leave: {entry.data.leave}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

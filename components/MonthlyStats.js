export default function MonthlyStats({
  attendanceData,
  currentDate,
  holidays = [],
}) {
  const stats = attendanceData
    .filter((entry) => {
      const entryDate = new Date(entry.date);

      // Check if the entry is within the current month
      const isCurrentMonth =
        entryDate.getFullYear() === currentDate.getFullYear() &&
        entryDate.getMonth() === currentDate.getMonth();

      if (!isCurrentMonth) {
        return false;
      }

      // Exclude error entries from counting
      if (entry.dayStatus === "Error") {
        return false;
      }

      // Check for weekly holidays (Friday or Saturday)
      const dayOfWeek = entryDate.getDay();
      if (dayOfWeek === 5 || dayOfWeek === 6) {
        return false;
      }

      // Check for custom holidays
      const isCustomHoliday = holidays.some((h) => h.date === entry.date);
      if (isCustomHoliday) {
        return false;
      }

      return true;
    })
    .reduce(
      (acc, entry) => {
        if (entry.dayStatus === "Present") acc.present++;
        if (entry.dayStatus === "Absent") acc.absent++;
        if (entry.dayStatus === "Leave") acc.leave++;
        return acc;
      },
      { present: 0, absent: 0, leave: 0 }
    );

  // Calculate total working days
  const totalWorkingDays = stats.present + stats.absent + stats.leave;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <StatCard
        title="Present Days"
        value={stats.present}
        color="text-green-400"
      />
      <StatCard title="Absent Days" value={stats.absent} color="text-red-400" />
      <StatCard
        title="Leaves Taken"
        value={stats.leave}
        color="text-yellow-400"
      />
      <StatCard
        title="Total Working Days"
        value={totalWorkingDays}
        color="text-cyan-400"
      />
    </div>
  );
}

function StatCard({ title, value, color, subtitle }) {
  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg text-center">
      <p className="text-sm text-gray-400">{title}</p>
      <p className={`text-3xl sm:text-4xl font-bold ${color}`}>{value}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );
}

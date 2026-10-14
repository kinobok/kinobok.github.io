import React from "react";

interface DateSelectorProps {
  dates: string[];
  selectedDate: string;
  onDateChange: (date: string) => void;
  matchCounts?: Record<string, number>;
  isInline?: boolean;
  isDatePast?: (date: string) => boolean;
}

export default function DateSelector({
  dates,
  selectedDate,
  onDateChange,
  matchCounts,
  isInline = false,
  isDatePast,
}: DateSelectorProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const weekday = date.toLocaleDateString("en-GB", { weekday: "short" });
    const day = date.toLocaleDateString("en-GB", { day: "numeric" });
    const month = date.toLocaleDateString("en-GB", { month: "short" });
    return { weekday, day, month };
  };

  const defaultIsDatePast = (dateStr: string) => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return dateStr < `${year}-${month}-${day}`;
  };

  const checkIsPast = isDatePast || defaultIsDatePast;

  return (
    <div className={isInline ? "date-selector-inline" : "date-selector"}>
      <div className="date-scroll">
        {dates.map((date) => {
          const { weekday, day, month } = formatDate(date);
          const isActive = date === selectedDate;
          const isPast = checkIsPast(date);
          const count = matchCounts ? matchCounts[date] || 0 : 0;

          return (
            <button
              key={date}
              className={`date-button ${isActive ? "active" : ""} ${isPast ? "past" : ""}`}
              onClick={() => onDateChange(date)}
              style={{ position: "relative" }}
            >
              <span className="date-weekday">{weekday}</span>
              <span className="date-day">{day}</span>
              <span className="date-month">{month}</span>
              {count > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "-5px",
                    right: "-5px",
                    background: isPast
                      ? "rgba(100, 100, 100, 0.6)"
                      : "var(--lb-green)",
                    color: isPast ? "#bbb" : "#000",
                    fontSize: "0.7em",
                    fontWeight: "bold",
                    padding: "2px 6px",
                    borderRadius: "10px",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
                  }}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

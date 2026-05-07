import React from "react";

interface DateSelectorProps {
  dates: string[];
  selectedDate: string;
  onDateChange: (date: string) => void;
}

export default function DateSelector({
  dates,
  selectedDate,
  onDateChange,
}: DateSelectorProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const weekday = date.toLocaleDateString("en-GB", { weekday: "short" });
    const day = date.toLocaleDateString("en-GB", { day: "numeric" });
    const month = date.toLocaleDateString("en-GB", { month: "short" });
    return { weekday, day, month };
  };

  return (
    <div className="date-selector">
      <div className="date-scroll">
        {dates.map((date) => {
          const { weekday, day, month } = formatDate(date);
          const isActive = date === selectedDate;

          return (
            <button
              key={date}
              className={`date-button ${isActive ? "active" : ""}`}
              onClick={() => onDateChange(date)}
            >
              <span className="date-weekday">{weekday}</span>
              <span className="date-day">{day}</span>
              <span className="date-month">{month}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

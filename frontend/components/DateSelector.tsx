import React from "react";

interface DateSelectorProps {
  dates: string[];
  selectedDate: string;
  onDateChange: (date: string) => void;
  matchCounts?: Record<string, number>;
}

export default function DateSelector({
  dates,
  selectedDate,
  onDateChange,
  matchCounts,
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
          const count = matchCounts ? matchCounts[date] || 0 : 0;

          return (
            <button
              key={date}
              className={`date-button ${isActive ? "active" : ""}`}
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
                    background: "var(--lb-green)",
                    color: "#000",
                    fontSize: "0.7em",
                    fontWeight: "bold",
                    padding: "2px 6px",
                    borderRadius: "10px",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.3)"
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

"use client";

import { useState } from "react";

const daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

interface calendarProps {
  startDate: Date | null;
  endDate: Date | null;
  onDateChange: (type: "start" | "end", date: Date) => void;
  onConfirm: (range: string) => void;
  onCancel: () => void;
  forceDark?: boolean;
}

const CalendarPicker = ({
  startDate,
  endDate,
  onDateChange,
  onConfirm,
  onCancel,
  forceDark = true,
}: calendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selecting, setSelecting] = useState<"start" | "end">("start");

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const today = new Date();

  const changeMonth = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentDate(new Date(year, parseInt(e.target.value), 1));
  };

  const changeYear = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentDate(new Date(parseInt(e.target.value), month, 1));
  };

  const handleDateClick = (day: number) => {
    const selected = new Date(year, month, day);

    if (selected > today) return;

    if (selecting === "start" && endDate && selected > endDate) return;
    if (selecting === "end" && startDate && selected < startDate) return;

    onDateChange(selecting, selected);
  };

  const isSameDay = (d1: Date, d2: Date) =>
    d1.toDateString() === d2.toDateString();

  const isBetween = (date: Date) => {
    if (!startDate || !endDate) return false;
    return date > startDate && date < endDate;
  };

  const getDayStyle = (day: number) => {
    const thisDate = new Date(year, month, day);

    if (thisDate > today) return `cursor-not-allowed ${forceDark ? "text-text-muted" : "text-text-main"}`;

    const base = "py-1 rounded hover:bg-blue-100";
    if (startDate && isSameDay(thisDate, startDate))
      return `${base} bg-bg-primary text-text-on-primary rounded-l-full`;
    if (endDate && isSameDay(thisDate, endDate))
      return `${base} bg-bg-primary text-text-on-primary rounded-r-full`;
    if (isBetween(thisDate)) return `${base} bg-bg-card text-gray-900`;

    return `${base} text-gray-800 bg-white`;
  };

  return (
    <div className={`p-0.5 rounded-lg text-small space-y-3
  ${forceDark ? "bg-bg-navbar shadow-md" : "bg-bg-navbar"}
`}>
      <div className="flex justify-between m-0.5">
        <div className={`flex flex-col items-center
          ${forceDark ? "text-text-primary" : "text-text-alt-primary"}
          `}>
          <select
            value={month}
            onChange={changeMonth}
            className="border px-1 py-0.5 rounded mb-[2px] w-[65px]"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i} value={i}>
                {new Date(0, i).toLocaleString("default", { month: "short" })}
              </option>
            ))}
          </select>
          <select
            value={year}
            onChange={changeYear}
            className="border px-1 py-0.5 rounded w-[65px]"
          >
            {Array.from({ length: 21 }, (_, i) => {
              const currentYear = new Date().getFullYear();
              const yearOption = currentYear - 10 + i;
              return (
                <option key={yearOption} value={yearOption}>
                  {yearOption}
                </option>
              );
            })}
          </select>
        </div>
        <div className={`flex flex-col items-center text-small space-y-1 bg-bg p-1 rounded
        ${forceDark ? "text-text-muted" : "text-text-main"}`}>
          <button
            className={`px-3 py-1 rounded border border-bg-primary w-[60px]
              ${selecting === "start"
                ? `bg-bg-primary ${forceDark ? "text-text-on-primary" : "text-text-main"}`
                : "bg-gray-100 text-gray-700"
              }`}
            onClick={() => setSelecting("start")}
          >
            Start
          </button>
          <span className="text-extra-small">{startDate ? startDate.toISOString().slice(0, 10) : "None"}</span>
        </div>
        <div className={`flex flex-col items-center text-small space-y-1 bg-bg p-1 rounded
        ${forceDark ? "text-text-muted" : "text-text-main"}`}>
          <button
            className={`px-3 py-1 rounded border border-bg-primary w-[60px]
              ${selecting === "end"
                ? `bg-bg-primary ${forceDark ? "text-text-on-primary" : "text-text-main"}`
                : "bg-gray-100 text-gray-700"
              }`}
            onClick={() => setSelecting("end")}
          >
            End
          </button>
          <span className="text-extra-small">{endDate ? endDate.toISOString().slice(0, 10) : "None"}</span>
        </div>
      </div>

      <div className={`grid grid-cols-7 gap-1 text-center
        ${forceDark ? "text-text-muted" : "text-text-main"}`}>
        {daysOfWeek.map((d) => (
          <div key={d} className="font-medium">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {Array.from({ length: firstDay }, (_, i) => (
          <div key={`empty-${i}`} />
        ))}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            return (
              <button
                key={day}
                onClick={() => handleDateClick(day)}
                className={getDayStyle(day)}
              >
                {day}
              </button>

            );
          })}
      </div>
      <div className="flex flex-row-reverse gap-extra-small mt-extra-small place-content-between">
        <button
          onClick={() => {
            if (startDate && endDate) {
              const range = `${startDate.toISOString().slice(0, 10)}|${endDate
                .toISOString()
                .slice(0, 10)}`;
              onConfirm(range);
            }
          }}
          className={`bg-bg-primary rounded p-extra-small text-small
            ${forceDark ? "text-text-on-cancel" : "text-text-main"}`}
        >
          Confirmar
        </button>
        <button
          onClick={onCancel}
          className={`bg-bg-cancel rounded p-extra-small
            ${forceDark ? "text-text-on-cancel" : "text-text-main"}`}
        >
          Cancelar
        </button>
      </div>
    </div>
  );
};

export default CalendarPicker;

import React, { useState } from "react";
import InputComponent from "@/components/Forms/InputComponent";

type DaysPickerProps = {
  DefaultDates: number[];
  selectedDate: number;
  setIsVisibleDateRange: (visible: boolean) => void;
  onBack: () => void;
  onSelect: (selected: number) => void;
  onClose: () => void;
};

export default function DaysPicker({
  DefaultDates,
  selectedDate,
  setIsVisibleDateRange,
  onBack,
  onSelect,
  onClose,
}: DaysPickerProps) {
  const handleDayClick = (date: number) => {
    onSelect(date);
    onClose();
  };

  const [customInput, setCustomInput] = useState("");

  const handleCustomInput = () => {
    const parsed = parseInt(customInput);
    if (!isNaN(parsed) && parsed > 0) {
      onSelect(parsed);
      onClose();
    }
  };

  return (
    <>
      <div className="grid grid-cols-3 gap-extra-small">
        {DefaultDates.map((date) => (
          <button
            key={date}
            onClick={() => handleDayClick(date)}
            className={`px-1 rounded border w-auto h-8 self-center items-center text-extra-small ${
              selectedDate === date
                ? "bg-bg-primary text-text-main"
                : "bg-bg-overlay"
            }`}
          >
            {date === 0
              ? "Today"
              : date === 1
              ? "Yesterday"
              : date === 100000
              ? "All"
              : `${date}`}
          </button>
        ))}
      </div>
      <div className="flex w-full items-center gap-2 text-small">
        Custom:
        <InputComponent
          type="number"
          min="1"
          placeholder="days"
          defaultValue={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          classType="extraSmall"
        />
        <button
          onClick={handleCustomInput}
          className="bg-bg-primary text-text-main rounded p-extra-small"
        >
          Enter
        </button>
      </div>
      <button
        onClick={() => setIsVisibleDateRange(true)}
        className="bg-bg-primary text-text-main rounded p-extra-small text-small"
      >
        Custom Range
      </button>
      <button
        onClick={onBack}
        className="p-extra-small rounded bg-gray-200 hover:bg-gray-300 text-gray-800 text-small"
      >
        Back
      </button>
    </>
  );
}

import { useState } from "react";
import CalendarPicker from "@/components/PeriodSelector/CalendarPicker";
import FilterCard from "@/components/Sidebar/filterCard";
import DaysPicker from "./DaysPicker";

interface PeriodSelectorProps {
  onClose: () => void;
  previousSelectedDates: number | string;
  onSelect: (selected: number | string) => void;
}

const PeriodSelector = ({
  onClose,
  previousSelectedDates,
  onSelect,
}: PeriodSelectorProps) => {
  const DefaultDates = [0, 1, 3, 7, 15, 30, 60, 90, 100000];
  const selectedDate = previousSelectedDates;
  const [isVisibleDateRange, setIsVisibleDateRange] = useState<boolean>(false);

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const handleDateChange = (type: "start" | "end", date: Date) => {
    if (type === "start") setStartDate(date);
    else setEndDate(date);
  };
  const handleSelect = (date: number) => {
    onSelect(date); // comunica para o CampaignsOverview
    onClose(); // fecha o seletor
  };

  return (
    <FilterCard>
      {!isVisibleDateRange && (
        <DaysPicker
          DefaultDates={DefaultDates}
          selectedDate={selectedDate as number}
          setIsVisibleDateRange={setIsVisibleDateRange}
          onBack={onClose}
          onSelect={handleSelect}
          onClose={onClose}
        />
      )}
      {isVisibleDateRange && (
        <div>
          <CalendarPicker
            startDate={startDate}
            endDate={endDate}
            onDateChange={handleDateChange}
            onConfirm={(range) => {
              onSelect(range);
              onClose();
            }}
            onCancel={() => setIsVisibleDateRange(false)}
          />
        </div>
      )}
    </FilterCard>
  );
};

export default PeriodSelector;

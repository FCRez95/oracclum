import React, { useState } from "react";
import InputComponent from "@/components/Forms/InputComponent";
import CalendarPicker from "@/components/PeriodSelector/CalendarPicker";

type tabDaysPickerProps = {
    DefaultDates: number[];
    selectedDates: number[];
    onSelect: (selected: number[]) => void;
    onClose: () => void;
};

export default function TabDaysPicker({
    DefaultDates,
    selectedDates,
    onSelect,
    onClose,
}: tabDaysPickerProps) {
    const [customInput, setCustomInput] = useState("");
    const [showCalendar, setShowCalendar] = useState(false);
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);

    // Toggle seleção de datas
    const handleDayClick = (date: number) => {
        let newSelected: number[];
        if (selectedDates.includes(date)) {
            newSelected = selectedDates.filter((d) => d !== date);
        } else {
            newSelected = [...selectedDates, date];
        }
        onSelect(newSelected);
    };

    const handleCustomInput = () => {
        const parsed = parseInt(customInput);
        if (!isNaN(parsed) && parsed > 0) {
            onSelect([...selectedDates, parsed]);
            onClose();
        }
    };

    // Handler para confirmar o range do calendário
    const handleCalendarConfirm = (range: string) => {
        onSelect([...selectedDates, range as unknown as number]);
        setShowCalendar(false);
        onClose();
    };

    // Handler para cancelar o calendário
    const handleCalendarCancel = () => {
        setShowCalendar(false);
    };

    return (
        <>
            {!showCalendar ? (
                <>
                    {selectedDates.length > 0 && (
                        <button
                            onClick={() => onSelect([])}
                            className="text-white text-xs underline mb-extra-small self-end"
                        >
                            Limpar
                        </button>
                    )}
                    <div className="grid grid-cols-3 gap-extra-small">
                        {DefaultDates.map((date) =>
                            date === 100000 ? (
                                <button
                                    key="all"
                                    onClick={() =>
                                        selectedDates.includes(100000)
                                            ? onSelect(selectedDates.filter((d) => d !== 100000))
                                            : onSelect([...selectedDates, 100000])
                                    }
                                    className={`px-1 rounded border w-auto h-medium self-center items-center text-small border-bg-primary ${selectedDates.includes(100000)
                                        ? "bg-bg-primary text-text-main"
                                        : "bg-bg-main text-text-alt-primary"
                                        }`}
                                >
                                    All
                                </button>
                            ) : (
                                <button
                                    key={date}
                                    onClick={() => handleDayClick(date)}
                                    className={`px-1 rounded border w-auto h-medium self-center items-center text-small border-bg-primary  ${selectedDates.includes(date)
                                        ? "bg-bg-primary text-text-main"
                                        : "bg-bg-main text-text-alt-primary"
                                        }`}
                                >
                                    {date === 0
                                        ? "Today"
                                        : date === 1
                                            ? "Yesterday"
                                            : `${date}`}
                                </button>
                            )
                        )}
                    </div>

                    <div className="flex flex-col gap-extra-small mt-extra-small">
                        <div className="flex w-full items-center gap-extra-small text-text-alt-primary">
                            Custom:
                            <InputComponent
                                type="number"
                                min="1"
                                placeholder="days"
                                defaultValue={customInput}
                                onChange={(e) => setCustomInput(e.target.value)}
                                classType="app"
                            />
                            <button
                                onClick={handleCustomInput}
                                className="mt-extra-small bg-bg-primary text-text-main rounded p-1"
                            >
                                ENTER
                            </button>
                        </div>
                        <button
                            onClick={() => setShowCalendar(true)}
                            className="bg-bg-primary text-text-main rounded p-1 mt-2"
                        >
                            Custom Range
                        </button>
                    </div>
                </>
            ) : (
                <div>
                    <CalendarPicker
                        startDate={startDate}
                        endDate={endDate}
                        onDateChange={(type, date) => {
                            if (type === "start") setStartDate(date);
                            else setEndDate(date);
                        }}
                        onConfirm={handleCalendarConfirm}
                        onCancel={handleCalendarCancel}
                        forceDark={false}
                    />
                </div>
            )}
        </>
    );
}
import { format } from "date-fns";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./DateSelector.css";

interface DateSelectorProps {
  selectedDate: Date;
  onChange: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
}

export function DateSelector({
  selectedDate,
  onChange,
  minDate,
  maxDate,
}: DateSelectorProps) {
  const handleChange = (value: Date | Date[] | null) => {
    if (!value) return;

    const nextDate = Array.isArray(value) ? value[0] : value;
    if (nextDate instanceof Date) {
      onChange(nextDate);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-900 dark:text-slate-100">
          Chon ngay
        </h3>
        <span className="text-sm text-gray-500 dark:text-slate-400">
          {format(selectedDate, "dd/MM/yyyy")}
        </span>
      </div>
      <div className="react-calendar-wrapper">
        <Calendar
          value={selectedDate}
          onChange={handleChange as (value: unknown) => void}
          minDate={minDate}
          maxDate={maxDate}
          tileDisabled={({ date }) => {
            if (minDate && date < minDate) return true;
            if (maxDate && date > maxDate) return true;
            return false;
          }}
        />
      </div>
    </div>
  );
}


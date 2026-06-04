import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./DateSelector.css";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
    <div className="react-calendar-wrapper w-full">
      <Calendar
        value={selectedDate}
        onChange={handleChange as (value: unknown) => void}
        minDate={minDate}
        maxDate={maxDate}
        prev2Label={null}
        next2Label={null}
        prevLabel={<ChevronLeft size={18} className="mx-auto text-slate-600 hover:text-slate-900" />}
        nextLabel={<ChevronRight size={18} className="mx-auto text-slate-600 hover:text-slate-900" />}
        tileDisabled={({ date }) => {
          if (minDate && date < minDate) return true;
          if (maxDate && date > maxDate) return true;
          return false;
        }}
      />
    </div>
  );
}


import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  DayPicker,
  SelectMultipleEventHandler,
  SelectRangeEventHandler,
} from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function CalendarWithTime({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | undefined>(
    undefined
  );

  const timeOptions = Array.from({ length: 20 }, (_, i) => {
    const hours = Math.floor(i / 2) + 9; // Start from 9:00 AM
    const minutes = i % 2 === 0 ? "00" : "30";
    return `${hours.toString().padStart(2, "0")}:${minutes}`;
  });

  const handleDateChange = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedTime(undefined); // Reset time if date changes
  };

  const handleTimeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTime(event.target.value);
  };

  return (
    <div className="space-y-4">
      <DayPicker
        mode="single"
        showOutsideDays={showOutsideDays}
        className={cn("p-3", className)}
        classNames={{
          months:
            "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
          month: "space-y-4",
          caption: "flex justify-center pt-1 relative items-center",
          caption_label: "text-sm font-medium",
          nav: "space-x-1 flex items-center",
          nav_button: cn(
            buttonVariants({ variant: "outline" }),
            "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
          ),
          nav_button_previous: "absolute left-1",
          nav_button_next: "absolute right-1",
          table: "w-full border-collapse space-y-1",
          head_row: "flex",
          head_cell:
            "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
          row: "flex w-full mt-2",
          cell: cn(
            "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected].day-range-end)]:rounded-r-md",
            props.mode === "range"
              ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
              : "[&:has([aria-selected])]:rounded-md"
          ),
          day: cn(
            buttonVariants({ variant: "ghost" }),
            "h-8 w-8 p-0 font-normal aria-selected:opacity-100"
          ),
          day_range_start: "day-range-start",
          day_range_end: "day-range-end",
          day_selected:
            "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
          day_today: "bg-accent text-accent-foreground",
          day_outside:
            "day-outside text-muted-foreground aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
          day_disabled: "text-muted-foreground opacity-50",
          day_range_middle:
            "aria-selected:bg-accent aria-selected:text-accent-foreground",
          day_hidden: "invisible",
          ...classNames,
        }}
        components={{
          IconLeft: ({ className, ...props }) => (
            <ChevronLeft className={cn("h-4 w-4", className)} {...props} />
          ),
          IconRight: ({ className, ...props }) => (
            <ChevronRight className={cn("h-4 w-4", className)} {...props} />
          ),
        }}
        selected={selectedDate}
        onSelect={(date) => handleDateChange(date as Date | undefined)}
        {...props}
      />
      {selectedDate && (
        <div className="space-y-2">
          <label className="block text-sm font-medium">Select a time:</label>
          <select
            className="w-full p-2 border rounded-md"
            value={selectedTime || ""}
            onChange={handleTimeChange}
          >
            <option value="" disabled>
              -- Select Time --
            </option>
            {timeOptions.map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
        </div>
      )}
      {selectedDate && selectedTime && (
        <p className="mt-4 text-sm">
          Selected Date & Time:{" "}
          <strong>
            {selectedDate.toLocaleDateString()} at {selectedTime}
          </strong>
        </p>
      )}
    </div>
  );
}

CalendarWithTime.displayName = "CalendarWithTime";

export { CalendarWithTime };

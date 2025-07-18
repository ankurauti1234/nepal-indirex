"use client";

import { useId, useState, useEffect } from "react";
import { format, addDays } from "date-fns";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  onDateChange: (date: string) => void;
  initialDate: string;
}

export function DatePicker({ onDateChange, initialDate }: DatePickerProps) {
  const id = useId();
  const [date, setDate] = useState<Date | undefined>(new Date(initialDate));

  useEffect(() => {
    if (date) {
      console.log("Selected date:", format(date, "yyyy-MM-dd")); // Debug log
      onDateChange(format(date, "yyyy-MM-dd"));
    }
  }, [date, onDateChange]);

  const handlePrevDay = () => {
    if (date) setDate(addDays(date, -1));
  };

  const handleNextDay = () => {
    if (date) setDate(addDays(date, 1));
  };

  return (
    <div className="flex items-center gap-1 w-64">
      <Button
        variant="secondary"
        size="icon"
        onClick={handlePrevDay}
        disabled={!date}
      >
        <ChevronLeft />
      </Button>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant={"outline"}
            className="group bg-background hover:bg-background border-input w-full max-w-44 justify-between px-3 font-normal outline-offset-0 outline-none focus-visible:outline-[3px]"
          >
            <span className={cn("truncate", !date && "text-muted-foreground")}>
              {date ? format(date, "PPP") : "Pick a date"}
            </span>
            <CalendarIcon
              size={16}
              className="text-muted-foreground/80 group-hover:text-foreground shrink-0 transition-colors"
              aria-hidden="true"
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="start">
          <Calendar mode="single" selected={date} onSelect={setDate} />
        </PopoverContent>
      </Popover>
      <Button
        variant="secondary"
        size="icon"
        onClick={handleNextDay}
        disabled={!date}
      >
        <ChevronRight />
      </Button>
    </div>
  );
}
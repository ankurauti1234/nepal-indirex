"use client"
import { useState } from "react"
import { Slider } from "@/components/ui/slider"

interface DualRangeSliderProps {
  onValueChange: (value: [number, number]) => void
}

function formatHour(value: number) {
  const hours = Math.floor(value)
  const minutes = value % 1 === 0.5 ? "30" : "00"
  return `${String(hours).padStart(2, "0")}:${minutes}`
}

export function DualRangeSlider({ onValueChange }: DualRangeSliderProps) {
  const [value, setValue] = useState<[number, number]>([0, 23.5])
  const tickValues = Array.from({ length: 48 }, (_, i) => i * 0.5)

  const handleValueChange = (val: [number, number]) => {
    console.log("Time range changed:", val) // Debug log
    setValue(val)
    onValueChange(val)
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2">
        <output className="text-sm font-medium tabular-nums">
          {formatHour(value[0])} - {formatHour(value[1])}
        </output>
      </div>
      <div className="relative p-2 bg-muted">
        <Slider
          min={0}
          max={23.5}
          step={0.5}
          value={value}
          onValueChange={handleValueChange}
          aria-label="Dual range slider for 24-hour time"
          className="border h-3 rounded-xs bg-secondary shadow-inner grow [&>*>span]:rounded"
        />
        <div className="absolute inset-x-0 top-full flex justify-between text-xs text-muted-foreground overflow-hidden p-4 py-0 border-t">
          {tickValues.map((val, idx) => (
            <div key={idx} className="relative flex flex-col items-center w-0">
              <div className="h-2 w-px bg-muted-foreground" />
              {val % 1 === 0 && <div className="mt-0.5 whitespace-nowrap">{formatHour(val)}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

"use client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Series {
  id: string
  name: string
}

interface SeriesSelectorProps {
  series: Series[]
  selectedSeriesId: string
  onSelectSeries: (seriesId: string) => void
}

export function SeriesSelector({ series, selectedSeriesId, onSelectSeries }: SeriesSelectorProps) {
  return (
    <Select value={selectedSeriesId} onValueChange={onSelectSeries}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select Series" />
      </SelectTrigger>
      <SelectContent>
        {series.map((s) => (
          <SelectItem key={s.id} value={s.id}>
            {s.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

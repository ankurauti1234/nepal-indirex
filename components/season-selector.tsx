"use client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Season {
  id: string
  name: string
}

interface SeasonSelectorProps {
  seasons: Season[]
  selectedSeasonId: string
  onSelectSeason: (seasonId: string) => void
}

export function SeasonSelector({ seasons, selectedSeasonId, onSelectSeason }: SeasonSelectorProps) {
  return (
    <Select value={selectedSeasonId} onValueChange={onSelectSeason}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select Season" />
      </SelectTrigger>
      <SelectContent>
        {seasons.map((season) => (
          <SelectItem key={season.id} value={season.id}>
            {season.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

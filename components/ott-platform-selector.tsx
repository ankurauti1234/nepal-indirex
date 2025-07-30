"use client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Platform {
  id: string
  name: string
}

interface OttPlatformSelectorProps {
  platforms: Platform[]
  selectedPlatformId: string
  onSelectPlatform: (platformId: string) => void
}

export function OttPlatformSelector({ platforms, selectedPlatformId, onSelectPlatform }: OttPlatformSelectorProps) {
  return (
    <Select value={selectedPlatformId} onValueChange={onSelectPlatform}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select Platform" />
      </SelectTrigger>
      <SelectContent>
        {platforms.map((platform) => (
          <SelectItem key={platform.id} value={platform.id}>
            {platform.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

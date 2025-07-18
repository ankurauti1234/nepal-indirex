import React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

type ProgramBlockType = "program" | "ad" | "not_detected";

interface ProgramBlockProps {
  type?: ProgramBlockType;
  name?: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  image?: string;
  channel?: string;
  brand?: string | null;
  sector?: string | null;
  category?: string | null;
  timeRangeStart?: number; // Seconds of the start of the time range
  pixelsPerSecond?: number; // Scaling factor for zoom
}

export const ProgramBlock = ({
  type = "not_detected",
  name = "Unknown Content",
  description = "No description available",
  startTime = "00:00:00",
  endTime = "00:00:00",
  image = "https://picsum.photos/200/300",
  channel = "Unknown Channel",
  brand = null,
  sector = null,
  category = null,
  timeRangeStart = 0,
  pixelsPerSecond = 360 / 3600, // Default: 0.1px per second
}: ProgramBlockProps) => {
  const typeConfig: Record<
    ProgramBlockType,
    {
      bgColor: string;
      borderColor: string;
      hoverColor: string;
      badgeText: string;
      badgeColor: string;
    }
  > = {
    program: {
      bgColor: "bg-blue-500/50",
      borderColor: "border-blue-500",
      hoverColor: "hover:bg-blue-500/75",
      badgeText: "Program",
      badgeColor: "bg-blue-500",
    },
    ad: {
      bgColor: "bg-amber-500/50",
      borderColor: "border-amber-500",
      hoverColor: "hover:bg-amber-500/75",
      badgeText: "Ad",
      badgeColor: "bg-amber-500",
    },
    not_detected: {
      bgColor: "bg-gray-500/50",
      borderColor: "border-gray-500",
      hoverColor: "hover:bg-gray-500/75",
      badgeText: "Not Detected",
      badgeColor: "bg-gray-500",
    },
  };

  const config = typeConfig[type];
  const duration = calculateDuration(startTime, endTime);

  const durationSeconds = timeToSeconds(endTime) - timeToSeconds(startTime);
  const calculatedWidth = Math.max(durationSeconds * pixelsPerSecond, 96); // Min width 96px
  const leftPosition = (timeToSeconds(startTime) - timeRangeStart) * pixelsPerSecond;

  return (
    <Sheet>
      <SheetTrigger>
        <div
          className={`${config.bgColor} h-32 border ${config.borderColor} flex p-2 cursor-pointer ${config.hoverColor} transition-colors duration-300 flex-col gap-2 overflow-hidden top-0 z-10`}
          style={{
            position: "absolute",
            left: `${leftPosition}px`,
            width: `${calculatedWidth}px`,
          }}
        >
          <Badge className={`${config.badgeColor} text-white w-fit`}>
            <span className="text-xs">{config.badgeText}</span>
          </Badge>
          <div className="flex items-center gap-2">
            <div className="size-12">
              <img
                src={image}
                alt={name}
                className="rounded-md h-full w-full object-cover"
                onError={(e) => {
                  console.error(`Failed to load image for ${name}: ${image}`);
                  e.currentTarget.src = "https://picsum.photos/200/300"; // Fallback image
                }}
              />
            </div>
            <div className="flex flex-col text-left">
              <h1 className="truncate text-sm font-medium">{name}</h1>
              <div className="flex items-center gap-1">
                <span className="bg-gray-800 text-white px-2 py-1 text-xs rounded">
                  {startTime}
                </span>
                <span className="text-xs">-</span>
                <span className="bg-gray-800 text-white px-2 py-1 text-xs rounded">
                  {endTime}
                </span>
              </div>
            </div>
          </div>
        </div>
      </SheetTrigger>
      <div className="relative">
        <SheetContent className="m-1.5 h-[98.75vh] border rounded-lg w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              {name}
              <Badge className={`${config.badgeColor} text-white`}>
                <span className="text-xs">{config.badgeText}</span>
              </Badge>
            </SheetTitle>
            <SheetDescription>{description}</SheetDescription>
          </SheetHeader>
          <div className="space-y-4 p-2">
            <div className="h-96 w-full">
              <img
                src={image}
                alt={name}
                className="rounded-md h-full w-full object-cover"
                onError={(e) => {
                  console.error(`Failed to load image for ${name}: ${image}`);
                  e.currentTarget.src = "https://picsum.photos/200/300"; // Fallback image
                }}
              />
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-muted-foreground">Duration:</span>
                <p className="text-foreground">{duration}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Channel:</span>
                <p className="text-foreground">{channel}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Start Time:</span>
                <p className="text-foreground">{startTime}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">End Time:</span>
                <p className="text-foreground">{endTime}</p>
              </div>
              {type === "ad" && (
                <>
                  {brand && (
                    <div>
                      <span className="font-medium text-muted-foreground">Brand:</span>
                      <p className="text-foreground">{brand}</p>
                    </div>
                  )}
                  {sector && (
                    <div>
                      <span className="font-medium text-muted-foreground">Sector:</span>
                      <p className="text-foreground">{sector}</p>
                    </div>
                  )}
                  {category && (
                    <div>
                      <span className="font-medium text-muted-foreground">Category:</span>
                      <p className="text-foreground">{category}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </SheetContent>
      </div>
    </Sheet>
  );
};

function calculateDuration(startTime: string, endTime: string) {
  const start = timeToSeconds(startTime);
  const end = timeToSeconds(endTime);
  const diffSeconds = end - start;

  if (diffSeconds < 0) return "Invalid duration";

  const hours = Math.floor(diffSeconds / 3600);
  const minutes = Math.floor((diffSeconds % 3600) / 60);
  const seconds = diffSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
}

function timeToSeconds(timeString: string) {
  try {
    const parts = timeString.split(":");
    const hours = parseInt(parts[0], 10) || 0;
    const minutes = parseInt(parts[1], 10) || 0;
    const seconds = parseInt(parts[2], 10) || 0;
    return hours * 3600 + minutes * 60 + seconds;
  } catch (error) {
    console.error(`Error parsing time: ${timeString}`, error);
    return 0;
  }
}
"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

interface FiltersCardProps {
  deviceFilter: string;
  setDeviceFilter: (value: string) => void;
  date: string;
  setDate: (value: string) => void;
  startTime: string;
  setStartTime: (value: string) => void;
  endTime: string;
  setEndTime: (value: string) => void;
  eventType: string[];
  setEventType: (value: string[]) => void;
  limit: number;
  setLimit: (value: number) => void;
  onSearch: () => void;
}

export default function FiltersCard({
  deviceFilter,
  setDeviceFilter,
  date,
  setDate,
  startTime,
  setStartTime,
  endTime,
  setEndTime,
  eventType,
  setEventType,
  limit,
  setLimit,
  onSearch,
}: FiltersCardProps) {
  const [isUnknownDevice, setIsUnknownDevice] = useState(false);

  useEffect(() => {
    const storedDeviceId = localStorage.getItem("deviceId") || "UNKNOWN";
    setIsUnknownDevice(storedDeviceId === "UNKNOWN");
    if (deviceFilter !== storedDeviceId) {
      setDeviceFilter(storedDeviceId);
    }
  }, [deviceFilter, setDeviceFilter]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Filters
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          {isUnknownDevice ? (
            <div>
              <Label htmlFor="deviceSearch">Search Device ID</Label>
              <Input
                id="deviceSearch"
                placeholder="e.g., R-1002"
                value={deviceFilter}
                onChange={(e) => setDeviceFilter(e.target.value)}
              />
            </div>
          ) : (
            <div>
              <Label htmlFor="deviceFilter">Device ID</Label>
              <Input
                id="deviceFilter"
                value={deviceFilter}
                readOnly
                className="cursor-not-allowed"
              />
            </div>
          )}

          <div>
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="startTime">Start Time</Label>
            <Input
              id="startTime"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="endTime">End Time</Label>
            <Input
              id="endTime"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="eventType">Event Type</Label>
            <Select
              value={eventType.length > 0 ? eventType.join(",") : "all"}
              onValueChange={(value) => {
                if (value === "all") {
                  setEventType(["29", "33"]);
                } else {
                  setEventType([value]);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select event type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="29">Recognized</SelectItem>
                <SelectItem value="33">Unrecognized</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="limit">Events per Page</Label>
            <Select
              value={limit.toString()}
              onValueChange={(value) => setLimit(Number(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select limit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button onClick={onSearch} className="w-full">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
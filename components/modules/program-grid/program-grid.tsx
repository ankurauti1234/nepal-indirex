"use client";

import React, { useRef, useEffect, useState } from "react";
import { ProgramBlock } from "./program-block";
import { DatePicker } from "@/components/date-picker";
import { DualRangeSlider } from "@/components/dual-range-slider";
import { TypeSelector } from "@/components/type-selector";
import { Separator } from "@/components/ui/separator";
import ReportsDialog from "@/components/report-dialog";

interface Channel {
  name: string;
  type: string;
  logo: string;
}

interface ProgramData {
  id: string;
  channel: string;
  date: string;
  start: string;
  end: string;
  type: "program" | "ad" | "not_detected";
  program: string;
  image: string;
  region?: string;
  brand?: string | null;
  sector?: string | null;
  category?: string | null;
  description?: string;
}

interface ProgramGridProps {
  initialData: ProgramData[][];
  channels: Channel[];
  selectedDate: string;
}

const ProgramGrid = ({ initialData, channels, selectedDate }: ProgramGridProps) => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const programRef = useRef<HTMLDivElement>(null);
  const [timeRange, setTimeRange] = useState<[number, number]>([0, 23.5]);
  const [selectedDateState, setSelectedDateState] = useState(selectedDate);
  const [programData, setProgramData] = useState<ProgramData[][]>(initialData);

  // Synchronize scrolling
  const handleTimelineScroll = () => {
    if (timelineRef.current && programRef.current) {
      programRef.current.scrollLeft = timelineRef.current.scrollLeft;
    }
  };

  const handleProgramScroll = () => {
    if (timelineRef.current && programRef.current) {
      timelineRef.current.scrollLeft = programRef.current.scrollLeft;
    }
  };

  useEffect(() => {
    const timeline = timelineRef.current;
    const program = programRef.current;

    if (timeline && program) {
      timeline.addEventListener("scroll", handleTimelineScroll);
      program.addEventListener("scroll", handleProgramScroll);
      return () => {
        timeline.removeEventListener("scroll", handleTimelineScroll);
        program.removeEventListener("scroll", handleProgramScroll);
      };
    }
  }, []);

  // Convert time to seconds
  const timeToSeconds = (time: string) => {
    try {
      const [hours, minutes, seconds] = time.split(":").map(Number);
      return hours * 3600 + minutes * 60 + (seconds || 0);
    } catch (error) {
      console.error(`Error parsing time: ${time}`, error);
      return 0;
    }
  };

  // Calculate timeline width and scroll position based on time range
  const pixelsPerSecond = 360 / 3600; // 0.1px per second
  const rangeStartSeconds = timeRange[0] * 3600;
  const rangeEndSeconds = timeRange[1] * 3600;
  const rangeDurationSeconds = rangeEndSeconds - rangeStartSeconds;
  const timelineWidth = Math.max(rangeDurationSeconds * pixelsPerSecond, 360); // Min 1 hour width

  // Filter programs based on time range
  const filteredData = programData.map((channelPrograms, index) => {
    const filtered = channelPrograms.filter((program) => {
      const startSeconds = timeToSeconds(program.start);
      const endSeconds = timeToSeconds(program.end);
      const isVisible = startSeconds <= rangeEndSeconds && endSeconds >= rangeStartSeconds;
      return isVisible;
    });
    console.log(`Channel ${channels[index].name} programs:`, filtered); // Debug log
    return filtered;
  });

  // Auto-scroll to start of time range
  useEffect(() => {
    if (timelineRef.current && programRef.current) {
      const scrollPosition = rangeStartSeconds * pixelsPerSecond;
      timelineRef.current.scrollLeft = scrollPosition;
      programRef.current.scrollLeft = scrollPosition;
    }
  }, [timeRange]);

  // Fetch data when date changes
  useEffect(() => {
    const fetchData = async () => {
      console.log(`Fetching data for date: ${selectedDateState}`);
      const newData = await Promise.all(
        channels.map(async (channel) => {
          try {
            const response = await fetch(
              `${process.env.NEXT_PUBLIC_URL}/data/${channel.name.toLowerCase().replace(" ", "-")}/${selectedDateState}.json`
            );
            if (!response.ok) {
              console.warn(`No data found for ${channel.name} on ${selectedDateState}`);
              return [];
            }
            const data = await response.json();
            console.log(`Data for ${channel.name}:`, data); // Debug log
            return data;
          } catch (error) {
            console.error(`Error fetching data for ${channel.name}:`, error);
            return [];
          }
        })
      );
      setProgramData(newData);
    };
    fetchData();
  }, [selectedDateState, channels]);

  // Debug initial data
  useEffect(() => {
    console.log("Initial data:", initialData);
    console.log("Filtered data:", filteredData);
    console.log("Timeline width:", timelineWidth, "Time range:", timeRange);
  }, [initialData, filteredData, timelineWidth, timeRange]);

  return (
    <div className="flex flex-col">
      <div className="bg-card border rounded-lg h-fit mb-2">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl">Program Grid</h1>
          <div className="flex items-center gap-4">
            <TypeSelector />
            <DatePicker onDateChange={setSelectedDateState} initialDate={selectedDate} />
            <ReportsDialog />
          </div>
        </div>
        <Separator />
        <div className="mb-8 p-4 pb-0">
          <DualRangeSlider onValueChange={setTimeRange} />
        </div>
      </div>

      <div className="grid grid-cols-7 h-12 border-t border-x rounded-t-lg overflow-hidden divide-x">
        <div className="flex items-center justify-center bg-card">
          <p>Timeline</p>
        </div>
        <div className="col-span-6 bg-muted">
          <div
            ref={timelineRef}
            className="overflow-x-auto overflow-y-hidden hide-scrollbar"
            style={{ width: "100%" }}
          >
            <div className="flex" style={{ width: `${timelineWidth}px` }}>
              {Array.from({ length: Math.ceil(timeRange[1] - timeRange[0]) }, (_, i) => {
                const hour = Math.floor(timeRange[0] + i);
                return (
                  <div
                    key={hour}
                    className="flex-none h-12 w-[360px] flex items-center justify-start relative border-l border-gray-200"
                  >
                    <span className="text-sm font-medium absolute -left-4 bg-muted">
                      {hour}:00
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-7 h-fit border rounded-b-lg overflow-hidden divide-x">
        <div className="h-full bg-card rounded-l-lg flex flex-col divide-y min-w-64">
          {channels.map((channel, index) => (
            <div
              key={index}
              className="flex gap-2 items-center h-32 p-2 bg-card hover:bg-muted transition-colors"
            >
              <img
                src={channel.logo}
                alt={`${channel.name} Logo`}
                className="h-12 w-12 rounded-lg border object-cover"
              />
              <div>
                <h2 className="text-lg font-semibold">{channel.name}</h2>
                <p className="text-muted-foreground text-sm">{channel.type}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="col-span-6 bg-muted">
          <div ref={programRef} className="overflow-x-auto overflow-y-hidden">
            <div
              className="relative"
              style={{
                width: `${timelineWidth}px`,
                height: `${channels.length * 8}rem`,
              }}
            >
              {filteredData.map((channelPrograms, index) => (
                <div key={index} className="flex items-center h-32 relative">
                  {channelPrograms.length === 0 && (
                    <div className="text-center w-full text-muted-foreground">
                      No programs found for {channels[index].name} in selected time range.
                    </div>
                  )}
                  {channelPrograms.map((program) => (
                    <ProgramBlock
                      key={program.id}
                      type={program.type}
                      name={program.program}
                      description={program.description || "No description available"}
                      startTime={program.start}
                      endTime={program.end}
                      image={program.image}
                      channel={channels[index].name}
                      brand={program.brand}
                      sector={program.sector}
                      category={program.category}
                      timeRangeStart={timeRange[0] * 3600} // Pass time range for positioning
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgramGrid;
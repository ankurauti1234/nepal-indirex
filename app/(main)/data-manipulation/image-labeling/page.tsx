/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect, Suspense } from "react";
import FiltersCard from "@/components/labeling/FiltersCard";
import EventsTable from "@/components/labeling/EventsTable";
import LabelDialog from "@/components/labeling/LabelDialog";
import PaginationControls from "@/components/labeling/PaginationControls";
import {
  getEvents,
  getLabeledEvents,
  ImageProcessingEventFilter,
  ImageEventResponse,
} from "@/services/stream.service";
import { getUserData } from "@/services/auth.service";
import { useRouter, useSearchParams } from "next/navigation";

function ImageLabelingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize state from URL parameters or defaults
  const [imageEvents, setImageEvents] = useState<ImageEventResponse[]>([]);
  const [selectedEvents, setSelectedEvents] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLabelDialogOpen, setIsLabelDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(
    Number(searchParams.get("page")) || 1
  );
  const [totalPages, setTotalPages] = useState(1);
  const [deviceFilter, setDeviceFilter] = useState(
    typeof window !== "undefined"
      ? localStorage.getItem("deviceId") || "UNKNOWN"
      : "UNKNOWN"
  );
  const [date, setDate] = useState(searchParams.get("date") || "");
  const [startTime, setStartTime] = useState(searchParams.get("startTime") || "");
  const [endTime, setEndTime] = useState(searchParams.get("endTime") || "");
  const [eventType, setEventType] = useState<string[]>(
    searchParams.get("eventType")?.split(",") || []
  );
  const [limit, setLimit] = useState(
    Number(searchParams.get("limit")) || 10
  );
  const [labeledBy, setLabeledBy] = useState("");

  useEffect(() => {
    const userData = getUserData();
    setLabeledBy(userData.name || "Unknown User");
  }, []);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (date) params.set("date", date);
    if (startTime) params.set("startTime", startTime);
    if (endTime) params.set("endTime", endTime);
    if (eventType.length > 0) params.set("eventType", eventType.join(","));
    params.set("page", currentPage.toString());
    params.set("limit", limit.toString());

    router.push(`?${params.toString()}`, { scroll: false });
  }, [date, startTime, endTime, eventType, currentPage, limit]);

  const fetchImageEvents = async (page: number = 1) => {
    setLoading(true);
    try {
      const filters: ImageProcessingEventFilter = {
        page,
        limit,
        deviceId: deviceFilter || undefined,
        date: date || undefined,
        startTime: startTime || undefined,
        endTime: endTime || undefined,
        sort: "timestamp",
        order: "asc",
        type: eventType.length > 0 ? eventType.map(Number) : undefined,
      };

      const response = await getEvents(filters);
      let filteredEvents = response.data || [];

      const labeledEventsResponse = await getLabeledEvents({});
      const labeledEventIds = labeledEventsResponse.data
        ? labeledEventsResponse.data.map((event) => event.originalEventId)
        : [];
      filteredEvents = filteredEvents.filter(
        (event) => !labeledEventIds.includes(event.id)
      );

      setImageEvents(filteredEvents);
      setTotalPages(response.pagination.pages);
      setCurrentPage(response.pagination.page);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImageEvents(currentPage);
  }, [deviceFilter, date, startTime, endTime, eventType, limit]);

  const handleSelectEvent: (eventId: number | number[]) => void = (eventId) => {
    setSelectedEvents((prev) => {
      if (Array.isArray(eventId)) {
        return eventId; // Replace with new array for select all or clear all
      }
      return prev.includes(eventId)
        ? prev.filter((id) => id !== eventId)
        : [...prev, eventId];
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Image Labeling</h1>
      </div>

      <FiltersCard
        deviceFilter={deviceFilter}
        setDeviceFilter={setDeviceFilter}
        date={date}
        setDate={setDate}
        startTime={startTime}
        setStartTime={setStartTime}
        endTime={endTime}
        setEndTime={setEndTime}
        eventType={eventType}
        setEventType={setEventType}
        limit={limit}
        setLimit={(value) => {
          setLimit(value);
          setCurrentPage(1); // Reset to page 1 when limit changes
        }}
        onSearch={() => fetchImageEvents(1)}
      />

      <EventsTable
        imageEvents={imageEvents}
        selectedEvents={selectedEvents}
        loading={loading}
        onSelectEvent={handleSelectEvent}
        onLabelClick={() => setIsLabelDialogOpen(true)}
      />

      {totalPages > 1 && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={fetchImageEvents}
        />
      )}

      <LabelDialog
        isOpen={isLabelDialogOpen}
        setIsOpen={setIsLabelDialogOpen}
        selectedEvents={selectedEvents}
        labeledBy={labeledBy}
        onLabelSuccess={() => {
          setSelectedEvents([]);
          fetchImageEvents(currentPage);
        }}
      />
    </div>
  );
}

export default function ImageLabelingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ImageLabelingContent />
    </Suspense>
  );
}
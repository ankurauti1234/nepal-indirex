/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RefreshCcw, Search, X, ImageIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { getEvents } from "@/services/stream.service";
import { EventResponse } from "@/services/api";

// Interface for table data
interface Detection {
  id: string;
  deviceId: string;
  timestamp: string;
  content: string;
  confidence: string;
  type: string;
  confidenceValue: number;
  imagePath?: string;
}

// Confidence badge color logic
const getConfidenceBadgeColor = (confidence: number) => {
  if (confidence >= 95) return "bg-green-100 text-green-800 border-green-200";
  if (confidence >= 85) return "bg-yellow-100 text-yellow-800 border-yellow-200";
  return "bg-red-100 text-red-800 border-red-200";
};

export function StreamTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [events, setEvents] = useState<Detection[]>([]);
  const [totalEvents, setTotalEvents] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{
    url: string;
    title: string;
  } | null>(null);

  // Fetch events from API
  const fetchEvents = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      // Determine types based on filter
      let types: number[] = [];
      if (filterType === "recognized") {
        types = [29];
      } else if (filterType === "unrecognized") {
        types = [33];
      } else {
        types = [29, 33];
      }

      // Build query parameters
      const queryParams: any = {
        type: types,
        page: currentPage,
        limit: itemsPerPage,
        sort: sortBy,
        order: "desc",
      };

      // Add deviceId filter if search term exists
      if (searchTerm.trim()) {
        queryParams.deviceId = searchTerm.trim();
      }

      const response = await getEvents(queryParams);

      const mappedEvents: Detection[] = (response.data ?? []).map((event: EventResponse) => {
        const details = event.details as {
          channel_name?: string;
          score?: number;
          image_path?: string;
        } || {};
        return {
          id: event.id.toString(),
          deviceId: event.deviceId,
          timestamp: new Date(Number(event.timestamp) * 1000).toLocaleString(),
          content: details.channel_name || "Unknown Channel",
          confidence: `${((details.score ?? 0) * 100).toFixed(1)}%`,
          type: event.type.toString(),
          confidenceValue: (details.score ?? 0) * 100,
          imagePath: details.image_path,
        };
      });

      setEvents(mappedEvents);
      setTotalEvents(response.pagination.total);
      setTotalPages(response.pagination.pages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch events");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [currentPage, itemsPerPage, filterType, sortBy, searchTerm]);

  // Initial fetch and when dependencies change
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Auto-refresh every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchEvents(true);
    }, 15000);

    return () => clearInterval(interval);
  }, [fetchEvents]);

  // Reset to first page when filters change
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, filterType, itemsPerPage, sortBy]);

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page);
    }
  };

  // Handle refresh button
  const handleRefresh = () => {
    setCurrentPage(1);
    fetchEvents(true);
  };

  // Handle image click
  const handleImageClick = (imagePath: string, deviceId: string) => {
    setSelectedImage({
      url: imagePath,
      title: `Detection Image - ${deviceId}`,
    });
  };

  // Image loading error handler
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src =
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect width='18' height='18' x='3' y='3' rx='2' ry='2'/%3E%3Ccircle cx='9' cy='9' r='2'/%3E%3Cpath d='m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21'/%3E%3C/svg%3E";
  };

  // Custom pagination logic
  const maxPagesToShow = 5;
  const halfRange = Math.floor(maxPagesToShow / 2);
  let startPage = Math.max(1, currentPage - halfRange);
  const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

  // Adjust startPage if endPage exceeds totalPages
  if (endPage - startPage + 1 < maxPagesToShow) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
  }

  const pages: number[] = [];
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }
  const showLeftEllipsis = startPage > 1;
  const showRightEllipsis = endPage < totalPages;

  return (
    <div className="space-y-2">
      {/* Results Summary */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h1 className="text-lg">Content Detection Stream ({totalEvents})</h1>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center dark:bg-input rounded-lg border border-input">
            <div className="p-2">
              <Search size={16} />
            </div>
            <Input
              placeholder="Search by Device ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm border-0 focus-visible:ring-0 focus-visible:border-0 shadow-none"
            />
            {searchTerm && (
              <Button variant="ghost" size="icon" onClick={() => setSearchTerm("")}>
                <X size={16} />
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="recognized">Recognized</SelectItem>
                <SelectItem value="unrecognized">Unrecognized</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Created At</SelectItem>
                <SelectItem value="timestamp">Timestamp</SelectItem>
              </SelectContent>
            </Select>
            <Select value={itemsPerPage.toString()} onValueChange={(value: string) => setItemsPerPage(Number(value))}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="ghost" size="icon" onClick={handleRefresh} disabled={isRefreshing} className="shrink-0">
              <RefreshCcw className={isRefreshing ? "animate-spin" : ""} />
            </Button>
          </div>
        </div>
      </div>

      {/* Table - Responsive container */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-transparent">
              <TableRow className="hover:bg-transparent">
                <TableHead className="min-w-[100px]">Device ID</TableHead>
                <TableHead className="min-w-[150px]">Timestamp</TableHead>
                <TableHead className="min-w-[120px]">Detection Content</TableHead>
                <TableHead className="min-w-[100px]">Type</TableHead>
                <TableHead className="min-w-[80px]">Image</TableHead>
                <TableHead className="text-right min-w-[100px]">Confidence</TableHead>
              </TableRow>
            </TableHeader>
            <tbody aria-hidden="true" className="table-row h-2"></tbody>
            <TableBody className="[&_td:first-child]:rounded-l-lg [&_td:last-child]:rounded-r-lg">
              {loading ? (
                Array.from({ length: itemsPerPage }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell className="py-2.5">
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell className="py-2.5">
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell className="py-2.5">
                      <Skeleton className="h-4 w-28" />
                    </TableCell>
                    <TableCell className="py-2.5">
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell className="py-2.5">
                      <Skeleton className="h-10 w-10 rounded" />
                    </TableCell>
                    <TableCell className="py-2.5 text-right">
                      <Skeleton className="h-4 w-12 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-red-500">
                    Error: {error}
                  </TableCell>
                </TableRow>
              ) : events.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No detections found matching your criteria.
                  </TableCell>
                </TableRow>
              ) : (
                events.map((item) => (
                  <TableRow
                    key={item.id}
                    className="odd:bg-muted/50 odd:hover:bg-muted/50 border-none hover:bg-transparent"
                  >
                    <TableCell className="py-2.5 font-medium">
                      <div className="truncate max-w-[150px] sm:max-w-none" title={item.deviceId}>
                        {item.deviceId}
                      </div>
                    </TableCell>
                    <TableCell className="py-2.5 font-mono text-sm">
                      <div className="truncate max-w-[120px] sm:max-w-none" title={item.timestamp}>
                        {item.timestamp}
                      </div>
                    </TableCell>
                    <TableCell className="py-2.5">
                      <div className="truncate max-w-[100px] sm:max-w-none" title={item.content}>
                        {item.content}
                      </div>
                    </TableCell>
                    <TableCell className="py-2.5">
                      <Badge variant="outline" className="text-xs">
                        {item.type === "29" ? "Recognized" : "Unrecognized"}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-2.5">
                      {item.imagePath ? (
                        <div className="relative group">
                          <img
                            src={item.imagePath}
                            alt={`Detection from ${item.deviceId}`}
                            className="w-10 h-10 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => handleImageClick(item.imagePath!, item.deviceId)}
                            onError={handleImageError}
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 bg-gray-100 rounded border flex items-center justify-center">
                          <ImageIcon size={16} className="text-gray-400" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="py-2.5 text-right">
                      <Badge
                        variant="outline"
                        className={`text-xs ${getConfidenceBadgeColor(item.confidenceValue)}`}
                      >
                        {item.confidence}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
            <tbody aria-hidden="true" className="table-row h-2"></tbody>
            <TableFooter></TableFooter>
          </Table>
        </div>
      </div>

      {/* Pagination and Summary */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <p className="text-sm text-muted-foreground">
          Showing {Math.min(
            (currentPage - 1) * itemsPerPage + 1,
            totalEvents
          )}-{Math.min(currentPage * itemsPerPage, totalEvents)} of {totalEvents} detections
          {searchTerm && ` (filtered by Device ID: "${searchTerm}")`}
          {isRefreshing && (
            <span className="ml-2 text-blue-500">• Refreshing...</span>
          )}
        </p>

        {/* Custom Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center gap-2 justify-center sm:justify-end">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                currentPage === 1
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Previous
            </button>

            {showLeftEllipsis && (
              <>
                <button
                  onClick={() => handlePageChange(1)}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    currentPage === 1
                      ? "bg-blue-500 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  1
                </button>
                <span className="text-gray-500">...</span>
              </>
            )}

            {pages.map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  page === currentPage
                    ? "bg-blue-500 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {page}
              </button>
            ))}

            {showRightEllipsis && (
              <>
                <span className="text-gray-500">...</span>
                <button
                  onClick={() => handlePageChange(totalPages)}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    currentPage === totalPages
                      ? "bg-blue-500 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {totalPages}
                </button>
              </>
            )}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                currentPage === totalPages
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Image Dialog */}
      <Dialog open={selectedImage !== null} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="w-full max-w-7xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>{selectedImage?.title}</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center overflow-hidden">
            {selectedImage && (
              <img
                src={selectedImage.url}
                alt={selectedImage.title}
                className="max-w-full max-h-[70vh] object-contain rounded"
                onError={handleImageError}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
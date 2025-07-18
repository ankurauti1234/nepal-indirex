/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Loader2, Eye, Search } from 'lucide-react';
import { 
  getLabeledEvents, 
  LabeledEventResponse, 
  LabeledEventFilter 
} from '@/services/stream.service';

export default function LabeledDataTablePage() {
  const [labeledEvents, setLabeledEvents] = useState<LabeledEventResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deviceFilter, setDeviceFilter] = useState('');
  const [labeledByFilter, setLabeledByFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<LabeledEventResponse | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  const fetchLabeledEvents = async (page: number = 1) => {
    setLoading(true);
    try {
      const filters: LabeledEventFilter = {
        page,
        limit: 10,
        deviceId: deviceFilter || undefined,
        labeledBy: labeledByFilter || undefined,
        sort: 'labeledAt',
        order: 'desc',
      };

      const response = await getLabeledEvents(filters);

      let filteredEvents = response.data || [];

      // Apply search filter
      if (searchTerm) {
        filteredEvents = filteredEvents.filter(event => 
          event.details.channel_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.deviceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (event.labeledBy && event.labeledBy.toLowerCase().includes(searchTerm.toLowerCase())) ||
          event.details.labels?.some(label => label.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }

      setLabeledEvents(filteredEvents);
      setTotalPages(response.pagination.pages);
      setCurrentPage(response.pagination.page);
    } catch (error) {
      console.log(error);
      // toast({
      //   title: "Error",
      //   description: error instanceof Error ? error.message : "Failed to fetch labeled events",
      //   variant: "destructive",
      // });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLabeledEvents(1);
  }, [deviceFilter, labeledByFilter]);

  const handleSearch = () => {
    fetchLabeledEvents(1);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Labeled Data</h1>
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            Total: {labeledEvents.length}
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="deviceFilter">Device ID</Label>
              <Input
                id="deviceFilter"
                placeholder="Filter by device..."
                value={deviceFilter}
                onChange={(e) => setDeviceFilter(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="labeledByFilter">Labeled By</Label>
              <Input
                id="labeledByFilter"
                placeholder="Filter by labeled by..."
                value={labeledByFilter}
                onChange={(e) => setLabeledByFilter(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="searchTerm">Search</Label>
              <Input
                id="searchTerm"
                placeholder="Search channel, device, labels..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleSearch} className="w-full">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <Card>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event ID</TableHead>
                  <TableHead>Device ID</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Labels</TableHead>
                  <TableHead>Labeled By</TableHead>
                  <TableHead>Labeled At</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {labeledEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>{event.id}</TableCell>
                    <TableCell>{event.deviceId}</TableCell>
                    <TableCell>{event.details.channel_name}</TableCell>
                    <TableCell>
                      {event.details.labels?.map((label, index) => (
                        <Badge key={index} variant="outline" className="mr-1">
                          {label}
                        </Badge>
                      ))}
                    </TableCell>
                    <TableCell>{event.labeledBy || 'N/A'}</TableCell>
                    <TableCell>
                      {new Date(event.labeledAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedEvent(event);
                          setIsDetailsDialogOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => fetchLabeledEvents(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-4">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => fetchLabeledEvents(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Labeled Event Details</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <img
                  src={selectedEvent.details.image_path}
                  alt={`Event ${selectedEvent.id}`}
                  className="max-h-64 object-contain rounded-lg"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder-image.png';
                  }}
                />
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><strong>Event ID:</strong> {selectedEvent.id}</div>
                <div><strong>Original Event ID:</strong> {selectedEvent.originalEventId}</div>
                <div><strong>Device:</strong> {selectedEvent.deviceId}</div>
                <div><strong>Channel:</strong> {selectedEvent.details.channel_name}</div>
                <div><strong>Score:</strong> {selectedEvent.details.score}</div>
                <div><strong>Labeled By:</strong> {selectedEvent.labeledBy || 'N/A'}</div>
                <div><strong>Labeled At:</strong> {new Date(selectedEvent.labeledAt).toLocaleString()}</div>
                <div><strong>Timestamp:</strong> {new Date(parseInt(selectedEvent.timestamp) * 1000).toLocaleString()}</div>
                <div className="col-span-2">
                  <strong>Labels:</strong>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedEvent.details.labels?.map((label, index) => (
                      <Badge key={index} variant="outline">
                        {label}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
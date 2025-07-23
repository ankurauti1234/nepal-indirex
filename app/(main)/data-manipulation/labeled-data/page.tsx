/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Eye, Search } from 'lucide-react';
import { 
  getManuallyLabeledEvents, 
  LabeledEventResponse, 
  LabeledEventFilter,
} from '@/services/stream.service';

export default function LabeledDataTablePage() {
  const [labeledEvents, setLabeledEvents] = useState<LabeledEventResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deviceFilter, setDeviceFilter] = useState('');
  const [labeledByFilter, setLabeledByFilter] = useState('');
  const [detectionTypeFilter, setDetectionTypeFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [eventType, setEventType] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchLabeledEvents = async (page: number = 1) => {
    setLoading(true);
    try {
      const filters: LabeledEventFilter & { type?: number[] } = {
        page,
        limit: 10,
        deviceId: deviceFilter || undefined,
        labeledBy: labeledByFilter || undefined,
        detectionType: detectionTypeFilter && detectionTypeFilter !== 'all' ? detectionTypeFilter : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        sort: 'labeledAt',
        order: 'desc',
        type: eventType.length > 0 ? eventType.map(Number) : undefined,
      };

      const response = await getManuallyLabeledEvents(filters);
      let filteredEvents = response.data || [];

      if (searchTerm) {
        filteredEvents = filteredEvents.filter(event => 
          event.details.channel_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.deviceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (event.labeledBy && event.labeledBy.toLowerCase().includes(searchTerm.toLowerCase())) ||
          event.detectionType.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      setLabeledEvents(filteredEvents);
      setTotalPages(response.pagination.pages);
      setCurrentPage(response.pagination.page);
    } catch (error) {
      console.error(error);
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
  }, [deviceFilter, labeledByFilter, detectionTypeFilter, startDate, endDate, eventType]);

  const handleSearch = () => {
    fetchLabeledEvents(1);
  };

  // const getEventTypeColor = (type: number) => {
  //   switch (type) {
  //     case 29: return 'bg-green-100 text-green-800';
  //     case 33: return 'bg-yellow-100 text-yellow-800';
  //     default: return 'bg-gray-100 text-gray-800';
  //   }
  // };

  // const getEventTypeLabel = (type: number) => {
  //   switch (type) {
  //     case 29: return 'Recognized';
  //     case 33: return 'Unrecognized';
  //     default: return 'Unknown';
  //   }
  // };

  const getDetailsSummary = (event: LabeledEventResponse) => {
    const { details, detectionType } = event;
    switch (detectionType) {
      case 'break advertisements':
      case 'sponsor advertisements':
      case 'overlays advertisements':
        return `Brand: ${details.brand || 'N/A'}, Advertiser: ${details.advertiser || 'N/A'}`;
      case 'program':
        return `Program: ${details.programName || 'N/A'}, Genre: ${details.genre || 'N/A'}`;
      case 'song':
        return `Song: ${details.name || 'N/A'}, Artist: ${details.artist || 'N/A'}`;
      case 'error':
        return `Error: ${details.errorOrMissingData || 'N/A'}`;
      case 'channel jingle':
        return `Jingle: ${details.channelJingle || 'N/A'}`;
      default:
        return 'No details';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Labeled Data</h1>
        <div className="flex items-center gap-2">
          <Badge variant="outline">Total: {labeledEvents.length}</Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
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
              <Label htmlFor="detectionTypeFilter">Detection Type</Label>
              <Select
                value={detectionTypeFilter}
                onValueChange={setDetectionTypeFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select detection type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="break advertisements">Break Advertisements</SelectItem>
                  <SelectItem value="sponsor advertisements">Sponsor Advertisements</SelectItem>
                  <SelectItem value="overlays advertisements">Overlays Advertisements</SelectItem>
                  <SelectItem value="program">Program</SelectItem>
                  <SelectItem value="song">Song</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="channel jingle">Channel Jingle</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="eventType">Event Type</Label>
              <Select
                value={eventType.join(',')}
                onValueChange={(value) => setEventType(value ? value.split(',') : [])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="29">Recognized</SelectItem>
                  <SelectItem value="33">Unrecognized</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="searchTerm">Search</Label>
              <Input
                id="searchTerm"
                placeholder="Search channel, device, labeled by..."
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
                  <TableHead>Detection Type</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Labeled By</TableHead>
                  <TableHead>Time Range</TableHead>
                  <TableHead>Images</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {labeledEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>{event.id}</TableCell>
                    <TableCell>{event.deviceId}</TableCell>
                    <TableCell>{event.details.channel_name}</TableCell>
                    <TableCell>{event.detectionType}</TableCell>
                    <TableCell>{getDetailsSummary(event)}</TableCell>
                    <TableCell>{event.labeledBy || 'N/A'}</TableCell>
                    <TableCell>
                      {new Date(parseInt(event.timestampStart || event.timestamp) * 1000).toLocaleString()} - 
                      {new Date(parseInt(event.timestampEnd || event.timestamp) * 1000).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {(event.images || []).length} image{(event.images || []).length !== 1 ? 's' : ''}
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl">
                          <DialogHeader>
                            <DialogTitle>Labeled Event Details</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div><strong>Event ID:</strong> {event.id}</div>
                              <div><strong>Device:</strong> {event.deviceId}</div>
                              <div><strong>Original Event ID:</strong> {event.originalEventId}</div>
                              <div><strong>Channel:</strong> {event.details.channel_name}</div>
                              <div><strong>Detection Type:</strong> {event.detectionType}</div>
                              <div><strong>Labeled By:</strong> {event.labeledBy || 'N/A'}</div>
                              <div><strong>Time Range:</strong> 
                                {new Date(parseInt(event.timestampStart || event.timestamp) * 1000).toLocaleString()} - 
                                {new Date(parseInt(event.timestampEnd || event.timestamp) * 1000).toLocaleString()}
                              </div>
                              <div><strong>Labeled At:</strong> {new Date(event.labeledAt).toLocaleString()}</div>
                              {event.detectionType === 'break advertisements' || 
                               event.detectionType === 'sponsor advertisements' || 
                               event.detectionType === 'overlays advertisements' ? (
                                <>
                                  <div><strong>Brand:</strong> {event.details.brand || 'N/A'}</div>
                                  <div><strong>Advertiser:</strong> {event.details.advertiser || 'N/A'}</div>
                                  <div><strong>Industry:</strong> {event.details.industry || 'N/A'}</div>
                                  <div><strong>Category:</strong> {event.details.category || 'N/A'}</div>
                                  <div><strong>Sector:</strong> {event.details.sector || 'N/A'}</div>
                                </>
                              ) : event.detectionType === 'program' ? (
                                <>
                                  <div><strong>Program Name:</strong> {event.details.programName || 'N/A'}</div>
                                  <div><strong>Genre:</strong> {event.details.genre || 'N/A'}</div>
                                </>
                              ) : event.detectionType === 'song' ? (
                                <>
                                  <div><strong>Song Name:</strong> {event.details.name || 'N/A'}</div>
                                  <div><strong>Artist:</strong> {event.details.artist || 'N/A'}</div>
                                  <div><strong>Release Year:</strong> {event.details.releaseYear || 'N/A'}</div>
                                  <div><strong>Album/Movie:</strong> {event.details.albumOrMovie || 'N/A'}</div>
                                  <div><strong>Language:</strong> {event.details.language || 'N/A'}</div>
                                </>
                              ) : event.detectionType === 'error' ? (
                                <div><strong>Error:</strong> {event.details.errorOrMissingData || 'N/A'}</div>
                              ) : event.detectionType === 'channel jingle' ? (
                                <div><strong>Channel Jingle:</strong> {event.details.channelJingle || 'N/A'}</div>
                              ) : null}
                            </div>
                            <div>
                              <strong>Images:</strong>
                              <div className="grid grid-cols-2 gap-4 mt-2">
                                {(event.images || []).map((image, index) => (
                                  <img
                                    key={index}
                                    src={image}
                                    alt={`Event image ${index + 1}`}
                                    className="w-full max-h-48 object-contain rounded-lg"
                                    onError={(e) => { e.currentTarget.src = '/placeholder-image.png'; }}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

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
    </div>
  );
}
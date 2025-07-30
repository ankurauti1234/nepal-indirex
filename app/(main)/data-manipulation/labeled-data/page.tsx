/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { format } from 'date-fns';

export default function LabeledDataTablePage() {
  const [labeledEvents, setLabeledEvents] = useState<LabeledEventResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deviceFilter, setDeviceFilter] = useState('');
  const [labeledByFilter, setLabeledByFilter] = useState('');
  const [detectionTypeFilter, setDetectionTypeFilter] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeviceIdEditable, setIsDeviceIdEditable] = useState(true);

  useEffect(() => {
    // Get deviceId and name from localStorage
    const storedDeviceId = localStorage.getItem('deviceId') || '';
    const storedName = localStorage.getItem('name') || '';
    
    // Set initial filter values
    setDeviceFilter(storedDeviceId);
    setLabeledByFilter(storedName);
    
    // Make inputs non-editable if deviceId is not UNKNOWN
    setIsDeviceIdEditable(storedDeviceId === 'UNKNOWN');
  }, []);

  const fetchLabeledEvents = async (page: number = 1) => {
    setLoading(true);
    try {
      const filters: LabeledEventFilter = {
        page,
        limit: 10,
        deviceId: deviceFilter || undefined,
        labeledBy: labeledByFilter || undefined,
        detectionType: detectionTypeFilter && detectionTypeFilter !== 'all' ? detectionTypeFilter : undefined,
        date: date || undefined,
        startTime: startTime || undefined,
        endTime: endTime || undefined,
        sort: 'labeledAt',
        order: 'desc',
      };

      const response = await getManuallyLabeledEvents(filters);
      let filteredEvents = response.data || [];

      if (searchTerm) {
        filteredEvents = filteredEvents.filter(event => 
          (typeof event.details === 'object' && 'channel_name' in event.details && typeof event.details.channel_name === 'string'
            ? event.details.channel_name.toLowerCase().includes(searchTerm.toLowerCase())
            : false) ||
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLabeledEvents(1);
  }, [deviceFilter, labeledByFilter, detectionTypeFilter, date, startTime, endTime]);

  const handleSearch = () => {
    fetchLabeledEvents(1);
  };

  const handleReset = () => {
    const storedDeviceId = localStorage.getItem('deviceId') || '';
    const storedName = localStorage.getItem('name') || '';
    
    setDeviceFilter(isDeviceIdEditable ? '' : storedDeviceId);
    setLabeledByFilter(isDeviceIdEditable ? '' : storedName);
    setDetectionTypeFilter('');
    setDate('');
    setStartTime('');
    setEndTime('');
    setSearchTerm('');
    fetchLabeledEvents(1);
  };

  const getDetailsSummary = (event: LabeledEventResponse) => {
    const { details, detectionType } = event;
    switch (detectionType) {
      case 'Commercial Break':
        return `Duration: ${typeof details === 'object' && 'duration' in details ? (details as any).duration || 'N/A' : 'N/A'} seconds`;
      case 'Spots outside breaks':
        return `Format: ${typeof details === 'object' && 'formatType' in details ? (details as any).formatType || 'N/A' : 'N/A'}`;
      case 'Auto-promo':
        return `Content: ${typeof details === 'object' && 'contentType' in details ? (details as any).contentType || 'N/A' : 'N/A'}`;
      case 'Program Content':
        if (typeof details === 'object' && details !== null && 'description' in details && 'contentType' in details) {
          return `Program: ${(details as any).description || 'N/A'}, Type: ${(details as any).contentType || 'N/A'}`;
        }
        return 'No details';
      case 'Song':
        if (typeof details === 'object' && details !== null && 'songName' in details && 'artistName' in details) {
          return `Song: ${(details as any).songName || 'N/A'}, Artist: ${(details as any).artistName || 'N/A'}`;
        }
        return 'No details';
      case 'Error':
        return `Error: ${typeof details === 'object' && details !== null && 'errorType' in details ? (details as any).errorType || 'N/A' : 'N/A'}`;
      default:
        return 'No details';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(parseInt(timestamp) * 1000);
    return format(date, 'MM/dd/yyyy hh:mm:ss a');
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
                onChange={(e) => isDeviceIdEditable && setDeviceFilter(e.target.value)}
                disabled={!isDeviceIdEditable}
              />
            </div>
            <div>
              <Label htmlFor="labeledByFilter">Labeled By</Label>
              <Input
                id="labeledByFilter"
                placeholder="Filter by labeled by..."
                value={labeledByFilter}
                onChange={(e) => isDeviceIdEditable && setLabeledByFilter(e.target.value)}
                disabled={!isDeviceIdEditable}
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
                  <SelectItem value="Program Content">Program Content</SelectItem>
                  <SelectItem value="Commercial Break">Commercial Break</SelectItem>
                  <SelectItem value="Spots outside breaks">Spots outside breaks</SelectItem>
                  <SelectItem value="Auto-promo">Auto-promo</SelectItem>
                  <SelectItem value="Song">Song</SelectItem>
                  <SelectItem value="Error">Error</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
              <Label htmlFor="searchTerm">Search</Label>
              <Input
                id="searchTerm"
                placeholder="Search channel, device, labeled by..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={handleSearch} className="w-full">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
              <Button onClick={handleReset} variant="outline" className="w-full">
                Reset
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
                    <TableCell>
                      {'channel_name' in event.details && typeof event.details.channel_name === 'string'
                        ? event.details.channel_name
                        : 'N/A'}
                    </TableCell>
                    <TableCell>{event.detectionType}</TableCell>
                    <TableCell>{getDetailsSummary(event)}</TableCell>
                    <TableCell>{event.labeledBy ?? 'N/A'}</TableCell>
                    <TableCell>
                      {formatTimestamp(event.timestampStart ?? event.timestamp)} - 
                      {formatTimestamp(event.timestampEnd ?? event.timestamp)}
                    </TableCell>
                    <TableCell>
                      {(event.images ?? []).length} image{(event.images ?? []).length !== 1 ? 's' : ''}
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
                              <div>
                                <strong>Channel:</strong>{' '}
                                {'channel_name' in event.details && typeof event.details.channel_name === 'string'
                                  ? event.details.channel_name
                                  : 'N/A'}
                              </div>
                              <div><strong>Detection Type:</strong> {event.detectionType}</div>
                              <div><strong>Labeled By:</strong> {event.labeledBy ?? 'N/A'}</div>
                              <div><strong>Time Range:</strong> 
                                {formatTimestamp(event.timestampStart ?? event.timestamp)} - 
                                {formatTimestamp(event.timestampEnd ?? event.timestamp)}
                              </div>
                              <div><strong>Labeled At:</strong> {format(new Date(event.labeledAt), 'MM/dd/yyyy hh:mm:ss a')}</div>
                              {event.detectionType === 'Program Content' ? (
                                <>
                                  <div><strong>Description:</strong> {'description' in event.details ? (event.details as any).description ?? 'N/A' : 'N/A'}</div>
                                  <div><strong>Format Type:</strong> {'formatType' in event.details ? (event.details as any).formatType ?? 'N/A' : 'N/A'}</div>
                                  <div><strong>Content Type:</strong> {'contentType' in event.details ? (event.details as any).contentType ?? 'N/A' : 'N/A'}</div>
                                  <div><strong>Episode ID:</strong> {event.episodeId ?? 'N/A'}</div>
                                  <div><strong>Season ID:</strong> {event.seasonId ?? 'N/A'}</div>
                                </>
                              ) : event.detectionType === 'Commercial Break' ? (
                                <div><strong>Duration:</strong> {'duration' in event.details ? (event.details as any).duration ?? 'N/A' : 'N/A'} seconds</div>
                              ) : event.detectionType === 'Spots outside breaks' ? (
                                <div><strong>Format Type:</strong> {'formatType' in event.details ? (event.details as any).formatType ?? 'N/A' : 'N/A'}</div>
                              ) : event.detectionType === 'Auto-promo' ? (
                                <div><strong>Content Type:</strong> {'contentType' in event.details ? (event.details as any).contentType ?? 'N/A' : 'N/A'}</div>
                              ) : event.detectionType === 'Song' ? (
                                (() => {
                                  const details = event.details as Partial<Record<string, unknown>> & { songName?: string, artistName?: string, yearOfPublication?: string, movieNameOrAlbumName?: string, genre?: string, tempo?: string };
                                  return (
                                    <>
                                      <div><strong>Song Name:</strong> {typeof details.songName === 'string' ? details.songName : 'N/A'}</div>
                                      <div><strong>Artist:</strong> {typeof details.artistName === 'string' ? details.artistName : 'N/A'}</div>
                                      <div><strong>Year:</strong> {typeof details.yearOfPublication === 'string' ? details.yearOfPublication : 'N/A'}</div>
                                      <div><strong>Album/Movie:</strong> {typeof details.movieNameOrAlbumName === 'string' ? details.movieNameOrAlbumName : 'N/A'}</div>
                                      <div><strong>Genre:</strong> {typeof details.genre === 'string' ? details.genre : 'N/A'}</div>
                                      <div><strong>Tempo:</strong> {typeof details.tempo === 'string' ? details.tempo : 'N/A'}</div>
                                    </>
                                  );
                                })()
                              ) : event.detectionType === 'Error' ? (
                                <div><strong>Error Type:</strong> {'errorType' in event.details ? (event.details as any).errorType ?? 'N/A' : 'N/A'}</div>
                              ) : null}
                            </div>
                            <div>
                              <strong>Images:</strong>
                              <div className="grid grid-cols-2 gap-4 mt-2">
                                {(event.images ?? []).map((image, index) => (
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
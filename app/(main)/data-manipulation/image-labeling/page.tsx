/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Eye, Tag, Search, Filter } from 'lucide-react';
import { 
  getImageProcessingEvents, 
  getUnrecognizedEvents, 
  labelEvent, 
  ImageEventResponse, 
  LabelEventRequest 
} from '@/services/stream.service';

export default function ImageLabelingPage() {
  const [imageEvents, setImageEvents] = useState<ImageEventResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [labeling, setLabeling] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [eventType, setEventType] = useState<'all' | 'recognized' | 'unrecognized'>('all');
  const [deviceFilter, setDeviceFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<ImageEventResponse | null>(null);
  const [labelInput, setLabelInput] = useState('');
  const [labeledBy, setLabeledBy] = useState('');
  const [isLabelDialogOpen, setIsLabelDialogOpen] = useState(false);

  const fetchImageEvents = async (page: number = 1) => {
    setLoading(true);
    try {
      let response;
      const filters = {
        page,
        limit: 12,
        deviceId: deviceFilter || undefined,
        sort: 'createdAt',
        order: 'desc' as const,
      };

      if (eventType === 'unrecognized') {
        response = await getUnrecognizedEvents(filters);
      } else {
        response = await getImageProcessingEvents(filters);
      }

      let filteredEvents = response.data || [];
      
      // Apply event type filter for 'all' case
      if (eventType === 'recognized') {
        filteredEvents = filteredEvents.filter(event => event.type === 29);
      }
      
      // Apply search filter
      if (searchTerm) {
        filteredEvents = filteredEvents.filter(event => 
          event.details.channel_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.deviceId.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      setImageEvents(filteredEvents);
      setTotalPages(response.pagination.pages);
      setCurrentPage(response.pagination.page);
    } catch (error) {
      console.log(error)
      // toast({
      //   title: "Error",
      //   description: error instanceof Error ? error.message : "Failed to fetch image events",
      //   variant: "destructive",
      // });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImageEvents(1);
  }, [eventType, deviceFilter]);

  const handleSearch = () => {
    fetchImageEvents(1);
  };

  const handleLabelEvent = async () => {
    if (!selectedEvent || !labelInput.trim()) {
      // toast({
      //   title: "Error",
      //   description: "Please enter at least one label",
      //   variant: "destructive",
      // });
      return;
    }

    setLabeling(selectedEvent.id);
    try {
      const labels = labelInput.split(',').map(label => label.trim()).filter(label => label);
      const labelRequest: LabelEventRequest = {
        eventId: selectedEvent.id,
        labels,
        labeledBy: labeledBy || undefined,
      };

      await labelEvent(labelRequest);
      
      // toast({
      //   title: "Success",
      //   description: "Event labeled successfully",
      // });

      setIsLabelDialogOpen(false);
      setSelectedEvent(null);
      setLabelInput('');
      setLabeledBy('');
      fetchImageEvents(currentPage);
    } catch (error) {
      console.log(error)
      // toast({
      //   title: "Error",
      //   description: error instanceof Error ? error.message : "Failed to label event",
      //   variant: "destructive",
      // });
    } finally {
      setLabeling(null);
    }
  };

  const getEventTypeColor = (type: number) => {
    switch (type) {
      case 29: return 'bg-green-100 text-green-800';
      case 33: return 'bg-yellow-100 text-yellow-800';
      case 23: return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEventTypeLabel = (type: number) => {
    switch (type) {
      case 29: return 'Recognized';
      case 33: return 'Unrecognized';
      case 23: return 'Processed';
      default: return 'Unknown';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Image Labeling</h1>
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            Total: {imageEvents.length}
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="eventType">Event Type</Label>
              <Select value={eventType} onValueChange={(value: 'all' | 'recognized' | 'unrecognized') => setEventType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  <SelectItem value="recognized">Recognized Only</SelectItem>
                  <SelectItem value="unrecognized">Unrecognized Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
              <Label htmlFor="searchTerm">Search</Label>
              <Input
                id="searchTerm"
                placeholder="Search channel, device..."
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

      {/* Image Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {imageEvents.map((event) => (
            <Card key={event.id} className="group hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <Badge className={getEventTypeColor(event.type)}>
                    {getEventTypeLabel(event.type)}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    Score: {event.details.score.toFixed(2)}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="aspect-video relative overflow-hidden rounded-lg bg-gray-100">
                  <img
                    src={event.details.image_path}
                    alt={`Event ${event.id}`}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder-image.png';
                    }}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Channel:</span>
                    <span className="text-sm text-gray-600">{event.details.channel_name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Device:</span>
                    <span className="text-sm text-gray-600">{event.deviceId}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Time:</span>
                    <span className="text-sm text-gray-600">
                      {new Date(parseInt(event.timestamp) * 1000).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Event Details</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <img
                          src={event.details.image_path}
                          alt={`Event ${event.id}`}
                          className="w-full max-h-96 object-contain rounded-lg"
                        />
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div><strong>Event ID:</strong> {event.id}</div>
                          <div><strong>Device:</strong> {event.deviceId}</div>
                          <div><strong>Channel:</strong> {event.details.channel_name}</div>
                          <div><strong>Score:</strong> {event.details.score}</div>
                          <div><strong>Type:</strong> {getEventTypeLabel(event.type)}</div>
                          <div><strong>Timestamp:</strong> {new Date(parseInt(event.timestamp) * 1000).toLocaleString()}</div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      setSelectedEvent(event);
                      setIsLabelDialogOpen(true);
                    }}
                    disabled={labeling === event.id}
                  >
                    {labeling === event.id ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Tag className="h-4 w-4 mr-2" />
                    )}
                    Label
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => fetchImageEvents(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-4">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => fetchImageEvents(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Label Dialog */}
      <Dialog open={isLabelDialogOpen} onOpenChange={setIsLabelDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Label Event</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <img
                  src={selectedEvent.details.image_path}
                  alt={`Event ${selectedEvent.id}`}
                  className="max-h-64 object-contain rounded-lg"
                />
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="labels">Labels (comma-separated)</Label>
                  <Textarea
                    id="labels"
                    placeholder="Enter labels separated by commas (e.g., coca_cola, advertisement, beverage)"
                    value={labelInput}
                    onChange={(e) => setLabelInput(e.target.value)}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="labeledBy">Labeled By (optional)</Label>
                  <Input
                    id="labeledBy"
                    placeholder="Enter your name or ID"
                    value={labeledBy}
                    onChange={(e) => setLabeledBy(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsLabelDialogOpen(false);
                    setSelectedEvent(null);
                    setLabelInput('');
                    setLabeledBy('');
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleLabelEvent} disabled={labeling !== null}>
                  {labeling ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Tag className="h-4 w-4 mr-2" />
                  )}
                  Label Event
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
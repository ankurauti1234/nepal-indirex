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
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Tag, Search } from 'lucide-react';
import {
  getEvents,
  labelEvent,
  ImageEventResponse,
  LabelEventRequest,
  ImageProcessingEventFilter,
  getLabeledEvents,
  ProgramContentDetails,
} from '@/services/stream.service';
import { getUserData } from '@/services/auth.service';

// Define literal types for programFormatType, programContentType, spotsFormatType, and autoPromoContentType
type ProgramFormatType = 'Film' | 'Series' | 'Structured Studio Programs' | 'Interactive Programs' | 'Artistic Performances';
type ProgramContentType =
  | 'Popular Drama / Comedy'
  | 'Animation Film'
  | 'Documentary Film'
  | 'Short Film'
  | 'Other Film'
  | 'General News'
  | 'Animation Series / Cartoon'
  | 'Documentary Series'
  | 'Docusoap / Reality Series'
  | 'Other Series'
  | 'Science / Geography'
  | 'Lifestyle: Showbiz, Stars'
  | 'Entertainment: Humor';
type SpotsFormatType = 'BB' | 'CAPB' | 'OOBS';
type AutoPromoContentType = 'Foreign' | 'Other Advertising' | 'Sports: Football' | 'Tele-shopping' | 'Other / Mixed / Unknown';

export default function ImageLabelingPage() {
  const [imageEvents, setImageEvents] = useState<ImageEventResponse[]>([]);
  const [selectedEvents, setSelectedEvents] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [labeling, setLabeling] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deviceFilter, setDeviceFilter] = useState('');
  const [searchTerm] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [eventType, setEventType] = useState<string[]>([]);
  const [detectionType, setDetectionType] = useState<
    'Program Content' | 'Commercial Break' | 'Spots outside breaks' | 'Auto-promo' | 'Song' | 'Error'
  >('Program Content');
  const [labeledBy, setLabeledBy] = useState('');
  const [format, setFormat] = useState('');
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [episodeId, setEpisodeId] = useState('');
  const [seasonId, setSeasonId] = useState('');
  const [repeat, setRepeat] = useState(false);
  const [programDescription, setProgramDescription] = useState('');
  const [programFormatType, setProgramFormatType] = useState<ProgramFormatType | ''>('');
  const [programContentType, setProgramContentType] = useState<ProgramContentType | ''>('');
  const [spotsFormatType, setSpotsFormatType] = useState<SpotsFormatType | ''>('');
  const [autoPromoContentType, setAutoPromoContentType] = useState<AutoPromoContentType | ''>('');
  const [songName, setSongName] = useState('');
  const [movieNameOrAlbumName, setMovieNameOrAlbumName] = useState('');
  const [artistName, setArtistName] = useState('');
  const [yearOfPublication, setYearOfPublication] = useState('');
  const [songGenre, setSongGenre] = useState('');
  const [songTempo, setSongTempo] = useState('');
  const [errorType, setErrorType] = useState<'Signal Lost' | 'Blank Image' | ''>('');
  const [isLabelDialogOpen, setIsLabelDialogOpen] = useState(false);

  useEffect(() => {
    const userData = getUserData();
    setLabeledBy(userData.name || 'Unknown User');
  }, []);

  const fetchImageEvents = async (page: number = 1) => {
    setLoading(true);
    try {
      const filters: ImageProcessingEventFilter = {
        page,
        limit: 10,
        deviceId: deviceFilter || undefined,
        date: date || undefined,
        startTime: startTime || undefined,
        endTime: endTime || undefined,
        sort: 'createdAt',
        order: 'desc',
        type: eventType.length > 0 ? eventType.map(Number) : undefined,
      };

      const response = await getEvents(filters);
      let filteredEvents = response.data || [];

      if (searchTerm) {
        filteredEvents = filteredEvents.filter(event =>
          event.details.channel_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.deviceId.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      const labeledEventsResponse = await getLabeledEvents({});
      const labeledEventIds = labeledEventsResponse.data ? labeledEventsResponse.data.map(event => event.originalEventId) : [];
      filteredEvents = filteredEvents.filter(event => !labeledEventIds.includes(event.id));

      setImageEvents(filteredEvents);
      setTotalPages(response.pagination.pages);
      setCurrentPage(response.pagination.page);
    } catch (error) {
      console.error(error);
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
  }, [deviceFilter, date, startTime, endTime, eventType]);

  const handleSearch = () => {
    fetchImageEvents(1);
  };

  const handleSelectEvent = (eventId: number) => {
    setSelectedEvents(prev =>
      prev.includes(eventId) ? prev.filter(id => id !== eventId) : [...prev, eventId]
    );
  };

  const handleLabelEvent = async () => {
    if (selectedEvents.length === 0) {
      // toast({
      //   title: "Error",
      //   description: "Please select at least one event",
      //   variant: "destructive",
      // });
      return;
    }

    // Validate optional fields
    if (format && !/^\d{2}$/.test(format)) {
      // toast({
      //   title: "Error",
      //   description: "Format must be a 2-digit code",
      //   variant: "destructive",
      // });
      return;
    }
    if (content && !/^\d{3}$/.test(content)) {
      // toast({
      //   title: "Error",
      //   description: "Content must be a 3-digit code",
      //   variant: "destructive",
      // });
      return;
    }
    if (detectionType === 'Program Content' && (!programDescription || !programFormatType || !programContentType)) {
      // toast({
      //   title: "Error",
      //   description: "Program description, format type, and content type are required",
      //   variant: "destructive",
      // });
      return;
    }
    if (detectionType === 'Spots outside breaks' && !spotsFormatType) {
      // toast({
      //   title: "Error",
      //   description: "Format type is required for Spots outside breaks",
      //   variant: "destructive",
      // });
      return;
    }
    if (detectionType === 'Auto-promo' && !autoPromoContentType) {
      // toast({
      //   title: "Error",
      //   description: "Content type is required for Auto-promo",
      //   variant: "destructive",
      // });
      return;
    }
    if (detectionType === 'Song' && (!songName || !artistName)) {
      // toast({
      //   title: "Error",
      //   description: "Song name and artist name are required",
      //   variant: "destructive",
      // });
      return;
    }
    if (detectionType === 'Error' && !errorType) {
      // toast({
      //   title: "Error",
      //   description: "Error type is required",
      //   variant: "destructive",
      // });
      return;
    }

    setLabeling(true);
    try {
      const labelRequest: LabelEventRequest = {
        eventIds: selectedEvents,
        detectionType,
        format: format || undefined,
        content: content || undefined,
        title: title || undefined,
        episodeId: detectionType === 'Program Content' ? episodeId || undefined : undefined,
        seasonId: detectionType === 'Program Content' ? seasonId || undefined : undefined,
        repeat,
        labeledBy: labeledBy || undefined,
        ...(detectionType === 'Program Content' && programFormatType && programContentType
          ? {
              programContentDetails: {
                description: programDescription,
                formatType: programFormatType as ProgramContentDetails['formatType'],
                contentType: programContentType as ProgramContentDetails['contentType'],
                episodeId: episodeId || undefined,
                seasonId: seasonId || undefined,
              },
            }
          : {}),
        ...(detectionType === 'Commercial Break' ? { commercialBreakDetails: {} } : {}),
        ...(detectionType === 'Spots outside breaks' && spotsFormatType
          ? { spotsOutsideBreaksDetails: { formatType: spotsFormatType as SpotsFormatType } }
          : {}),
        ...(detectionType === 'Auto-promo' && autoPromoContentType
          ? { autoPromoDetails: { contentType: autoPromoContentType as AutoPromoContentType } }
          : {}),
        ...(detectionType === 'Song' ? {
          songDetails: {
            songName,
            movieNameOrAlbumName: movieNameOrAlbumName || undefined,
            artistName,
            yearOfPublication: yearOfPublication || undefined,
            genre: songGenre || undefined,
            tempo: songTempo || undefined,
          },
        } : {}),
        ...(detectionType === 'Error' && errorType
          ? { errorDetails: { errorType } }
          : {}),
      };

      await labelEvent(labelRequest);

      // toast({
      //   title: "Success",
      //   description: "Events labeled successfully",
      // });

      setIsLabelDialogOpen(false);
      setSelectedEvents([]);
      setFormat('');
      setContent('');
      setTitle('');
      setEpisodeId('');
      setSeasonId('');
      setRepeat(false);
      setProgramDescription('');
      setProgramFormatType('');
      setProgramContentType('');
      setSpotsFormatType('');
      setAutoPromoContentType('');
      setSongName('');
      setMovieNameOrAlbumName('');
      setArtistName('');
      setYearOfPublication('');
      setSongGenre('');
      setSongTempo('');
      setErrorType('');
      fetchImageEvents(currentPage);
    } catch (error) {
      console.error(error);
      // toast({
      //   title: "Error",
      //   description: error instanceof Error ? error.message : "Failed to label events",
      //   variant: "destructive",
      // });
    } finally {
      setLabeling(false);
    }
  };

  const getEventTypeColor = (type: number) => {
    switch (type) {
      case 29:
        return 'bg-green-100 text-green-800';
      case 33:
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100K text-gray-800';
    }
  };

  const getEventTypeLabel = (type: number) => {
    switch (type) {
      case 29:
        return 'Recognized';
      case 33:
        return 'Unrecognized';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Image Labeling</h1>
        <div className="flex items-center gap-2">
          <Badge variant="outline">Total: {imageEvents.length}</Badge>
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
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="deviceFilter">Device ID</Label>
              <Input
                id="deviceFilter"
                placeholder="e.g., R-1002"
                value={deviceFilter}
                onChange={(e) => setDeviceFilter(e.target.value)}
              />
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
              <Label htmlFor="eventType">Event Type</Label>
              <Select
                value={eventType.length > 0 ? eventType.join(',') : 'all'}
                onValueChange={(value) => setEventType(value === 'all' ? [] : value.split(','))}
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
            <div className="flex justify-end mb-4">
              <Button
                onClick={() => setIsLabelDialogOpen(true)}
                disabled={selectedEvents.length === 0}
              >
                <Tag className="h-4 w-4 mr-2" />
                Label Selected ({selectedEvents.length})
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Checkbox
                      checked={selectedEvents.length === imageEvents.length && imageEvents.length > 0}
                      onCheckedChange={(checked: unknown) => {
                        if (checked) {
                          setSelectedEvents(imageEvents.map(event => event.id));
                        } else {
                          setSelectedEvents([]);
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead>Event ID</TableHead>
                  <TableHead>Device ID</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Image</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {imageEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedEvents.includes(event.id)}
                        onCheckedChange={() => handleSelectEvent(event.id)}
                      />
                    </TableCell>
                    <TableCell>{event.id}</TableCell>
                    <TableCell>{event.deviceId}</TableCell>
                    <TableCell>{event.details.channel_name}</TableCell>
                    <TableCell>{event.details.score?.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge className={getEventTypeColor(event.type)}>
                        {getEventTypeLabel(event.type)}
                      </Badge>
                    </TableCell>
                    <TableCell>{event.date}</TableCell>
                    <TableCell>{event.begin}</TableCell>
                    <TableCell>{event.details.duration || 'N/A'}s</TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                            <img src={event.details.image_path} alt={`Event ${event.id}`} className="w-12 h-12 rounded" onError={(e) => { e.currentTarget.src = '/placeholder-image.png'; }} />
                          
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
                              onError={(e) => { e.currentTarget.src = '/placeholder-image.png'; }}
                            />
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div><strong>Event ID:</strong> {event.id}</div>
                              <div><strong>Device:</strong> {event.deviceId}</div>
                              <div><strong>Channel:</strong> {event.details.channel_name}</div>
                              <div><strong>Score:</strong> {event.details.score}</div>
                              <div><strong>Type:</strong> {getEventTypeLabel(event.type)}</div>
                              <div><strong>Date:</strong> {event.date}</div>
                              <div><strong>Time:</strong> {event.begin}</div>
                              <div><strong>Duration:</strong> {event.details.duration || 'N/A'}s</div>
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

      <Dialog open={isLabelDialogOpen} onOpenChange={setIsLabelDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Label Events</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="detectionType">Detection Type</Label>
              <Select
                value={detectionType}
                onValueChange={(value: 'Program Content' | 'Commercial Break' | 'Spots outside breaks' | 'Auto-promo' | 'Song' | 'Error') => setDetectionType(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select detection type" />
                </SelectTrigger>
                <SelectContent>
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
              <Label htmlFor="format">Format (2-digit code, optional)</Label>
              <Input
                id="format"
                placeholder="e.g., 01"
                value={format}
                onChange={(e) => setFormat(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="content">Content (3-digit code, optional)</Label>
              <Input
                id="content"
                placeholder="e.g., 001"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="title">Title (optional)</Label>
              <Input
                id="title"
                placeholder="Enter title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            {detectionType === 'Program Content' && (
              <>
                <div>
                  <Label htmlFor="episodeId">Episode ID (optional)</Label>
                  <Input
                    id="episodeId"
                    placeholder="Enter episode ID"
                    value={episodeId}
                    onChange={(e) => setEpisodeId(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="seasonId">Season ID (optional)</Label>
                  <Input
                    id="seasonId"
                    placeholder="Enter season ID"
                    value={seasonId}
                    onChange={(e) => setSeasonId(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="programDescription">Description</Label>
                  <Input
                    id="programDescription"
                    placeholder="Enter description"
                    value={programDescription}
                    onChange={(e) => setProgramDescription(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="programFormatType">Format Type</Label>
                  <Select value={programFormatType} onValueChange={value => setProgramFormatType(value as ProgramFormatType)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select format type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Film">Film</SelectItem>
                      <SelectItem value="Series">Series</SelectItem>
                      <SelectItem value="Structured Studio Programs">Structured Studio Programs</SelectItem>
                      <SelectItem value="Interactive Programs">Interactive Programs</SelectItem>
                      <SelectItem value="Artistic Performances">Artistic Performances</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="programContentType">Content Type</Label>
                  <Select value={programContentType} onValueChange={value => setProgramContentType(value as ProgramContentType)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select content type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Popular Drama / Comedy">Popular Drama / Comedy</SelectItem>
                      <SelectItem value="Animation Film">Animation Film</SelectItem>
                      <SelectItem value="Documentary Film">Documentary Film</SelectItem>
                      <SelectItem value="Short Film">Short Film</SelectItem>
                      <SelectItem value="Other Film">Other Film</SelectItem>
                      <SelectItem value="General News">General News</SelectItem>
                      <SelectItem value="Animation Series / Cartoon">Animation Series / Cartoon</SelectItem>
                      <SelectItem value="Documentary Series">Documentary Series</SelectItem>
                      <SelectItem value="Docusoap / Reality Series">Docusoap / Reality Series</SelectItem>
                      <SelectItem value="Other Series">Other Series</SelectItem>
                      <SelectItem value="Science / Geography">Science / Geography</SelectItem>
                      <SelectItem value="Lifestyle: Showbiz, Stars">Lifestyle: Showbiz, Stars</SelectItem>
                      <SelectItem value="Entertainment: Humor">Entertainment: Humor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
            {detectionType === 'Spots outside breaks' && (
              <div>
                <Label htmlFor="spotsFormatType">Format Type</Label>
                <Select value={spotsFormatType} onValueChange={value => setSpotsFormatType(value as SpotsFormatType)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select format type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BB">BB</SelectItem>
                    <SelectItem value="CAPB">CAPB</SelectItem>
                    <SelectItem value="OOBS">OOBS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            {detectionType === 'Auto-promo' && (
              <div>
                <Label htmlFor="autoPromoContentType">Content Type</Label>
                <Select value={autoPromoContentType} onValueChange={value => setAutoPromoContentType(value as AutoPromoContentType)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select content type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Foreign">Foreign</SelectItem>
                    <SelectItem value="Other Advertising">Other Advertising</SelectItem>
                    <SelectItem value="Sports: Football">Sports: Football</SelectItem>
                    <SelectItem value="Tele-shopping">Tele-shopping</SelectItem>
                    <SelectItem value="Other / Mixed / Unknown">Other / Mixed / Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            {detectionType === 'Song' && (
              <>
                <div>
                  <Label htmlFor="songName">Song Name</Label>
                  <Input
                    id="songName"
                    placeholder="Enter song name"
                    value={songName}
                    onChange={(e) => setSongName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="artistName">Artist Name</Label>
                  <Input
                    id="artistName"
                    placeholder="Enter artist name"
                    value={artistName}
                    onChange={(e) => setArtistName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="movieNameOrAlbumName">Movie/Album Name (optional)</Label>
                  <Input
                    id="movieNameOrAlbumName"
                    placeholder="Enter movie or album name"
                    value={movieNameOrAlbumName}
                    onChange={(e) => setMovieNameOrAlbumName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="yearOfPublication">Year of Publication (optional)</Label>
                  <Input
                    id="yearOfPublication"
                    placeholder="Enter year"
                    value={yearOfPublication}
                    onChange={(e) => setYearOfPublication(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="songGenre">Genre (optional)</Label>
                  <Input
                    id="songGenre"
                    placeholder="Enter genre"
                    value={songGenre}
                    onChange={(e) => setSongGenre(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="songTempo">Tempo (optional)</Label>
                  <Input
                    id="songTempo"
                    placeholder="Enter tempo"
                    value={songTempo}
                    onChange={(e) => setSongTempo(e.target.value)}
                  />
                </div>
              </>
            )}
            {detectionType === 'Error' && (
              <div>
                <Label htmlFor="errorType">Error Type</Label>
                <Select value={errorType} onValueChange={value => setErrorType(value as 'Signal Lost' | 'Blank Image')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select error type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Signal Lost">Signal Lost</SelectItem>
                    <SelectItem value="Blank Image">Blank Image</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="repeat"
                checked={repeat}
                onCheckedChange={(checked: unknown) => setRepeat(!!checked)}
              />
              <Label htmlFor="repeat">Repeat Broadcast</Label>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsLabelDialogOpen(false)}
                disabled={labeling}
              >
                Cancel
              </Button>
              <Button onClick={handleLabelEvent} disabled={labeling}>
                {labeling ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Labeling...
                  </>
                ) : (
                  'Label Events'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
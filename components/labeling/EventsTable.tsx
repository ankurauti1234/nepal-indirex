/* eslint-disable @next/next/no-img-element */
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Tag } from "lucide-react";
import { ImageEventResponse } from "@/services/stream.service";

interface EventsTableProps {
  imageEvents: ImageEventResponse[];
  selectedEvents: number[];
  loading: boolean;
  onSelectEvent: (eventId: number | number[]) => void;
  onLabelClick: () => void;
}
export default function EventsTable({
  imageEvents,
  selectedEvents,
  loading,
  onSelectEvent,
  onLabelClick,
}: EventsTableProps) {
  const getEventTypeColor = (type: number) => {
    switch (type) {
      case 29:
        return "bg-green-100 text-green-800";
      case 33:
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getEventTypeLabel = (type: number) => {
    switch (type) {
      case 29:
        return "Recognized";
      case 33:
        return "Unrecognized";
      default:
        return "Unknown";
    }
  };

  return (
    <Card>
      <CardContent>
        <div className="flex justify-end mb-4">
          <Button
            onClick={onLabelClick}
            disabled={selectedEvents.length === 0}
          >
            <Tag className="h-4 w-4 mr-2" />
            Label Selected ({selectedEvents.length})
          </Button>
        </div>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Checkbox
                    checked={
                      selectedEvents.length === imageEvents.length &&
                      imageEvents.length > 0
                    }
                    onCheckedChange={(checked: boolean) => {
                      if (checked) {
                        onSelectEvent(imageEvents.map((event) => event.id));
                      } else {
                        onSelectEvent([]);
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
                      onCheckedChange={() => onSelectEvent(event.id)}
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
                  <TableCell>{event.details.duration || "N/A"}s</TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <img
                          src={event.details.image_path}
                          alt={`Event ${event.id}`}
                          className="w-12 h-12 rounded"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder-image.png";
                          }}
                        />
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
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder-image.png";
                            }}
                          />
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <strong>Event ID:</strong> {event.id}
                            </div>
                            <div>
                              <strong>Device:</strong> {event.deviceId}
                            </div>
                            <div>
                              <strong>Channel:</strong>{" "}
                              {event.details.channel_name}
                            </div>
                            <div>
                              <strong>Score:</strong> {event.details.score}
                            </div>
                            <div>
                              <strong>Type:</strong>{" "}
                              {getEventTypeLabel(event.type)}
                            </div>
                            <div>
                              <strong>Date:</strong> {event.date}
                            </div>
                            <div>
                              <strong>Time:</strong> {event.begin}
                            </div>
                            <div>
                              <strong>Duration:</strong>{" "}
                              {event.details.duration || "N/A"}s
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
        )}
      </CardContent>
    </Card>
  );
}
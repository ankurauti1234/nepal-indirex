import { ReactNode } from 'react';
import api from './api';

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface PaginatedResponse<T> {
  error: string;
  success: boolean;
  message: string;
  data: T[] | undefined;
  pagination: Pagination;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface ImageProcessingEventFilter extends PaginationQuery {
  deviceId?: string;
  date?: string; // YYYY-MM-DD
  startTime?: string; // HH:MM (24-hour, e.g., 05:00)
  endTime?: string; // HH:MM (24-hour, e.g., 09:30)
  type?: number[]; // Event types (e.g., [29, 33] or empty for all)
}

export interface LabeledEventFilter extends PaginationQuery {
  deviceId?: string;
  labeledBy?: string;
  detectionType?: string;
  date?: string; // YYYY-MM-DD
  startTime?: string; // HH:MM
  endTime?: string; // HH:MM
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface ImageEventDetails {
  score: number;
  image_path: string;
  channel_name: string;
  original_image_path?: string;
  duration?: number; // Duration in seconds, calculated on backend for display
}

export interface ProgramContentDetails {
  description?: string;
  formatType?: 'Film' | 'Series' | 'Structured Studio Programs' | 'Interactive Programs' | 'Artistic Performances';
  contentType?: 'Popular Drama / Comedy' | 'Animation Film' | 'Documentary Film' | 'Short Film' | 'Other Film' |
                'General News' | 'Animation Series / Cartoon' | 'Documentary Series' | 'Docusoap / Reality Series' |
                'Other Series' | 'Science / Geography' | 'Lifestyle: Showbiz, Stars' | 'Entertainment: Humor';
  episodeId?: string;
  seasonId?: string;
}

export interface CommercialBreakDetails {
  category?: string;
  sector?: string;
}

export interface SpotsOutsideBreaksDetails {
  formatType?: 'BB' | 'CAPB' | 'OOBS';
  category?: string;
  sector?: string;
}

export interface AutoPromoDetails {
  contentType?: 'Foreign' | 'Other Advertising' | 'Sports: Football' | 'Tele-shopping' | 'Other / Mixed / Unknown';
  category?: string;
  sector?: string;
}

export interface SongDetails {
  songName?: string;
  movieNameOrAlbumName?: string;
  artistName?: string;
  yearOfPublication?: string;
  genre?: string;
  tempo?: string;
}

export interface ErrorDetails {
  errorType?: 'Signal Lost' | 'Blank Image';
}

export interface ImageEventResponse {
  begin: ReactNode;
  date: ReactNode;
  id: number;
  deviceId: string;
  timestamp: string;
  type: number; // e.g., 29 (Recognized), 33 (Unrecognized)
  details: ImageEventDetails;
  createdAt: string;
}

export interface LabeledEventResponse {
  timestampEnd: string;
  timestampStart: string;
  id: number;
  deviceId: string;
  originalEventId: number;
  timestamp: string;
  date: string; // YYYYMMDD
  begin: string; // HHMMSS
  format?: string; // 2-digit code
  content?: string; // 3-digit code
  title?: string;
  episodeId?: string; // Only for Program Content
  seasonId?: string; // Only for Program Content
  repeat: boolean;
  detectionType: 'Program Content' | 'Commercial Break' | 'Spots outside breaks' | 'Auto-promo' | 'Song' | 'Error';
  details: ProgramContentDetails | CommercialBreakDetails | SpotsOutsideBreaksDetails | AutoPromoDetails | SongDetails | ErrorDetails;
  labeledBy?: string;
  labeledAt: string;
  createdAt: string;
  images?: string[];
}

export interface LabelEventRequest {
  eventIds: number[];
  detectionType: 'Program Content' | 'Commercial Break' | 'Spots outside breaks' | 'Auto-promo' | 'Song' | 'Error';
  format?: string; // 2-digit code
  content?: string; // 3-digit code
  title?: string;
  episodeId?: string; // Only for Program Content
  seasonId?: string; // Only for Program Content
  repeat: boolean;
  labeledBy?: string;
  programContentDetails?: ProgramContentDetails;
  commercialBreakDetails?: CommercialBreakDetails;
  spotsOutsideBreaksDetails?: SpotsOutsideBreaksDetails;
  autoPromoDetails?: AutoPromoDetails;
  songDetails?: SongDetails;
  errorDetails?: ErrorDetails;
}

export const getEvents = async (filters: ImageProcessingEventFilter = {}): Promise<PaginatedResponse<ImageEventResponse>> => {
  try {
    const params = new URLSearchParams();
    if (filters.deviceId) params.append('deviceId', filters.deviceId);
    if (filters.type) params.append('type', filters.type.join(','));
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.sort) params.append('sort', filters.sort);
    if (filters.order) params.append('order', filters.order);
    if (filters.date) params.append('date', filters.date);
    if (filters.startTime) params.append('startTime', filters.startTime);
    if (filters.endTime) params.append('endTime', filters.endTime);

    const response = await api.get<PaginatedResponse<ImageEventResponse>>('/stream/events', { params });
    if (response.data.success) {
      return response.data;
    }
    throw new Error(response.data.error || 'Failed to fetch events');
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch events');
  }
};

export const getImageProcessingEvents = async (filters: ImageProcessingEventFilter = {}): Promise<PaginatedResponse<ImageEventResponse>> => {
  try {
    const params = new URLSearchParams();
    if (filters.deviceId) params.append('deviceId', filters.deviceId);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.sort) params.append('sort', filters.sort);
    if (filters.order) params.append('order', filters.order);
    if (filters.date) params.append('date', filters.date);
    if (filters.startTime) params.append('startTime', filters.startTime);
    if (filters.endTime) params.append('endTime', filters.endTime);

    const response = await api.get<PaginatedResponse<ImageEventResponse>>('/stream/events/image-processing', { params });
    if (response.data.success) {
      return response.data;
    }
    throw new Error(response.data.error || 'Failed to fetch image processing events');
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch image processing events');
  }
};

export const getUnrecognizedEvents = async (filters: ImageProcessingEventFilter = {}): Promise<PaginatedResponse<ImageEventResponse>> => {
  try {
    const params = new URLSearchParams();
    if (filters.deviceId) params.append('deviceId', filters.deviceId);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.sort) params.append('sort', filters.sort);
    if (filters.order) params.append('order', filters.order);
    if (filters.date) params.append('date', filters.date);
    if (filters.startTime) params.append('startTime', filters.startTime);
    if (filters.endTime) params.append('endTime', filters.endTime);

    const response = await api.get<PaginatedResponse<ImageEventResponse>>('/stream/events/unrecognized', { params });
    if (response.data.success) {
      return response.data;
    }
    throw new Error(response.data.error || 'Failed to fetch unrecognized events');
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch unrecognized events');
  }
};

export const labelEvent = async (labelRequest: LabelEventRequest): Promise<ApiResponse<LabeledEventResponse[]>> => {
  try {
    const response = await api.post<ApiResponse<LabeledEventResponse[]>>('/stream/events/label', labelRequest);
    if (response.data.success) {
      return response.data;
    }
    throw new Error(response.data.error || 'Failed to label event');
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to label event');
  }
};

export const getLabeledEvents = async (filters: LabeledEventFilter = {}): Promise<PaginatedResponse<LabeledEventResponse>> => {
  try {
    const params = new URLSearchParams();
    if (filters.deviceId) params.append('deviceId', filters.deviceId);
    if (filters.labeledBy) params.append('labeledBy', filters.labeledBy);
    if (filters.detectionType) params.append('detectionType', filters.detectionType);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.sort) params.append('sort', filters.sort);
    if (filters.order) params.append('order', filters.order);
    if (filters.date) params.append('date', filters.date);
    if (filters.startTime) params.append('startTime', filters.startTime);
    if (filters.endTime) params.append('endTime', filters.endTime);

    const response = await api.get<PaginatedResponse<LabeledEventResponse>>('/stream/events/labeled', { params });
    if (response.data.success) {
      return response.data;
    }
    throw new Error(response.data.error || 'Failed to fetch labeled events');
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch labeled events');
  }
};

export const getManuallyLabeledEvents = async (filters: LabeledEventFilter = {}): Promise<PaginatedResponse<LabeledEventResponse>> => {
  try {
    const params = new URLSearchParams();
    if (filters.deviceId) params.append('deviceId', filters.deviceId);
    if (filters.labeledBy) params.append('labeledBy', filters.labeledBy);
    if (filters.detectionType) params.append('detectionType', filters.detectionType);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.sort) params.append('sort', filters.sort);
    if (filters.order) params.append('order', filters.order);
    if (filters.date) params.append('date', filters.date);
    if (filters.startTime) params.append('startTime', filters.startTime);
    if (filters.endTime) params.append('endTime', filters.endTime);

    const response = await api.get<PaginatedResponse<LabeledEventResponse>>('/stream/events/manually-labeled', { params });
    if (response.data.success) {
      return response.data;
    }
    throw new Error(response.data.error || 'Failed to fetch manually labeled events');
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch manually labeled events');
  }
};
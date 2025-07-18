import api, { PaginatedResponse, EventResponse, PaginationQuery, ApiResponse } from './api';

interface EventFilter extends PaginationQuery {
  deviceId?: string;
  type?: number[];
}

interface ImageProcessingEventFilter extends PaginationQuery {
  deviceId?: string;
}

export interface LabeledEventFilter extends PaginationQuery {
  deviceId?: string;
  labeledBy?: string;
}

export interface ImageEventDetails {
  score: number;
  image_path: string;
  channel_name: string;
  brand_name?: string;
  advertiser?: string;
  labels?: string[];
  original_image_path?: string;
}

export interface ImageEventResponse extends EventResponse {
  details: ImageEventDetails;
  processing_type?: 'recognized' | 'processed' | 'unrecognized';
}

export interface LabeledEventResponse {
  id: number;
  deviceId: string;
  originalEventId: number;
  timestamp: string;
  details: ImageEventDetails;
  labeledBy?: string;
  labeledAt: string;
  createdAt: string;
}

export interface LabelEventRequest {
  eventId: number;
  labels: string[];
  labeledBy?: string;
}

// Existing events API
export const getEvents = async (filters: EventFilter = {}): Promise<PaginatedResponse<EventResponse>> => {
  try {
    const params = new URLSearchParams();
    if (filters.deviceId) params.append('deviceId', filters.deviceId);
    if (filters.type !== undefined) params.append('type', filters.type.toString());
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.sort) params.append('sort', filters.sort);
    if (filters.order) params.append('order', filters.order);

    const response = await api.get<PaginatedResponse<EventResponse>>('/stream/events', { params });
    if (response.data.success) {
      return response.data;
    }
    throw new Error(response.data.error || 'Failed to fetch events');
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch events');
  }
};

// Get image processing events (types 29 and 23)
export const getImageProcessingEvents = async (filters: ImageProcessingEventFilter = {}): Promise<PaginatedResponse<ImageEventResponse>> => {
  try {
    const params = new URLSearchParams();
    if (filters.deviceId) params.append('deviceId', filters.deviceId);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.sort) params.append('sort', filters.sort);
    if (filters.order) params.append('order', filters.order);

    const response = await api.get<PaginatedResponse<ImageEventResponse>>('/stream/events/image-processing', { params });
    if (response.data.success) {
      return response.data;
    }
    throw new Error(response.data.error || 'Failed to fetch image processing events');
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch image processing events');
  }
};

// Get unrecognized events (type 33)
export const getUnrecognizedEvents = async (filters: ImageProcessingEventFilter = {}): Promise<PaginatedResponse<ImageEventResponse>> => {
  try {
    const params = new URLSearchParams();
    if (filters.deviceId) params.append('deviceId', filters.deviceId);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.sort) params.append('sort', filters.sort);
    if (filters.order) params.append('order', filters.order);

    const response = await api.get<PaginatedResponse<ImageEventResponse>>('/stream/events/unrecognized', { params });
    if (response.data.success) {
      return response.data;
    }
    throw new Error(response.data.error || 'Failed to fetch unrecognized events');
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch unrecognized events');
  }
};

// Label an event
export const labelEvent = async (labelRequest: LabelEventRequest): Promise<ApiResponse<LabeledEventResponse>> => {
  try {
    const response = await api.post<ApiResponse<LabeledEventResponse>>('/stream/events/label', labelRequest);
    if (response.data.success) {
      return response.data;
    }
    throw new Error(response.data.error || 'Failed to label event');
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to label event');
  }
};

// Get labeled events
export const getLabeledEvents = async (filters: LabeledEventFilter = {}): Promise<PaginatedResponse<LabeledEventResponse>> => {
  try {
    const params = new URLSearchParams();
    if (filters.deviceId) params.append('deviceId', filters.deviceId);
    if (filters.labeledBy) params.append('labeledBy', filters.labeledBy);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.sort) params.append('sort', filters.sort);
    if (filters.order) params.append('order', filters.order);

    const response = await api.get<PaginatedResponse<LabeledEventResponse>>('/stream/events/labeled', { params });
    if (response.data.success) {
      return response.data;
    }
    throw new Error(response.data.error || 'Failed to fetch labeled events');
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch labeled events');
  }
};
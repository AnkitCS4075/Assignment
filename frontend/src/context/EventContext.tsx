import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { socket } from '../socket';

interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
  organizer: {
    _id: string;
    name: string;
    email: string;
  };
  attendees: {
    _id: string;
    name: string;
    email: string;
  }[];
  maxAttendees?: number;
  image?: string;
}

interface EventContextType {
  events: Event[];
  loading: boolean;
  error: string | null;
  socketConnected: boolean;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  fetchEvents: (filters?: any) => Promise<void>;
  createEvent: (eventData: Omit<Event, '_id' | 'organizer' | 'attendees'>) => Promise<Event>;
  updateEvent: (eventId: string, eventData: Partial<Event>) => Promise<Event>;
  deleteEvent: (eventId: string) => Promise<void>;
  joinEvent: (eventId: string) => Promise<void>;
  leaveEvent: (eventId: string) => Promise<void>;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export function EventProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [currentFilters, setCurrentFilters] = useState({});
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 9,
    totalPages: 1
  });

  const { token, user } = useAuth();

  const fetchEvents = useCallback(async (filters = {}) => {
    if (!token) return;
    
    try {
      setLoading(true);
      setError(null);
      setCurrentFilters(filters);

      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/events?${queryParams.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setEvents(response.data.data);
      setPagination(response.data.pagination);
    } catch (error: any) {
      console.error('Fetch events error:', error.response?.data || error.message);
      setError(error.response?.data?.error || 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  }, [token]);

  const createEvent = async (eventData: Omit<Event, '_id' | 'organizer' | 'attendees'>) => {
    setError(null);
    try {
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/events`,
        eventData,
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const newEvent = response.data;
      setEvents(prev => [...prev, newEvent]);
      return newEvent;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to create event';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateEvent = async (eventId: string, eventData: Partial<Event>) => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/events/${eventId}`,
        eventData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Update event error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Failed to update event');
    }
  };

  const deleteEvent = async (eventId: string) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/events/${eventId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
    } catch (error: any) {
      console.error('Delete event error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Failed to delete event');
    }
  };

  const joinEvent = async (eventId: string) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/events/${eventId}/join`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Immediately update the local state
      setEvents(prevEvents => 
        prevEvents.map(event => {
          if (event._id === eventId && user) {
            return {
              ...event,
              attendees: [...event.attendees, {
                _id: user._id,
                name: user.name,
                email: user.email
              }]
            };
          }
          return event;
        })
      );

      // Silently fetch fresh data in the background
      const queryParams = new URLSearchParams();
      Object.entries(currentFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/events?${queryParams.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setEvents(response.data.data);
      setPagination(response.data.pagination);
    } catch (error: any) {
      console.error('Join event error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Failed to join event');
    }
  };

  const leaveEvent = async (eventId: string) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/events/${eventId}/leave`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Immediately update the local state
      setEvents(prevEvents => 
        prevEvents.map(event => {
          if (event._id === eventId && user) {
            return {
              ...event,
              attendees: event.attendees.filter(
                attendee => attendee._id !== user._id
              )
            };
          }
          return event;
        })
      );

      // Silently fetch fresh data in the background
      const queryParams = new URLSearchParams();
      Object.entries(currentFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/events?${queryParams.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setEvents(response.data.data);
      setPagination(response.data.pagination);
    } catch (error: any) {
      console.error('Leave event error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Failed to leave event');
    }
  };

  useEffect(() => {
    if (token) {
      socket.auth = { token };
      socket.connect();

      socket.on('connect', () => {
        console.log('Socket connected');
        setSocketConnected(true);
      });

      socket.on('disconnect', () => {
        console.log('Socket disconnected');
        setSocketConnected(false);
      });

      socket.on('eventCreated', (event: Event) => {
        setEvents(prev => [...prev, event]);
      });

      socket.on('eventUpdated', (updatedEvent: Event) => {
        setEvents(prev => prev.map(event => 
          event._id === updatedEvent._id ? updatedEvent : event
        ));
      });

      socket.on('eventDeleted', (eventId: string) => {
        setEvents(prev => prev.filter(event => event._id !== eventId));
      });

      return () => {
        socket.off('connect');
        socket.off('disconnect');
        socket.off('eventCreated');
        socket.off('eventUpdated');
        socket.off('eventDeleted');
        socket.disconnect();
      };
    }
  }, [token]);

  return (
    <EventContext.Provider
      value={{
        events,
        loading,
        error,
        socketConnected,
        pagination,
        fetchEvents,
        createEvent,
        updateEvent,
        deleteEvent,
        joinEvent,
        leaveEvent
      }}
    >
      {children}
    </EventContext.Provider>
  );
}

export function useEvents() {
  const context = useContext(EventContext);
  if (context === undefined) {
    throw new Error('useEvents must be used within an EventProvider');
  }
  return context;
} 
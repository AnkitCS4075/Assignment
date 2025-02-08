import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useEvents } from '../../context/EventContext';
import { useAuth } from '../../context/AuthContext';
import EventFilters from './EventFilters';
import Pagination from '../common/Pagination';
import Modal from '../common/Modal';
import EventDetails from './EventDetails';
import EventForm from './EventForm';
import { EventFilters as FilterTypes } from '../../types/event';

const defaultFilters: FilterTypes = {
  searchQuery: '',
  category: '',
  startDate: '',
  endDate: '',
  isUpcoming: false,
  sortBy: 'date',
  sortOrder: 'asc',
  page: 1,
  limit: 9
};

// Add categories to be used in filters
export const categories = [
  'Conference',
  'Workshop',
  'Seminar',
  'Networking',
  'Social',
  'Other'
];

export default function EventList() {
  const { events, loading, error, pagination, fetchEvents } = useEvents();
  const { user } = useAuth();
  const location = useLocation();
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<FilterTypes>({
    ...defaultFilters,
    page: currentPage
  });
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Initial load of events
  useEffect(() => {
    fetchEvents({
      ...defaultFilters,
      page: currentPage
    });
  }, []);

  // Reset filters when navigating to dashboard or home
  useEffect(() => {
    if (location.pathname === '/dashboard' || location.pathname === '/') {
      setFilters({
        ...defaultFilters,
        page: 1
      });
      setCurrentPage(1);
      fetchEvents({
        ...defaultFilters,
        page: 1
      });
    }
  }, [location.pathname]);

  // Handle filter changes
  useEffect(() => {
    const updatedFilters = {
      ...filters,
      page: currentPage
    };
    fetchEvents(updatedFilters);
  }, [filters, currentPage]);

  const handleFilterChange = (newFilters: FilterTypes) => {
    setCurrentPage(1); // Reset to first page when filters change
    setFilters(newFilters);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEventClick = (e: React.MouseEvent, eventId: string) => {
    e.preventDefault();
    setSelectedEvent(eventId);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-500">
          Discover Events
        </h1>
        {user && !user.isGuest && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-md text-white bg-gradient-to-r from-indigo-600 to-purple-500 hover:from-indigo-700 hover:to-purple-600 transform hover:scale-105 transition-all duration-200"
          >
            <svg
              className="mr-2 h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Create Event
          </button>
        )}
      </div>

      {/* Filter Section */}
      <div className="mb-8 sm:mb-10">
        <EventFilters onFilterChange={handleFilterChange} filters={filters} />
      </div>

      {events.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No events found</h3>
          <p className="mt-2 text-sm text-gray-500">
            {user && !user.isGuest 
              ? 'Try adjusting your filters or create a new event.'
              : 'Try adjusting your filters to find events.'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <button
                key={event._id}
                onClick={(e) => handleEventClick(e, event._id)}
                className="text-left group block transform hover:-translate-y-1 transition-all duration-200 focus:outline-none"
              >
                <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-200">
                  {event.image ? (
                    <div className="relative h-48 w-full overflow-hidden">
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-200"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="text-lg font-semibold text-white line-clamp-2">
                          {event.title}
                        </h3>
                      </div>
                    </div>
                  ) : (
                    <div className="relative h-48 w-full bg-gradient-to-br from-indigo-500 to-purple-600">
                      <div className="absolute inset-0 opacity-20">
                        <svg className="w-full h-full" fill="none" viewBox="0 0 24 24">
                          <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="text-lg font-semibold text-white line-clamp-2">
                          {event.title}
                        </h3>
                      </div>
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        {event.category}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(event.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                      {event.description}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center">
                        <svg
                          className="h-4 w-4 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        <span className="ml-1.5 truncate max-w-[150px]">
                          {event.location}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <svg
                          className="h-4 w-4 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                          />
                        </svg>
                        <span className="ml-1.5">
                          {event.attendees?.length || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Update pagination section */}
          {pagination && pagination.totalPages > 1 && (
            <div className="mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}

      {/* Event Details Modal */}
      <Modal
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        title="Event Details"
        size="lg"
      >
        {selectedEvent && (
          <EventDetails
            eventId={selectedEvent}
            onClose={() => setSelectedEvent(null)}
          />
        )}
      </Modal>

      {/* Create Event Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Event"
        size="lg"
      >
        <EventForm
          onSuccess={() => {
            setIsCreateModalOpen(false);
            fetchEvents(filters);
          }}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>
    </div>
  );
} 
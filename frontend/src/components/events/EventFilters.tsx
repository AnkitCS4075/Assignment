import React, { useState } from 'react';
import { EventFilters as FilterTypes } from '../../types/event';
import { useEvents } from '../../context/EventContext';

interface EventFiltersProps {
  onFilterChange: (filters: FilterTypes) => void;
  filters: FilterTypes;
}

export default function EventFilters({ onFilterChange, filters }: EventFiltersProps) {
  const { fetchEvents } = useEvents();
  const [isExpanded, setIsExpanded] = useState(false);
  
  const categories = [
    'Conference',
    'Workshop',
    'Seminar',
    'Networking',
    'Social',
    'Other'
  ];

  const defaultFilters: FilterTypes = {
    searchQuery: '',
    category: '',
    startDate: '',
    endDate: '',
    isUpcoming: false,
    sortBy: 'date',
    sortOrder: 'asc'
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value, type } = e.target;
    let newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

    if (name === 'category' && value === 'All Categories') {
      newValue = '';
    }

    const updatedFilters = {
      ...filters,
      [name]: newValue
    };

    if (name === 'searchQuery') {
      setTimeout(() => {
        onFilterChange(updatedFilters);
      }, 300);
    } else {
      onFilterChange(updatedFilters);
    }
  };

  const handleClearFilters = async () => {
    onFilterChange(defaultFilters);
    await fetchEvents(defaultFilters);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl">
      <div 
        className="p-4 border-b border-gray-100 flex justify-between items-center cursor-pointer bg-gradient-to-r from-indigo-50 to-purple-50 rounded-t-xl"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
          <svg 
            className="w-5 h-5 text-indigo-600" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" 
            />
          </svg>
          <span>Filter Events</span>
        </h3>
        <button 
          className="text-gray-500 hover:text-indigo-600 transition-colors duration-200"
        >
          <svg
            className={`w-6 h-6 transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {isExpanded && (
        <div className="p-4 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search input */}
            <div className="group">
              <label htmlFor="searchQuery" className="block text-sm font-medium text-gray-700 mb-1">
                Search Events
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="searchQuery"
                  id="searchQuery"
                  value={filters.searchQuery}
                  onChange={handleChange}
                  placeholder="Search events..."
                  className="block w-full rounded-lg border-gray-300 bg-gray-50 pl-10 
                    focus:border-indigo-500 focus:ring-indigo-500 
                    hover:border-indigo-400 transition-colors duration-200"
                />
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg className="h-5 w-5 text-gray-400 group-hover:text-indigo-500 transition-colors duration-200" 
                    viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Category filter */}
            <div className="group">
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={filters.category || 'All Categories'}
                onChange={handleChange}
                className="block w-full rounded-lg border-gray-300 bg-gray-50
                  focus:border-indigo-500 focus:ring-indigo-500 
                  hover:border-indigo-400 transition-colors duration-200"
              >
                <option value="All Categories">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Date filters */}
            <div className="group">
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={filters.startDate}
                onChange={handleChange}
                className="block w-full rounded-lg border-gray-300 bg-gray-50
                  focus:border-indigo-500 focus:ring-indigo-500 
                  hover:border-indigo-400 transition-colors duration-200"
              />
            </div>

            <div className="group">
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={filters.endDate}
                onChange={handleChange}
                className="block w-full rounded-lg border-gray-300 bg-gray-50
                  focus:border-indigo-500 focus:ring-indigo-500 
                  hover:border-indigo-400 transition-colors duration-200"
              />
            </div>

            {/* Sort options */}
            <div className="group">
              <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <select
                id="sortBy"
                name="sortBy"
                value={filters.sortBy}
                onChange={handleChange}
                className="block w-full rounded-lg border-gray-300 bg-gray-50
                  focus:border-indigo-500 focus:ring-indigo-500 
                  hover:border-indigo-400 transition-colors duration-200"
              >
                <option value="date">Date</option>
                <option value="title">Title</option>
                <option value="attendees">Attendees</option>
              </select>
            </div>

            <div className="group">
              <label htmlFor="sortOrder" className="block text-sm font-medium text-gray-700 mb-1">
                Sort Order
              </label>
              <select
                name="sortOrder"
                id="sortOrder"
                value={filters.sortOrder}
                onChange={handleChange}
                className="block w-full rounded-lg border-gray-300 bg-gray-50
                  focus:border-indigo-500 focus:ring-indigo-500 
                  hover:border-indigo-400 transition-colors duration-200"
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>

            {/* Upcoming events toggle */}
            <div className="col-span-full sm:col-span-2 flex items-center space-x-3 bg-gray-50 p-3 rounded-lg group hover:bg-indigo-50 transition-colors duration-200">
              <input
                type="checkbox"
                id="isUpcoming"
                name="isUpcoming"
                checked={filters.isUpcoming}
                onChange={handleChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded 
                  transition-colors duration-200"
              />
              <label htmlFor="isUpcoming" className="text-sm text-gray-700 group-hover:text-indigo-600 transition-colors duration-200">
                Show only upcoming events
              </label>
            </div>
          </div>

          {/* Clear Filters Button */}
          <div className="flex justify-end pt-4 border-t border-gray-100">
            <button
              onClick={handleClearFilters}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg 
                text-gray-700 bg-white hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                transition-all duration-200 transform hover:scale-105"
            >
              <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 
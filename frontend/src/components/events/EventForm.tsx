import { useState } from 'react';
import { useEvents } from '../../context/EventContext';

interface EventFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  isEditing?: boolean;
  initialData?: any;
}

export default function EventForm({ onSuccess, onCancel, isEditing = false, initialData }: EventFormProps) {
  const { createEvent, updateEvent, error } = useEvents();
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    date: initialData?.date || '',
    time: initialData?.time || '',
    location: initialData?.location || '',
    category: initialData?.category || 'Conference',
    maxAttendees: initialData?.maxAttendees || '',
    image: initialData?.image || ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const categories = [
    'Conference',
    'Workshop',
    'Seminar',
    'Networking',
    'Social',
    'Other'
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) return 'Title is required';
    if (!formData.description.trim()) return 'Description is required';
    if (!formData.date) return 'Date is required';
    if (!formData.time) return 'Time is required';
    if (!formData.location.trim()) return 'Location is required';
    if (!formData.category) return 'Category is required';
    if (formData.maxAttendees && parseInt(formData.maxAttendees) < 1) {
      return 'Maximum attendees must be at least 1';
    }
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    try {
      const validationError = validateForm();
      if (validationError) {
        setFormError(validationError);
        setIsSubmitting(false);
        return;
      }

      const eventData = {
        ...formData,
        maxAttendees: formData.maxAttendees ? parseInt(formData.maxAttendees) : undefined
      };

      if (isEditing && initialData?._id) {
        await updateEvent(initialData._id, eventData);
      } else {
        await createEvent(eventData);
      }

      onSuccess();
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to create event';
      setFormError(errorMessage);
      console.error('Event submission failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full">
      <div className="space-y-5 text-left">
        {/* Title Input */}
        <div className="group">
          <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-1 group-hover:text-indigo-600 transition-colors duration-200">
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm 
              focus:border-indigo-500 focus:ring-indigo-500 
              group-hover:border-indigo-300 transition-all duration-200
              bg-white hover:bg-indigo-50/30 text-left"
            required
            placeholder="Enter event title"
          />
        </div>

        {/* Description Input */}
        <div className="group">
          <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-1 group-hover:text-indigo-600 transition-colors duration-200">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            value={formData.description}
            onChange={handleChange}
            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm 
              focus:border-indigo-500 focus:ring-indigo-500 
              group-hover:border-indigo-300 transition-all duration-200
              bg-white hover:bg-indigo-50/30 text-left"
            required
            placeholder="Describe your event"
          />
        </div>

        {/* Date and Time Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="group">
            <label htmlFor="date" className="block text-sm font-semibold text-gray-700 mb-1 group-hover:text-indigo-600 transition-colors duration-200">
              Date
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm 
                focus:border-indigo-500 focus:ring-indigo-500 
                group-hover:border-indigo-300 transition-all duration-200
                bg-white hover:bg-indigo-50/30 text-left"
              required
            />
          </div>

          <div className="group">
            <label htmlFor="time" className="block text-sm font-semibold text-gray-700 mb-1 group-hover:text-indigo-600 transition-colors duration-200">
              Time
            </label>
            <input
              type="time"
              id="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm 
                focus:border-indigo-500 focus:ring-indigo-500 
                group-hover:border-indigo-300 transition-all duration-200
                bg-white hover:bg-indigo-50/30 text-left"
              required
            />
          </div>
        </div>

        {/* Location Input */}
        <div className="group">
          <label htmlFor="location" className="block text-sm font-semibold text-gray-700 mb-1 group-hover:text-indigo-600 transition-colors duration-200">
            Location
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm 
              focus:border-indigo-500 focus:ring-indigo-500 
              group-hover:border-indigo-300 transition-all duration-200
              bg-white hover:bg-indigo-50/30 text-left"
            required
            placeholder="Enter event location"
          />
        </div>

        {/* Category Select */}
        <div className="group">
          <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-1 group-hover:text-indigo-600 transition-colors duration-200">
            Category
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm 
              focus:border-indigo-500 focus:ring-indigo-500 
              group-hover:border-indigo-300 transition-all duration-200
              bg-white hover:bg-indigo-50/30 text-left"
            required
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Maximum Attendees Input */}
        <div className="group">
          <label htmlFor="maxAttendees" className="block text-sm font-semibold text-gray-700 mb-1 group-hover:text-indigo-600 transition-colors duration-200">
            Maximum Attendees
          </label>
          <input
            type="number"
            id="maxAttendees"
            name="maxAttendees"
            value={formData.maxAttendees}
            onChange={handleChange}
            min="1"
            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm 
              focus:border-indigo-500 focus:ring-indigo-500 
              group-hover:border-indigo-300 transition-all duration-200
              bg-white hover:bg-indigo-50/30 text-left"
            placeholder="Enter maximum number of attendees"
          />
        </div>

        {/* Image URL Input */}
        <div className="group">
          <label htmlFor="image" className="block text-sm font-semibold text-gray-700 mb-1 group-hover:text-indigo-600 transition-colors duration-200">
            Image URL
          </label>
          <input
            type="url"
            id="image"
            name="image"
            value={formData.image}
            onChange={handleChange}
            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm 
              focus:border-indigo-500 focus:ring-indigo-500 
              group-hover:border-indigo-300 transition-all duration-200
              bg-white hover:bg-indigo-50/30 text-left"
            placeholder="Enter image URL for your event"
          />
        </div>
      </div>

      {/* Error Display */}
      {(formError || error) && (
        <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg animate-fade-in text-left">
          {formError || error}
        </div>
      )}

      {/* Form Actions */}
      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={onCancel}
          className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium 
            text-gray-700 bg-white hover:bg-gray-50 hover:border-indigo-300 hover:text-indigo-600
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
            transition-all duration-200 transform hover:scale-105"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium 
            rounded-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 
            hover:from-indigo-700 hover:to-purple-700 
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
        >
          {isSubmitting ? (
            <span className="inline-flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Processing...
            </span>
          ) : (
            isEditing ? 'Update Event' : 'Create Event'
          )}
        </button>
      </div>
    </form>
  );
} 
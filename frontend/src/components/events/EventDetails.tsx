import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEvents } from '../../context/EventContext';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';

interface EventDetailsProps {
  eventId: string;
  onClose: () => void;
}

export default function EventDetails({ eventId, onClose }: EventDetailsProps) {
  const navigate = useNavigate();
  const { events, joinEvent, leaveEvent, deleteEvent, error } = useEvents();
  const { user } = useAuth();
  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const event = events.find(e => e._id === eventId);
  const isOrganizer = event?.organizer._id === user?._id;
  const isAttending = event?.attendees.some(attendee => attendee._id === user?._id);
  const isAtCapacity = event?.maxAttendees ? event.attendees.length >= event.maxAttendees : false;

  if (!event) {
    return null;
  }

  const handleJoin = async () => {
    try {
      setIsJoining(true);
      await joinEvent(eventId);
    } catch (error) {
      console.error('Failed to join event:', error);
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeave = async () => {
    try {
      setIsLeaving(true);
      await leaveEvent(eventId);
    } catch (error) {
      console.error('Failed to leave event:', error);
    } finally {
      setIsLeaving(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        setIsDeleting(true);
        await deleteEvent(eventId);
        onClose();
      } catch (error) {
        console.error('Failed to delete event:', error);
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Event Header */}
      <div>
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <h1 className="text-2xl font-bold text-gray-900">{event.title}</h1>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 whitespace-nowrap">
            {event.category}
          </span>
        </div>
        <p className="mt-4 text-gray-600 text-left">{event.description}</p>
      </div>

      {/* Event Image */}
      {event.image && (
        <div className="w-full">
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-48 sm:h-64 object-cover rounded-lg"
          />
        </div>
      )}

      {/* Event Details */}
      <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
        <div className="grid grid-cols-1 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Event Details</h3>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Date & Time</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {format(new Date(`${event.date} ${event.time}`), 'PPp')}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Location</dt>
                <dd className="mt-1 text-sm text-gray-900">{event.location}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Attendees</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {event.attendees.length}
                  {event.maxAttendees && ` / ${event.maxAttendees}`}
                </dd>
              </div>
            </dl>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-start">
            {error && (
              <div className="text-red-600 text-sm w-full sm:w-auto">
                {error}
              </div>
            )}
            
            {isOrganizer ? (
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    onClose();
                    navigate(`/events/${eventId}/edit`);
                  }}
                  className="w-full sm:w-auto inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transform transition-all duration-200 hover:scale-[1.02]"
                >
                  Edit Event
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="w-full sm:w-auto inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transform transition-all duration-200 hover:scale-[1.02]"
                >
                  {isDeleting ? 'Deleting...' : 'Delete Event'}
                </button>
              </div>
            ) : (
              <button
                onClick={isAttending ? handleLeave : handleJoin}
                disabled={isJoining || isLeaving || (!isAttending && isAtCapacity)}
                className={`w-full sm:w-auto inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white
                  ${isAttending
                    ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                    : isAtCapacity
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 transform transition-all duration-200 hover:scale-[1.02]`}
              >
                {isJoining ? 'Joining...' :
                 isLeaving ? 'Leaving...' :
                 isAttending ? 'Leave Event' :
                 isAtCapacity ? 'Event Full' : 'Join Event'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Attendees List */}
      <div className="bg-white rounded-lg p-4 sm:p-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Event Organizer</h3>
            <span className="text-sm text-gray-500">
              Total Attendees: {event.attendees.length}
              {event.maxAttendees && ` / ${event.maxAttendees}`}
            </span>
          </div>
          
          {/* Organizer Card */}
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
            <div className="flex-shrink-0 h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
              <span className="text-lg text-indigo-600 font-medium">
                {event.organizer.name?.[0] || event.organizer.email[0].toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-semibold text-gray-900 truncate">
                {event.organizer.name || event.organizer.email}
              </p>
              <p className="text-sm text-indigo-600 font-medium">
                Organizer
              </p>
              <p className="text-sm text-gray-500 truncate">
                {event.organizer.email}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
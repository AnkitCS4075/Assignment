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
        <div className="flex justify-between items-start">
          <h1 className="text-2xl font-bold text-gray-900">{event.title}</h1>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
            {event.category}
          </span>
        </div>
        <p className="mt-4 text-gray-600">{event.description}</p>
      </div>

      {/* Event Image */}
      {event.image && (
        <div>
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-64 object-cover rounded-lg"
          />
        </div>
      )}

      {/* Event Details */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Event Details</h3>
            <dl className="mt-4 space-y-4">
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
          <div className="flex flex-col justify-end space-y-4">
            {error && (
              <div className="text-red-600 text-sm">
                {error}
              </div>
            )}
            
            {isOrganizer ? (
              <>
                <button
                  onClick={() => {
                    onClose();
                    navigate(`/events/${eventId}/edit`);
                  }}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transform transition-all duration-200 hover:scale-[1.02]"
                >
                  Edit Event
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transform transition-all duration-200 hover:scale-[1.02]"
                >
                  {isDeleting ? 'Deleting...' : 'Delete Event'}
                </button>
              </>
            ) : (
              <button
                onClick={isAttending ? handleLeave : handleJoin}
                disabled={isJoining || isLeaving || (!isAttending && isAtCapacity)}
                className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white
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
      <div className="bg-white rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Attendees</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {event.attendees.map((attendee) => (
            <div
              key={attendee._id}
              className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <span className="text-indigo-600 font-medium">
                  {attendee.name?.[0] || attendee.email[0].toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {attendee.name || attendee.email}
                </p>
                {attendee._id === event.organizer._id && (
                  <p className="text-xs text-indigo-600">Organizer</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users } from 'lucide-react';
import { useAccount } from 'wagmi';
import type { Event } from '../types';

export default function Home() {
  const { address } = useAccount();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch events from EventRegistry contract
    // For now, using mock data
    setEvents([
      {
        id: 1,
        name: '0G Network Launch Event',
        location: 'San Francisco, CA',
        startTime: Math.floor(Date.now() / 1000) + 86400,
        endTime: Math.floor(Date.now() / 1000) + 172800,
        organizer: '0x1234...5678',
        active: true,
      },
      {
        id: 2,
        name: '0G Developer Workshop',
        location: 'Online',
        startTime: Math.floor(Date.now() / 1000) + 259200,
        endTime: Math.floor(Date.now() / 1000) + 345600,
        organizer: '0x1234...5678',
        active: true,
      },
    ]);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-text-secondary">Loading events...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 fade-in">
        <h1 className="text-4xl font-bold mb-2 gradient-text">0G Events</h1>
        <p className="text-text-secondary">Discover and check in to 0G network events</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event, index) => (
          <Link
            key={event.id}
            to={`/event/${event.id}`}
            className="glass-card p-6 slide-up no-underline block hover:scale-[1.02] transition-transform"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <h2 className="text-xl font-semibold mb-3 text-text-primary">{event.name}</h2>
            <div className="space-y-2 text-text-secondary text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{new Date(event.startTime * 1000).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{event.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span className="text-success">Active</span>
              </div>
            </div>
            {address && (
              <div className="mt-4 pt-4 border-t border-border">
                <span className="text-accent-primary text-sm font-medium">Check In Available</span>
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}


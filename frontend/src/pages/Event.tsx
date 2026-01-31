import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { useAccount } from 'wagmi';
import CheckInModal from '../components/event/CheckInModal';

export default function Event() {
  const { eventId } = useParams<{ eventId: string }>();
  const { address, isConnected } = useAccount();
  const [showCheckIn, setShowCheckIn] = useState(false);

  // TODO: Fetch event details from contract
  const event = {
    id: parseInt(eventId || '0'),
    name: '0G Network Launch Event',
    location: 'San Francisco, CA',
    startTime: Math.floor(Date.now() / 1000) + 86400,
    endTime: Math.floor(Date.now() / 1000) + 172800,
    organizer: '0x1234...5678',
    active: true,
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">{event.name}</h1>
        <p className="text-text-secondary">{event.location}</p>
      </div>

      <div className="glass-card p-6 mb-6">
        <h2 className="text-2xl font-semibold mb-4">Event Details</h2>
        <div className="space-y-3 text-text-secondary">
          <div>
            <span className="text-text-primary font-medium">Start:</span>{' '}
            {new Date(event.startTime * 1000).toLocaleString()}
          </div>
          <div>
            <span className="text-text-primary font-medium">End:</span>{' '}
            {new Date(event.endTime * 1000).toLocaleString()}
          </div>
          <div>
            <span className="text-text-primary font-medium">Organizer:</span> {event.organizer}
          </div>
        </div>
      </div>

      {isConnected && address && (
        <div className="flex gap-4">
          <button onClick={() => setShowCheckIn(true)} className="btn-primary">
            Check In to Event
          </button>
          <button className="btn-secondary">
            View Contributions
          </button>
        </div>
      )}

      {!isConnected && (
        <div className="glass-card p-6 text-center">
          <p className="text-text-secondary mb-4">Connect your wallet to check in</p>
        </div>
      )}

      {showCheckIn && (
        <CheckInModal
          eventId={event.id}
          onClose={() => setShowCheckIn(false)}
        />
      )}
    </div>
  );
}


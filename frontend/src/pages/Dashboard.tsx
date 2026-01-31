import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useReadContract } from 'wagmi';
import type { Address } from 'viem';
import { parseAbi } from 'viem';
import { contractAddresses } from '../config/chain';
import { contractService } from '../services/contracts';
import type { Event } from '../types';
import { formatAddress, formatDate, formatTier } from '../utils/format';
import { 
  Users, 
  Award, 
  TrendingUp, 
  Calendar, 
  Filter,
  Download,
  BarChart3,
  PieChart,
  MessageSquare
} from 'lucide-react';

export default function Dashboard() {
  const { address } = useAccount();
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<number | null>(null);
  const [attendees, setAttendees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAttendees: 0,
    totalCheckIns: 0,
    avgScore: 0,
    tierDistribution: { Attendee: 0, Contributor: 0, Champion: 0 },
  });

  // Check if user is organizer (simplified - in production, check against event organizer)
  const eventRegistryABI = parseAbi([
    'function events(uint256) view returns (uint256 id, string name, string location, uint256 startTime, uint256 endTime, address organizer, bool active)',
    'function eventCount() view returns (uint256)',
  ]);

  const { data: eventCount } = useReadContract({
    address: contractAddresses.eventRegistry as Address,
    abi: eventRegistryABI,
    functionName: 'eventCount',
  });

  useEffect(() => {
    const loadDashboard = async () => {
      if (!address) {
        setLoading(false);
        return;
      }

      try {
        // Load events (simplified - in production, filter by organizer)
        const count = eventCount ? Number(eventCount) : 0;
        const eventList: Event[] = [];
        
        for (let i = 1; i <= count; i++) {
          try {
            const event = await contractService.getEvent(i);
            if (event && event.organizer.toLowerCase() === address.toLowerCase()) {
              eventList.push(event);
            }
          } catch (err) {
            // Event doesn't exist or error
          }
        }

        setEvents(eventList);
        
        if (eventList.length > 0 && !selectedEvent) {
          setSelectedEvent(eventList[0].id);
        }
      } catch (error) {
        console.error('Error loading dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [address, eventCount, selectedEvent]);

  useEffect(() => {
    const loadAttendees = async () => {
      if (!selectedEvent) return;

      try {
        // TODO: Fetch actual attendees from contract events
        // For now, using mock data structure
        const mockAttendees = [
          {
            address: '0x1234...5678',
            checkedInAt: Date.now() - 86400000,
            badge: {
              tokenId: 1,
              tier: 2,
              score: 85,
            },
            feedback: 'Great event!',
          },
        ];

        setAttendees(mockAttendees);

        // Calculate stats
        const totalAttendees = mockAttendees.length;
        const totalScores = mockAttendees.reduce((sum, a) => sum + (a.badge?.score || 0), 0);
        const avgScore = totalAttendees > 0 ? totalScores / totalAttendees : 0;

        const tierDist = mockAttendees.reduce((acc, a) => {
          const tier = formatTier(a.badge?.tier || 0);
          acc[tier as keyof typeof acc]++;
          return acc;
        }, { Attendee: 0, Contributor: 0, Champion: 0 });

        setStats({
          totalAttendees,
          totalCheckIns: totalAttendees,
          avgScore: Math.round(avgScore),
          tierDistribution: tierDist,
        });
      } catch (error) {
        console.error('Error loading attendees:', error);
      }
    };

    loadAttendees();
  }, [selectedEvent]);

  if (!address) {
    return (
      <div className="text-center py-12">
        <p className="text-text-secondary mb-4">Please connect your wallet to access the dashboard</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-8 h-8 border-4 border-accent-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-text-secondary">Loading dashboard...</p>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="w-12 h-12 text-text-secondary mx-auto mb-4" />
        <h2 className="text-2xl font-semibold mb-2 text-text-primary">No Events Found</h2>
        <p className="text-text-secondary">
          You haven't created any events yet. Create an event to start managing attendees.
        </p>
      </div>
    );
  }

  const selectedEventData = events.find(e => e.id === selectedEvent);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 gradient-text">Organizer Dashboard</h1>
        <p className="text-text-secondary">Manage your events and view analytics</p>
      </div>

      {/* Event Selector */}
      <div className="glass-card p-4 mb-6">
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-text-secondary" />
          <span className="text-sm font-medium text-text-secondary">Select Event:</span>
          <select
            value={selectedEvent || ''}
            onChange={(e) => setSelectedEvent(Number(e.target.value))}
            className="flex-1 px-4 py-2 bg-bg-secondary border border-border rounded-lg text-text-primary focus:outline-none focus:border-accent-primary"
          >
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.name} - {formatDate(event.startTime)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedEventData && (
        <>
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-5 h-5 text-accent-primary" />
                <span className="text-sm text-text-secondary">Total Attendees</span>
              </div>
              <div className="text-3xl font-bold">{stats.totalAttendees}</div>
            </div>
            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-2">
                <Award className="w-5 h-5 text-accent-primary" />
                <span className="text-sm text-text-secondary">Check-ins</span>
              </div>
              <div className="text-3xl font-bold">{stats.totalCheckIns}</div>
            </div>
            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-accent-primary" />
                <span className="text-sm text-text-secondary">Avg Score</span>
              </div>
              <div className="text-3xl font-bold">{stats.avgScore}</div>
            </div>
            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-2">
                <BarChart3 className="w-5 h-5 text-accent-primary" />
                <span className="text-sm text-text-secondary">Event Status</span>
              </div>
              <div className="text-lg font-bold">
                {selectedEventData.active ? (
                  <span className="text-success">Active</span>
                ) : (
                  <span className="text-text-secondary">Ended</span>
                )}
              </div>
            </div>
          </div>

          {/* Tier Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Tier Distribution
              </h2>
              <div className="space-y-3">
                {Object.entries(stats.tierDistribution).map(([tier, count]) => (
                  <div key={tier} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded ${
                          tier === 'Champion'
                            ? 'bg-yellow-400'
                            : tier === 'Contributor'
                            ? 'bg-gray-300'
                            : 'bg-amber-600'
                        }`}
                      />
                      <span className="text-sm font-medium">{tier}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-32 h-2 bg-bg-secondary rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            tier === 'Champion'
                              ? 'bg-yellow-400'
                              : tier === 'Contributor'
                              ? 'bg-gray-300'
                              : 'bg-amber-600'
                          }`}
                          style={{
                            width: `${
                              stats.totalAttendees > 0
                                ? (count / stats.totalAttendees) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-bold w-8 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Contributors */}
            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Award className="w-5 h-5" />
                Top Contributors
              </h2>
              <div className="space-y-3">
                {attendees
                  .sort((a, b) => (b.badge?.score || 0) - (a.badge?.score || 0))
                  .slice(0, 5)
                  .map((attendee, index) => (
                    <div
                      key={attendee.address}
                      className="flex items-center justify-between p-3 bg-bg-secondary rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-accent-primary/20 flex items-center justify-center">
                          <span className="text-accent-primary font-bold text-sm">
                            {index + 1}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-sm text-text-primary">
                            {formatAddress(attendee.address)}
                          </div>
                          <div className="text-xs text-text-secondary">
                            {formatTier(attendee.badge?.tier || 0)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-accent-primary">
                          {attendee.badge?.score || 0}/100
                        </div>
                      </div>
                    </div>
                  ))}
                {attendees.length === 0 && (
                  <p className="text-text-secondary text-sm text-center py-4">
                    No contributors yet
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Attendee List */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Users className="w-5 h-5" />
                Verified Attendees
              </h2>
              <button className="btn-secondary text-sm flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">
                      Wallet
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">
                      Check-in Time
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">
                      Tier
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">
                      Score
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {attendees.map((attendee) => (
                    <tr
                      key={attendee.address}
                      className="border-b border-border hover:bg-bg-secondary transition-colors"
                    >
                      <td className="py-3 px-4">
                        <a
                          href={`/profile/${attendee.address}`}
                          className="font-mono text-sm text-accent-primary hover:opacity-80"
                        >
                          {formatAddress(attendee.address)}
                        </a>
                      </td>
                      <td className="py-3 px-4 text-sm text-text-secondary">
                        {new Date(attendee.checkedInAt).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            attendee.badge?.tier === 2
                              ? 'bg-yellow-400/20 text-yellow-400'
                              : attendee.badge?.tier === 1
                              ? 'bg-gray-300/20 text-gray-300'
                              : 'bg-amber-600/20 text-amber-600'
                          }`}
                        >
                          {formatTier(attendee.badge?.tier || 0)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium">{attendee.badge?.score || 0}/100</span>
                      </td>
                      <td className="py-3 px-4">
                        <a
                          href={`/profile/${attendee.address}`}
                          className="text-accent-primary text-sm hover:opacity-80"
                        >
                          View Profile
                        </a>
                      </td>
                    </tr>
                  ))}
                  {attendees.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-text-secondary">
                        No attendees yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Feedback Panel */}
          <div className="glass-card p-6 mt-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              AI-Filtered Feedback
            </h2>
            <div className="space-y-3">
              {attendees
                .filter((a) => a.feedback)
                .map((attendee) => (
                  <div
                    key={attendee.address}
                    className="p-4 bg-bg-secondary rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        {formatAddress(attendee.address)}
                      </span>
                      <span className="text-xs text-text-secondary">
                        {formatTier(attendee.badge?.tier || 0)}
                      </span>
                    </div>
                    <p className="text-sm text-text-secondary">{attendee.feedback}</p>
                  </div>
                ))}
              {attendees.filter((a) => a.feedback).length === 0 && (
                <p className="text-text-secondary text-sm text-center py-4">
                  No feedback submitted yet
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ConfirmationModal from '../components/ConfirmationModal';
import { 
  Ticket, Train, Calendar, Clock, MapPin, AlertCircle, RefreshCw, 
  Printer, XCircle, CheckCircle2, ChevronRight, User, Search 
} from 'lucide-react';

export default function MyBookingsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming', 'completed', 'cancelled', 'all'
  const [searchPnr, setSearchPnr] = useState('');

  // Cancellation modal state
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedBookingForCancel, setSelectedBookingForCancel] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getMyBookings(user?.email || 'passenger@railease.in');
      setBookings(data.bookings || []);
    } catch (err) {
      setError(err.message || 'Failed to load bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [user]);

  const handleOpenCancelModal = (booking) => {
    setSelectedBookingForCancel(booking);
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedBookingForCancel) return;
    setCancelling(true);
    try {
      const res = await api.cancelBooking(selectedBookingForCancel.id);
      showToast(res.message, 'success', 5000);
      setCancelModalOpen(false);
      setSelectedBookingForCancel(null);
      fetchBookings(); // refresh list
    } catch (err) {
      showToast(err.message || 'Failed to cancel booking', 'error');
    } finally {
      setCancelling(false);
    }
  };

  // Filter bookings by tab and search
  const today = new Date().toISOString().split('T')[0];

  const filteredBookings = bookings.filter(b => {
    if (searchPnr.trim() !== '' && !b.pnr.includes(searchPnr.trim()) && !b.train_name.toLowerCase().includes(searchPnr.toLowerCase())) {
      return false;
    }

    if (activeTab === 'cancelled') {
      return b.status === 'CANCELLED';
    }
    if (activeTab === 'upcoming') {
      return b.status === 'CONFIRMED' && b.journey_date >= today;
    }
    if (activeTab === 'completed') {
      return b.status === 'CONFIRMED' && b.journey_date < today;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-2xl bg-blue-100 text-blue-700">
                <Ticket className="w-5 h-5" />
              </span>
              <h1 className="text-2xl font-black text-slate-900 font-heading">
                My Bookings & Reservations
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Manage journeys, download E-Tickets, check seat allocations, or cancel reservations with simulated refund.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/trains"
              className="px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-md transition-colors"
            >
              Book New Journey
            </Link>
            <button
              onClick={fetchBookings}
              className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
              title="Refresh bookings"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Selector & PNR Search Bar */}
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Tabs */}
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {[
              { id: 'upcoming', label: 'Upcoming Journeys' },
              { id: 'completed', label: 'Past & Completed' },
              { id: 'cancelled', label: 'Cancelled & Refunded' },
              { id: 'all', label: 'All Bookings' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Quick Search */}
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Search by PNR or Train..."
              value={searchPnr}
              onChange={(e) => setSearchPnr(e.target.value)}
              className="w-full bg-slate-50 text-slate-800 text-xs rounded-xl border border-slate-300 pl-8 pr-3 py-2 font-mono-code focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="bg-white rounded-3xl p-16 shadow-sm border border-slate-200 flex flex-col items-center justify-center text-slate-400 gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-xs font-medium">Fetching reservations from RailEase database...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 p-6 rounded-3xl border border-red-200 text-red-800 text-xs flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-slate-200 space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Ticket className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-800 font-heading">
              No Bookings in this Category
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You do not have any {activeTab} railway reservations. Search for trains and book your ticket in seconds.
            </p>
            <div>
              <Link
                to="/trains"
                className="inline-block px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-md hover:bg-blue-700 transition-colors"
              >
                Search Trains & Reserve Seats
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map(b => (
              <div
                key={b.id}
                className="bg-white rounded-3xl p-6 shadow-md hover:shadow-lg border border-slate-200 transition-all space-y-5"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                      <Train className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-black text-slate-900 font-heading">
                          {b.train_name}
                        </h3>
                        <span className="text-xs font-mono-code font-bold text-slate-500">
                          #{b.train_number}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        PNR: <strong className="text-blue-700 font-mono-code">{b.pnr}</strong> • Quota: {b.quota} • Class: {b.class_code}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${
                      b.status === 'CONFIRMED'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-red-100 text-red-800 border border-red-300'
                    }`}>
                      {b.status}
                    </span>
                    <span className="text-sm font-black text-slate-900 font-mono-code">
                      ₹{b.total_fare?.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Journey Timeline */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">From</span>
                    <strong className="text-slate-900 text-sm block">{b.source_name} ({b.source_code})</strong>
                    <span className="text-slate-500 font-medium">Dep: {b.departure_time}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Journey Date</span>
                    <strong className="text-slate-900 text-sm block font-mono-code">{b.journey_date}</strong>
                    <span className="text-slate-500 font-medium">{b.total_passengers} Passenger(s)</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">To</span>
                    <strong className="text-slate-900 text-sm block">{b.dest_name} ({b.dest_code})</strong>
                    <span className="text-slate-500 font-medium">Arr: {b.arrival_time}</span>
                  </div>
                </div>

                {/* Passenger Seat Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 mr-2">Passengers:</span>
                  {b.passengers?.map((p, idx) => (
                    <span
                      key={p.id || idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800"
                    >
                      <span>{p.name}</span>
                      <strong className="text-blue-700 bg-white px-1.5 py-0.5 rounded font-mono-code text-[11px] border border-slate-200">
                        {p.coach_code}-{p.seat_number} ({p.berth_type})
                      </strong>
                    </span>
                  ))}
                </div>

                {/* Refund notification if cancelled */}
                {b.status === 'CANCELLED' && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-900 flex items-center justify-between">
                    <span>Cancelled on: {b.cancelled_at}</span>
                    <strong className="font-bold">Refund Processed: ₹{b.refund_amount?.toFixed(2)}</strong>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <Link
                    to={`/ticket/${b.pnr}`}
                    className="flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-900 transition-colors"
                  >
                    <Printer className="w-4 h-4" />
                    <span>View & Print E-Ticket</span>
                  </Link>

                  {b.status === 'CONFIRMED' && (
                    <button
                      type="button"
                      onClick={() => handleOpenCancelModal(b)}
                      className="px-4 py-2 rounded-xl border border-red-300 text-red-700 hover:bg-red-50 text-xs font-bold transition-colors cursor-pointer"
                    >
                      Cancel Ticket
                    </button>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}

        {/* Cancellation Confirmation Modal */}
        <ConfirmationModal
          isOpen={cancelModalOpen}
          title="Cancel Railway Reservation"
          message={`Are you sure you want to cancel booking for ${selectedBookingForCancel?.train_name}?`}
          booking={selectedBookingForCancel}
          confirmText="Yes, Cancel Booking & Refund"
          cancelText="No, Keep My Journey"
          loading={cancelling}
          onConfirm={handleConfirmCancel}
          onCancel={() => {
            setCancelModalOpen(false);
            setSelectedBookingForCancel(null);
          }}
        />

      </div>
    </div>
  );
}

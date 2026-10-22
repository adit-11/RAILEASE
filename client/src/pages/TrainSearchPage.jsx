import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import TrainCard from '../components/TrainCard';
import { 
  Search, Filter, ArrowUpDown, RefreshCw, AlertCircle, Train, 
  MapPin, Calendar, Clock, SlidersHorizontal, CheckCircle2 
} from 'lucide-react';

export default function TrainSearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const from = searchParams.get('from') || 'NDLS';
  const to = searchParams.get('to') || 'BSB';
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
  const classType = searchParams.get('classType') || 'All';
  const quota = searchParams.get('quota') || 'General';

  const [trains, setTrains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters state
  const [selectedTrainType, setSelectedTrainType] = useState('All');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('All'); // 'early', 'morning', 'afternoon', 'night'
  const [maxPrice, setMaxPrice] = useState(6000);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sortBy, setSortBy] = useState('departure'); // 'departure', 'duration', 'fare', 'rating'

  const fetchTrains = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.searchTrains({
        from,
        to,
        date,
        classType: classType !== 'All' ? classType : undefined
      });
      setTrains(data.trains || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch trains');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrains();
  }, [from, to, date, classType]);

  // Filter logic
  const filteredTrains = trains.filter(train => {
    // Train type filter
    if (selectedTrainType !== 'All' && train.type !== selectedTrainType) {
      return false;
    }

    // Departure time filter
    if (selectedTimeSlot !== 'All') {
      const hour = parseInt(train.departure_time.split(':')[0], 10);
      if (selectedTimeSlot === 'early' && (hour >= 6)) return false; // 00:00 - 06:00
      if (selectedTimeSlot === 'morning' && (hour < 6 || hour >= 12)) return false; // 06:00 - 12:00
      if (selectedTimeSlot === 'afternoon' && (hour < 12 || hour >= 18)) return false; // 12:00 - 18:00
      if (selectedTimeSlot === 'night' && (hour < 18)) return false; // 18:00 - 24:00
    }

    // Max Price filter
    const lowestFare = Math.min(...train.classes.map(c => c.base_fare));
    if (lowestFare > maxPrice) return false;

    // Available only
    if (availableOnly) {
      const hasAvailable = train.classes.some(c => c.available_seats > 0);
      if (!hasAvailable) return false;
    }

    return true;
  });

  // Sorting logic
  const sortedTrains = [...filteredTrains].sort((a, b) => {
    if (sortBy === 'departure') {
      return a.departure_time.localeCompare(b.departure_time);
    }
    if (sortBy === 'duration') {
      // duration string e.g. "8h 00m" -> minutes
      const getMins = (dur) => {
        const parts = dur.match(/(\d+)h\s*(\d+)?m?/);
        if (!parts) return 9999;
        const h = parseInt(parts[1], 10) || 0;
        const m = parseInt(parts[2], 10) || 0;
        return h * 60 + m;
      };
      return getMins(a.duration) - getMins(b.duration);
    }
    if (sortBy === 'fare') {
      const minA = Math.min(...a.classes.map(c => c.base_fare));
      const minB = Math.min(...b.classes.map(c => c.base_fare));
      return minA - minB;
    }
    if (sortBy === 'rating') {
      return (b.rating || 0) - (a.rating || 0);
    }
    return 0;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Search Context Summary Bar */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/90 p-5 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <Train className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-black text-slate-900 font-heading">
                    {from} → {to}
                  </h1>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    {sortedTrains.length} Trains Found
                  </span>
                </div>
                <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                  <Calendar className="w-3.5 h-3.5" /> Journey Date: <strong className="text-slate-800">{date}</strong>
                  <span>•</span>
                  <span>Quota: <strong className="text-slate-800">{quota}</strong></span>
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <Link
              to="/"
              className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors"
            >
              Modify Search
            </Link>
            <button
              onClick={fetchTrains}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title="Refresh results"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Layout: Sidebar Filters + Train Results */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Filters Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-6">
              
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                  <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                  <span>Filters</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTrainType('All');
                    setSelectedTimeSlot('All');
                    setMaxPrice(6000);
                    setAvailableOnly(false);
                    setSortBy('departure');
                  }}
                  className="text-xs text-blue-600 hover:underline font-semibold"
                >
                  Reset All
                </button>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Sort Results By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full bg-slate-50 text-slate-800 text-xs font-semibold rounded-xl border border-slate-200 p-2.5 focus:ring-2 focus:ring-blue-600 focus:outline-none cursor-pointer"
                >
                  <option value="departure">Departure Time (Earliest First)</option>
                  <option value="duration">Fastest Duration</option>
                  <option value="fare">Lowest Base Fare</option>
                  <option value="rating">Highest Passenger Rating</option>
                </select>
              </div>

              {/* Departure Time Slots */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                  Departure Time
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setSelectedTimeSlot(selectedTimeSlot === 'early' ? 'All' : 'early')}
                    className={`p-2 rounded-xl border text-center transition-all ${
                      selectedTimeSlot === 'early'
                        ? 'border-blue-600 bg-blue-50 text-blue-800 font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    Early (00-06)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedTimeSlot(selectedTimeSlot === 'morning' ? 'All' : 'morning')}
                    className={`p-2 rounded-xl border text-center transition-all ${
                      selectedTimeSlot === 'morning'
                        ? 'border-blue-600 bg-blue-50 text-blue-800 font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    Morning (06-12)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedTimeSlot(selectedTimeSlot === 'afternoon' ? 'All' : 'afternoon')}
                    className={`p-2 rounded-xl border text-center transition-all ${
                      selectedTimeSlot === 'afternoon'
                        ? 'border-blue-600 bg-blue-50 text-blue-800 font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    Midday (12-18)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedTimeSlot(selectedTimeSlot === 'night' ? 'All' : 'night')}
                    className={`p-2 rounded-xl border text-center transition-all ${
                      selectedTimeSlot === 'night'
                        ? 'border-blue-600 bg-blue-50 text-blue-800 font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    Night (18-24)
                  </button>
                </div>
              </div>

              {/* Train Type Filter */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Train Type
                </label>
                <div className="space-y-1.5 text-xs font-medium text-slate-700">
                  {['All', 'Vande Bharat', 'Rajdhani', 'Shatabdi', 'Superfast'].map(t => (
                    <label key={t} className="flex items-center gap-2 cursor-pointer p-1.5 rounded-lg hover:bg-slate-50">
                      <input
                        type="radio"
                        name="trainType"
                        checked={selectedTrainType === t}
                        onChange={() => setSelectedTrainType(t)}
                        className="text-blue-600 focus:ring-blue-500 rounded"
                      />
                      <span>{t === 'All' ? 'All Train Types' : t}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Max Fare Slider */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="uppercase tracking-wider text-slate-400">Max Fare</span>
                  <span className="text-blue-700 font-mono-code font-extrabold">₹{maxPrice}</span>
                </div>
                <input
                  type="range"
                  min="200"
                  max="6000"
                  step="100"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>₹200</span>
                  <span>₹6,000</span>
                </div>
              </div>

              {/* Available Seats Only */}
              <div className="pt-2 border-t border-slate-100">
                <label className="flex items-center gap-2.5 text-xs font-bold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={availableOnly}
                    onChange={(e) => setAvailableOnly(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                  />
                  <span>Show Available Seats Only</span>
                </label>
              </div>

            </div>

            {/* Indian Railways Live Advisory Card */}
            <div className="bg-gradient-to-br from-blue-900 to-slate-900 text-white rounded-3xl p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-orange-400 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Live Reservation Info</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Tickets booked via RailEase are instantly confirmed. Tatkal opens daily at 10:00 AM (AC) and 11:00 AM (Non-AC).
              </p>
            </div>
          </div>

          {/* Trains Results Column */}
          <div className="lg:col-span-3 space-y-6">
            
            {loading ? (
              <div className="bg-white rounded-3xl p-16 shadow-sm border border-slate-200 flex flex-col items-center justify-center text-slate-400 gap-4">
                <RefreshCw className="w-10 h-10 animate-spin text-blue-600" />
                <p className="text-sm font-semibold text-slate-700">Querying Indian Railways schedule and seat matrix...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 rounded-3xl p-8 border border-red-200 text-red-800 flex flex-col items-center justify-center text-center gap-3">
                <AlertCircle className="w-8 h-8 text-red-600" />
                <h3 className="text-base font-bold">Search Error</h3>
                <p className="text-xs text-red-700 max-w-md">{error}</p>
                <button
                  onClick={fetchTrains}
                  className="mt-2 px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold"
                >
                  Retry Search
                </button>
              </div>
            ) : sortedTrains.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 shadow-sm border border-slate-200 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Train className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 font-heading">
                  No Direct Trains Found
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  No trains matched your exact route from <strong className="text-slate-700">{from}</strong> to <strong className="text-slate-700">{to}</strong> with the current filter settings. Try searching major junction stations like NDLS, MMCT, BSB, or resetting filters.
                </p>
                <div className="pt-2">
                  <Link
                    to="/trains?from=NDLS&to=BSB"
                    className="inline-block px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-md hover:bg-blue-700 transition-colors"
                  >
                    View Delhi ⇄ Varanasi Vande Bharat
                  </Link>
                </div>
              </div>
            ) : (
              sortedTrains.map(train => (
                <TrainCard
                  key={train.id}
                  train={train}
                  journeyDate={date}
                  quota={quota}
                  defaultClass={classType !== 'All' ? classType : undefined}
                />
              ))
            )}

          </div>

        </div>

      </div>
    </div>
  );
}

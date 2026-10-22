import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { ArrowLeftRight, Calendar, Search, MapPin, Users, Sparkles, Filter } from 'lucide-react';

export default function TrainSearchCard({ initialFrom = '', initialTo = '', initialDate = '', initialClass = 'All' }) {
  const navigate = useNavigate();
  const [stations, setStations] = useState([]);
  
  // Default date to tomorrow if not passed
  const getTomorrow = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const [fromStation, setFromStation] = useState(initialFrom || 'NDLS');
  const [toStation, setToStation] = useState(initialTo || 'BSB');
  const [journeyDate, setJourneyDate] = useState(initialDate || getTomorrow());
  const [classType, setClassType] = useState(initialClass || 'All');
  const [quota, setQuota] = useState('General');
  const [passengersCount, setPassengersCount] = useState(1);
  const [isSwapping, setIsSwapping] = useState(false);

  useEffect(() => {
    api.getStations()
      .then(data => setStations(data.stations || []))
      .catch(err => console.error('Error fetching stations:', err));
  }, []);

  const handleSwap = () => {
    setIsSwapping(true);
    const temp = fromStation;
    setFromStation(toStation);
    setToStation(temp);
    setTimeout(() => setIsSwapping(false), 300);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const query = new URLSearchParams({
      from: fromStation,
      to: toStation,
      date: journeyDate,
      classType: classType,
      quota: quota,
      passengers: passengersCount
    });
    navigate(`/trains?${query.toString()}`);
  };

  const handleQuickRoute = (from, to) => {
    setFromStation(from);
    setToStation(to);
    const query = new URLSearchParams({
      from,
      to,
      date: journeyDate,
      classType,
      quota
    });
    navigate(`/trains?${query.toString()}`);
  };

  // Popular routes
  const popularRoutes = [
    { label: 'Delhi ⇄ Varanasi', from: 'NDLS', to: 'BSB', badge: 'Vande Bharat' },
    { label: 'Delhi ⇄ Mumbai', from: 'NDLS', to: 'MMCT', badge: 'Tejas Rajdhani' },
    { label: 'Delhi ⇄ Lucknow', from: 'NDLS', to: 'LKO', badge: 'Shatabdi' },
    { label: 'Delhi ⇄ Howrah', from: 'NDLS', to: 'HWH', badge: 'Rajdhani' },
    { label: 'Chennai ⇄ Bengaluru', from: 'MAS', to: 'SBC', badge: 'Shatabdi' },
    { label: 'Pune ⇄ Mumbai', from: 'PUNE', to: 'CSMT', badge: 'Deccan Queen' }
  ];

  return (
    <div className="w-full bg-white rounded-3xl shadow-2xl border border-slate-200/80 p-5 sm:p-8 relative z-20">
      
      {/* Top Tagline */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-ping"></span>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Book Train Tickets Online
          </span>
          <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            Zero Payment Gateway Convenience Fee
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Sparkles className="w-3.5 h-3.5 text-orange-500" />
          <span>Real-time seat availability & instant PNR generation</span>
        </div>
      </div>

      {/* Main Search Form */}
      <form onSubmit={handleSearch} className="space-y-6">
        
        {/* Source, Swap, Destination Grid */}
        <div className="grid grid-cols-1 md:grid-cols-11 gap-3 items-center">
          
          {/* From Station */}
          <div className="md:col-span-5 relative group">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-blue-600" /> From Station
            </label>
            <div className="relative">
              <select
                id="search-from-station"
                value={fromStation}
                onChange={(e) => setFromStation(e.target.value)}
                className="w-full bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-slate-900 font-semibold text-base rounded-2xl border border-slate-200 p-3.5 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all appearance-none cursor-pointer"
              >
                {stations.length === 0 ? (
                  <>
                    <option value="NDLS">New Delhi (NDLS)</option>
                    <option value="CSMT">Mumbai CSMT (CSMT)</option>
                    <option value="MMCT">Mumbai Central (MMCT)</option>
                    <option value="BSB">Varanasi Jn (BSB)</option>
                  </>
                ) : (
                  stations.map(st => (
                    <option key={st.code} value={st.code}>
                      {st.city} — {st.name} ({st.code})
                    </option>
                  ))
                )}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-xs font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">
                {fromStation}
              </div>
            </div>
          </div>

          {/* Swap Button */}
          <div className="md:col-span-1 flex justify-center py-1">
            <button
              type="button"
              onClick={handleSwap}
              title="Swap stations"
              className={`w-11 h-11 rounded-2xl bg-orange-50 border border-orange-200 hover:bg-orange-500 hover:text-white text-orange-600 flex items-center justify-center transition-all shadow-sm hover:shadow-md ${
                isSwapping ? 'rotate-180 duration-300' : ''
              }`}
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>
          </div>

          {/* To Station */}
          <div className="md:col-span-5 relative group">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-orange-600" /> To Destination
            </label>
            <div className="relative">
              <select
                id="search-to-station"
                value={toStation}
                onChange={(e) => setToStation(e.target.value)}
                className="w-full bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-slate-900 font-semibold text-base rounded-2xl border border-slate-200 p-3.5 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all appearance-none cursor-pointer"
              >
                {stations.length === 0 ? (
                  <>
                    <option value="BSB">Varanasi Jn (BSB)</option>
                    <option value="NDLS">New Delhi (NDLS)</option>
                    <option value="MMCT">Mumbai Central (MMCT)</option>
                    <option value="HWH">Howrah Jn (HWH)</option>
                  </>
                ) : (
                  stations.map(st => (
                    <option key={st.code} value={st.code}>
                      {st.city} — {st.name} ({st.code})
                    </option>
                  ))
                )}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-xs font-bold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-md">
                {toStation}
              </div>
            </div>
          </div>

        </div>

        {/* Date, Class, Quota, Passenger Count */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Journey Date */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-600" /> Journey Date
            </label>
            <input
              type="date"
              id="search-journey-date"
              min={new Date().toISOString().split('T')[0]}
              value={journeyDate}
              onChange={(e) => setJourneyDate(e.target.value)}
              className="w-full bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-slate-900 font-medium text-sm rounded-2xl border border-slate-200 p-3.5 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all cursor-pointer"
            />
          </div>

          {/* Travel Class */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-600" /> Travel Class
            </label>
            <select
              id="search-class"
              value={classType}
              onChange={(e) => setClassType(e.target.value)}
              className="w-full bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-slate-900 font-medium text-sm rounded-2xl border border-slate-200 p-3.5 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all cursor-pointer"
            >
              <option value="All">All Classes (1A, 2A, 3A, CC, SL)</option>
              <option value="CC">AC Chair Car (CC)</option>
              <option value="EC">Exec. Chair Car (EC)</option>
              <option value="3A">AC 3 Tier (3A)</option>
              <option value="2A">AC 2 Tier (2A)</option>
              <option value="1A">AC 1st Class (1A)</option>
              <option value="SL">Sleeper Class (SL)</option>
              <option value="2S">Second Sitting (2S)</option>
            </select>
          </div>

          {/* Quota */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-slate-600" /> Quota
            </label>
            <select
              id="search-quota"
              value={quota}
              onChange={(e) => setQuota(e.target.value)}
              className="w-full bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-slate-900 font-medium text-sm rounded-2xl border border-slate-200 p-3.5 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all cursor-pointer"
            >
              <option value="General">General Quota (GN)</option>
              <option value="Tatkal">Tatkal Quota (TQ)</option>
              <option value="Ladies">Ladies Quota (LD)</option>
              <option value="Senior Citizen">Senior Citizen / Lower Berth</option>
            </select>
          </div>

          {/* Search Button */}
          <div className="flex items-end">
            <button
              type="submit"
              id="btn-search-trains"
              className="w-full h-[48px] rounded-2xl bg-gradient-to-r from-blue-700 via-blue-600 to-orange-500 hover:from-blue-800 hover:to-orange-600 text-white font-bold text-base shadow-lg shadow-blue-700/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            >
              <Search className="w-5 h-5" />
              <span>Search Trains</span>
            </button>
          </div>

        </div>

      </form>

      {/* Popular Routes Quick Buttons */}
      <div className="mt-6 pt-5 border-t border-slate-100">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
          Frequently Booked Express Routes:
        </p>
        <div className="flex flex-wrap gap-2">
          {popularRoutes.map((route, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleQuickRoute(route.from, route.to)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-xs font-medium border border-slate-200/60 hover:border-blue-300 transition-all"
            >
              <span>{route.label}</span>
              <span className="text-[10px] font-semibold bg-white px-1.5 py-0.5 rounded-md text-orange-600 border border-slate-200">
                {route.badge}
              </span>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}

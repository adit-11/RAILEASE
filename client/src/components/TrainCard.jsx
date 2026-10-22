import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Train, Clock, ArrowRight, Utensils, Star, CheckCircle, AlertTriangle, Info, Calendar } from 'lucide-react';
import RouteModal from './RouteModal';

export default function TrainCard({ train, journeyDate, quota = 'General', defaultClass }) {
  const navigate = useNavigate();
  const [selectedClass, setSelectedClass] = useState(() => {
    if (defaultClass && train.classes.some(c => c.class_code === defaultClass)) {
      return defaultClass;
    }
    return train.classes[0]?.class_code || 'CC';
  });

  const [showRouteModal, setShowRouteModal] = useState(false);
  const [routeData, setRouteData] = useState(null);
  const [loadingRoute, setLoadingRoute] = useState(false);

  const handleOpenRoute = async () => {
    setShowRouteModal(true);
    if (!routeData) {
      setLoadingRoute(true);
      try {
        const data = await api.getTrainDetails(train.id);
        setRouteData(data);
      } catch (err) {
        console.error('Error fetching route:', err);
      } finally {
        setLoadingRoute(false);
      }
    }
  };

  const currentClassObj = train.classes.find(c => c.class_code === selectedClass) || train.classes[0];

  const handleBook = () => {
    const params = new URLSearchParams({
      trainId: train.id,
      classCode: selectedClass,
      date: journeyDate,
      quota: quota
    });
    navigate(`/booking?${params.toString()}`);
  };

  // Badge colors by train type
  const getTypeBadge = (type) => {
    switch (type) {
      case 'Vande Bharat':
        return 'bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold';
      case 'Rajdhani':
        return 'bg-gradient-to-r from-red-600 to-rose-700 text-white font-bold';
      case 'Shatabdi':
        return 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold';
      default:
        return 'bg-slate-700 text-slate-100 font-semibold';
    }
  };

  return (
    <>
      <div className="bg-white rounded-3xl shadow-md hover:shadow-xl border border-slate-200/90 transition-all duration-300 overflow-hidden group">
        
        {/* Top Header of Card */}
        <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-200/70 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className={`text-[11px] uppercase tracking-wider px-3 py-1 rounded-full shadow-sm ${getTypeBadge(train.type)}`}>
              {train.type}
            </span>
            <div>
              <h3 className="text-lg font-black text-slate-900 group-hover:text-blue-700 transition-colors font-heading">
                {train.name} <span className="text-sm font-semibold text-slate-500">#{train.number}</span>
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1 font-medium bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <strong className="text-slate-800">{train.rating || '4.7'}</strong>
            </span>
            {train.pantry_available === 1 && (
              <span className="hidden sm:flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                <Utensils className="w-3.5 h-3.5 text-emerald-600" />
                Pantry Car
              </span>
            )}
            <span className="text-slate-500 font-medium">Runs: {train.days_of_run}</span>
          </div>
        </div>

        {/* Journey Timeline */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            
            {/* Origin */}
            <div className="md:col-span-3 text-left">
              <span className="text-2xl font-black text-slate-900 font-mono-code">{train.departure_time}</span>
              <h4 className="text-sm font-bold text-slate-800 truncate">{train.source_name}</h4>
              <p className="text-xs font-semibold text-blue-700 bg-blue-50 inline-block px-1.5 py-0.5 rounded mt-0.5">
                {train.source_code}
              </p>
            </div>

            {/* Travel Time Indicator */}
            <div className="md:col-span-6 flex flex-col items-center justify-center px-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 mb-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{train.duration}</span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-500 font-normal">{train.distance_km} km</span>
              </div>
              
              <div className="w-full flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full border-2 border-blue-600 bg-white"></div>
                <div className="flex-1 h-0.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-orange-500 relative">
                  <Train className="w-4 h-4 text-orange-600 absolute left-1/2 -top-2 -translate-x-1/2" />
                </div>
                <div className="w-2.5 h-2.5 rounded-full border-2 border-orange-500 bg-orange-500"></div>
              </div>

              <button
                type="button"
                onClick={handleOpenRoute}
                className="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Info className="w-3.5 h-3.5" />
                <span>View Route & Schedule</span>
              </button>
            </div>

            {/* Destination */}
            <div className="md:col-span-3 text-left md:text-right">
              <span className="text-2xl font-black text-slate-900 font-mono-code">{train.arrival_time}</span>
              <h4 className="text-sm font-bold text-slate-800 truncate">{train.dest_name}</h4>
              <p className="text-xs font-semibold text-orange-700 bg-orange-50 inline-block px-1.5 py-0.5 rounded mt-0.5">
                {train.dest_code}
              </p>
            </div>

          </div>

          {/* Available Classes Horizontal Chips */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
              Select Class & Check Availability:
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {train.classes.map(cls => {
                const isSelected = selectedClass === cls.class_code;
                const isAvailable = cls.available_seats > 0;

                return (
                  <button
                    key={cls.class_code}
                    type="button"
                    onClick={() => setSelectedClass(cls.class_code)}
                    className={`p-3 rounded-2xl text-left border-2 transition-all cursor-pointer relative ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/70 shadow-sm'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute -top-2 right-2 bg-blue-600 text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded-full uppercase">
                        Selected
                      </span>
                    )}

                    <div className="flex items-center justify-between mb-1">
                      <span className="font-extrabold text-sm text-slate-900 font-mono-code">
                        {cls.class_code}
                      </span>
                      <span className="text-sm font-black text-slate-900">
                        ₹{cls.base_fare}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 font-medium truncate mb-2">
                      {cls.class_name}
                    </p>

                    <div className="flex items-center gap-1.5 text-xs font-bold">
                      {isAvailable ? (
                        <span className="text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md text-[11px] flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          AVL: {cls.available_seats}
                        </span>
                      ) : (
                        <span className="text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-md text-[11px] flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          WL: 14
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Row */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500 flex items-center gap-2">
              <span className="text-slate-700 font-bold">Class {currentClassObj?.class_code} Selected:</span>
              <span>₹{currentClassObj?.base_fare} Base Fare</span>
              <span>•</span>
              <span className="text-emerald-600 font-semibold">{currentClassObj?.status}</span>
            </div>

            <button
              type="button"
              onClick={handleBook}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white font-bold text-sm shadow-md shadow-blue-700/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <span>Book Ticket for {currentClassObj?.class_code}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

      {/* Schedule Modal */}
      {showRouteModal && (
        <RouteModal
          train={train}
          routes={routeData?.routes || []}
          onClose={() => setShowRouteModal(false)}
        />
      )}
    </>
  );
}

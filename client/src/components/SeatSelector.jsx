import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Check, User, Info, AlertCircle, RefreshCw } from 'lucide-react';

export default function SeatSelector({
  trainId,
  journeyDate,
  coachCode,
  availableCoaches = [],
  onCoachChange,
  passengers = [],
  selectedSeats = {}, // { [passengerIndex]: { seatNumber, berthType, coachCode } }
  onSeatSelect
}) {
  const [activePassengerIndex, setActivePassengerIndex] = useState(0);
  const [layoutData, setLayoutData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLayout = async () => {
    if (!trainId || !coachCode || !journeyDate) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.getCoachLayout(trainId, coachCode, journeyDate);
      setLayoutData(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch coach layout');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLayout();
  }, [trainId, coachCode, journeyDate]);

  const handleSeatClick = (seat) => {
    if (seat.isOccupied) return;

    // Check if this seat is already picked by another passenger in this same booking session
    const isPickedByOtherInSession = Object.entries(selectedSeats).some(
      ([pIdx, sel]) => Number(pIdx) !== activePassengerIndex && sel.coachCode === coachCode && sel.seatNumber === seat.seat_number
    );

    if (isPickedByOtherInSession) {
      return; // already assigned to another passenger in current group
    }

    onSeatSelect(activePassengerIndex, seat.seat_number, seat.berth_type, coachCode);

    // Auto advance to next passenger if not all assigned
    if (activePassengerIndex < passengers.length - 1) {
      setActivePassengerIndex(activePassengerIndex + 1);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-200">
      
      {/* Header & Coach Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <h3 className="text-lg font-black text-slate-900 font-heading flex items-center gap-2">
            <span>Visual Coach & Berth Selector</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
              Coach {coachCode}
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time Indian Railways seat map. Prevents duplicate reservations for {journeyDate}.
          </p>
        </div>

        {/* Coach Selector Tabs */}
        {availableCoaches.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Coach:</span>
            <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl">
              {availableCoaches.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => onCoachChange && onCoachChange(c)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    coachCode === c
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Passenger Assignment Selector Pills */}
      <div className="my-5">
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
          Select Passenger to assign berth:
        </label>
        <div className="flex flex-wrap gap-2.5">
          {passengers.map((p, idx) => {
            const isAssigned = !!selectedSeats[idx];
            const isActive = activePassengerIndex === idx;
            const assignedData = selectedSeats[idx];

            return (
              <button
                key={idx}
                type="button"
                onClick={() => setActivePassengerIndex(idx)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer border-2 ${
                  isActive
                    ? 'border-orange-500 bg-orange-50/80 text-orange-950 shadow-sm'
                    : isAssigned
                    ? 'border-emerald-300 bg-emerald-50/60 text-emerald-900'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                }`}
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                  isActive ? 'bg-orange-500 text-white' : isAssigned ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'
                }`}>
                  {idx + 1}
                </div>
                <span>{p.name || `Passenger ${idx + 1}`}</span>
                {isAssigned ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-white border border-emerald-300 text-emerald-800 font-extrabold">
                    {assignedData.coachCode}-{assignedData.seatNumber} ({assignedData.berthType})
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400 font-medium">Click to pick</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Seat Map Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 mb-6 text-xs font-semibold text-slate-600">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-lg border-2 border-slate-300 bg-white"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-lg bg-orange-500 border border-orange-600 text-white flex items-center justify-center text-[10px] font-bold">✓</div>
          <span>Selected (Current Pax)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-lg bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">P</div>
          <span>Selected (Group)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-lg bg-slate-300 border border-slate-400 text-slate-500 flex items-center justify-center text-[10px] font-bold">✕</div>
          <span>Reserved (Booked in DB)</span>
        </div>
        <button
          type="button"
          onClick={fetchLayout}
          title="Refresh live seat status"
          className="ml-auto text-blue-600 hover:text-blue-800 p-1 flex items-center gap-1 text-[11px]"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Loading or Error State */}
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-xs font-medium">Loading coach #{coachCode} seat allocation matrix...</p>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 rounded-2xl border border-red-200 text-red-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      ) : (
        /* Visual Train Coach Container */
        <div className="relative border-4 border-slate-800 rounded-3xl p-5 bg-gradient-to-b from-slate-100 to-slate-200 shadow-inner overflow-x-auto">
          
          {/* Coach Door / Entrance Indicators */}
          <div className="flex justify-between items-center text-[10px] font-extrabold uppercase tracking-widest text-slate-500 pb-3 border-b-2 border-slate-300 mb-4">
            <span>◄ Coach Door & Restrooms</span>
            <span className="bg-slate-800 text-white px-3 py-1 rounded-md text-xs font-mono-code font-bold">
              COACH {coachCode} • CAPACITY: {layoutData?.totalSeats} SEATS
            </span>
            <span>Vestibule Gangway ►</span>
          </div>

          {/* Seat Grid Layout */}
          <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 gap-2 min-w-[580px]">
            {layoutData?.seats.map(seat => {
              const seatNum = seat.seat_number;
              const isOccupied = seat.isOccupied;

              // Check if selected by active passenger
              const isSelectedByActive = selectedSeats[activePassengerIndex]?.coachCode === coachCode && selectedSeats[activePassengerIndex]?.seatNumber === seatNum;

              // Check if selected by another passenger in this group
              const otherPaxEntry = Object.entries(selectedSeats).find(
                ([idx, sel]) => Number(idx) !== activePassengerIndex && sel.coachCode === coachCode && sel.seatNumber === seatNum
              );
              const otherPaxIndex = otherPaxEntry ? Number(otherPaxEntry[0]) : null;

              // Berth shortcode label
              let berthLabel = 'LB';
              if (seat.berth_type === 'Middle') berthLabel = 'MB';
              else if (seat.berth_type === 'Upper') berthLabel = 'UB';
              else if (seat.berth_type === 'Side Lower') berthLabel = 'SL';
              else if (seat.berth_type === 'Side Upper') berthLabel = 'SU';
              else if (seat.berth_type === 'Window') berthLabel = 'WIN';
              else if (seat.berth_type === 'Aisle') berthLabel = 'AIS';

              let buttonStyle = 'bg-white border-2 border-slate-200 text-slate-800 hover:border-blue-500 hover:bg-blue-50/50 shadow-2xs';

              if (isOccupied) {
                buttonStyle = 'bg-slate-300/80 border border-slate-400 text-slate-500 cursor-not-allowed opacity-60';
              } else if (isSelectedByActive) {
                buttonStyle = 'bg-orange-500 border-2 border-orange-600 text-white font-black shadow-md scale-105';
              } else if (otherPaxIndex !== null) {
                buttonStyle = 'bg-blue-600 border-2 border-blue-700 text-white font-black shadow-md';
              }

              return (
                <button
                  key={seatNum}
                  type="button"
                  disabled={isOccupied}
                  onClick={() => handleSeatClick(seat)}
                  title={
                    isOccupied
                      ? `Seat ${seatNum} (${seat.berth_type}) — Already Booked`
                      : `Seat ${seatNum} (${seat.berth_type}) — Click to Assign`
                  }
                  className={`relative flex flex-col items-center justify-center p-2 rounded-xl transition-all cursor-pointer h-16 ${buttonStyle}`}
                >
                  <span className="text-xs font-black font-mono-code">{seatNum}</span>
                  <span className="text-[9px] font-bold uppercase tracking-tight opacity-90">
                    {berthLabel}
                  </span>

                  {isSelectedByActive && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-white text-orange-600 rounded-full flex items-center justify-center text-[10px] font-black shadow-sm">
                      ✓
                    </span>
                  )}

                  {otherPaxIndex !== null && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-white text-blue-700 rounded-full flex items-center justify-center text-[10px] font-black shadow-sm">
                      P{otherPaxIndex + 1}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Coach Bottom Bar */}
          <div className="flex justify-between items-center text-[10px] text-slate-500 pt-3 border-t-2 border-slate-300 mt-4 font-semibold">
            <span>Window Side ────</span>
            <span>Aisle Corridor ──── Central Gangway</span>
            <span>──── Window Side</span>
          </div>

        </div>
      )}

      {/* Helpful prompt */}
      <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
        <Info className="w-4 h-4 text-blue-600 shrink-0" />
        <span>
          Tip: You can re-assign seats simply by clicking a passenger above, then clicking any green/white available berth.
        </span>
      </div>

    </div>
  );
}

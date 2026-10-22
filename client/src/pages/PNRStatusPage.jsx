import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { 
  Search, Train, CheckCircle2, AlertCircle, RefreshCw, 
  Clock, Calendar, User, ArrowRight, ShieldCheck, Ticket 
} from 'lucide-react';

export default function PNRStatusPage() {
  const [pnrInput, setPnrInput] = useState('');
  const [pnrData, setPnrData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const samplePnrs = [
    { pnr: '2418937210', label: 'Vande Bharat (NDLS → BSB)' },
    { pnr: '4529183401', label: 'Tejas Rajdhani (NDLS → MMCT)' },
    { pnr: '8923410592', label: 'Cancelled Ticket (Refunded)' }
  ];

  const handleQuery = async (targetPnr) => {
    const pnrToQuery = targetPnr || pnrInput;
    if (!pnrToQuery || pnrToQuery.trim().length !== 10) {
      setError('Please enter a valid 10-digit Indian Railways PNR number.');
      return;
    }

    setLoading(true);
    setError(null);
    setPnrData(null);

    try {
      const data = await api.getPNRStatus(pnrToQuery.trim());
      setPnrData(data);
    } catch (err) {
      setError(err.message || 'No booking record found for this PNR.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
            <Ticket className="w-3.5 h-3.5" /> Official PNR Tracker
          </div>
          <h1 className="text-3xl font-black text-slate-900 font-heading">
            Passenger Name Record (PNR) Enquiry
          </h1>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Check real-time confirmation status, coach allocation, berth assignment, and charting status.
          </p>
        </div>

        {/* PNR Search Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleQuery();
            }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <div className="relative flex-1">
              <input
                type="text"
                id="input-pnr"
                maxLength="10"
                value={pnrInput}
                onChange={(e) => {
                  setPnrInput(e.target.value.replace(/[^0-9]/g, ''));
                  setError(null);
                }}
                placeholder="Enter 10-Digit PNR Number (e.g. 2418937210)"
                className="w-full bg-slate-50 focus:bg-white text-slate-900 text-base font-bold font-mono-code rounded-2xl border border-slate-300 p-4 focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all tracking-wider"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                {pnrInput.length}/10
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-8 py-4 rounded-2xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              <span>Get PNR Status</span>
            </button>
          </form>

          {/* Seeded Quick PNR Chips */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
            <span className="font-bold text-slate-500">Quick Test PNRs:</span>
            {samplePnrs.map(s => (
              <button
                key={s.pnr}
                type="button"
                onClick={() => {
                  setPnrInput(s.pnr);
                  handleQuery(s.pnr);
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-mono-code font-bold border border-slate-200 transition-colors"
              >
                {s.pnr} <span className="text-[10px] text-slate-400 font-normal">({s.label})</span>
              </button>
            ))}
          </div>

          {/* Inline Error Message */}
          {error && (
            <div className="mt-4 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Live PNR Result Card */}
        {pnrData && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 animate-in slide-in-from-bottom-4 duration-300">
            
            {/* Status Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  PNR Status Result
                </span>
                <div className="flex items-center gap-3 mt-1">
                  <h3 className="text-3xl font-black text-slate-900 font-mono-code">
                    {pnrData.booking.pnr}
                  </h3>
                  <span className={`text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider ${
                    pnrData.booking.status === 'CONFIRMED'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-red-100 text-red-800 border border-red-300'
                  }`}>
                    {pnrData.booking.status}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-bold px-3 py-1 rounded-xl bg-blue-50 text-blue-800 border border-blue-200 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  Charting Status: Finalized
                </span>
                <Link
                  to={`/ticket/${pnrData.booking.pnr}`}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-blue-700 text-white text-xs font-bold transition-colors"
                >
                  View Full E-Ticket
                </Link>
              </div>
            </div>

            {/* Train & Journey Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 font-bold block mb-1">Train</span>
                <strong className="text-sm text-slate-900 block">{pnrData.booking.train_number} — {pnrData.booking.train_name}</strong>
                <span className="text-blue-700 font-semibold">{pnrData.booking.train_type}</span>
              </div>

              <div>
                <span className="text-slate-400 font-bold block mb-1">Route</span>
                <strong className="text-sm text-slate-900 block">
                  {pnrData.booking.source_name} → {pnrData.booking.dest_name}
                </strong>
                <span className="text-slate-500 font-medium">Dep: {pnrData.booking.departure_time} | Arr: {pnrData.booking.arrival_time}</span>
              </div>

              <div>
                <span className="text-slate-400 font-bold block mb-1">Journey Date & Class</span>
                <strong className="text-sm text-slate-900 block font-mono-code">{pnrData.booking.journey_date}</strong>
                <span className="text-slate-500 font-medium">Class: {pnrData.booking.class_code} • Quota: {pnrData.booking.quota}</span>
              </div>
            </div>

            {/* Passenger Wise Status Table */}
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 mb-3">
                Passenger Allocation:
              </h4>
              <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-white font-bold uppercase text-[10px]">
                    <tr>
                      <th className="py-3 px-4">#</th>
                      <th className="py-3 px-4">Passenger Name</th>
                      <th className="py-3 px-4">Booking Status</th>
                      <th className="py-3 px-4">Current Status</th>
                      <th className="py-3 px-4">Coach</th>
                      <th className="py-3 px-4">Berth No.</th>
                      <th className="py-3 px-4">Berth Type</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold">
                    {pnrData.passengers.map((p, idx) => (
                      <tr key={p.id || idx} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-mono-code">{idx + 1}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">{p.name} ({p.age}y, {p.gender})</td>
                        <td className="py-3 px-4 text-emerald-700 font-bold">{p.status}</td>
                        <td className="py-3 px-4 text-emerald-700 font-black">{p.status === 'CAN' ? 'CANCELLED' : 'CNF (Confirmed)'}</td>
                        <td className="py-3 px-4 font-mono-code font-bold text-blue-700">{p.coach_code}</td>
                        <td className="py-3 px-4 font-mono-code font-black text-slate-900">{p.seat_number}</td>
                        <td className="py-3 px-4 text-slate-600">{p.berth_type}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Total Fare & Refund status if cancelled */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-600">
              <div>
                <span>Total Ticket Fare: </span>
                <strong className="text-slate-900 font-mono-code text-sm">₹{pnrData.booking.total_fare?.toFixed(2)}</strong>
              </div>

              {pnrData.booking.status === 'CANCELLED' && (
                <div className="text-red-700 font-bold bg-red-50 px-3 py-1 rounded-xl border border-red-200">
                  Refund Processed: ₹{pnrData.booking.refund_amount?.toFixed(2)}
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

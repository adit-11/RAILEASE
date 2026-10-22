import React from 'react';
import { X, Clock, MapPin, Train, ShieldCheck } from 'lucide-react';

export default function RouteModal({ train, routes, onClose }) {
  if (!train) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30">
                {train.type}
              </span>
              <span className="text-xs text-slate-400">Train #{train.number}</span>
            </div>
            <h3 className="text-xl font-bold font-heading">{train.name}</h3>
            <p className="text-xs text-slate-400">
              {train.source_name} ({train.source_code}) → {train.dest_name} ({train.dest_code}) • {train.distance_km} km • Runs: {train.days_of_run}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Schedule List */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider pb-2 border-b border-slate-100">
            <span>Station & Halt</span>
            <div className="flex items-center gap-8">
              <span>Arrival</span>
              <span>Departure</span>
              <span>Platform</span>
            </div>
          </div>

          {routes && routes.length > 0 ? (
            <div className="space-y-3 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-blue-200 before:z-0">
              {routes.map((st, index) => (
                <div key={st.id || index} className="relative z-10 flex items-center justify-between bg-slate-50 hover:bg-blue-50/50 p-3.5 rounded-2xl border border-slate-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-white border-2 border-blue-600 flex items-center justify-center text-[10px] font-bold text-blue-800 shadow-sm">
                      {st.stop_number}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">{st.station_name}</h4>
                      <p className="text-xs text-slate-500">
                        Code: <strong className="text-slate-700">{st.station_code}</strong> • {st.distance_km} km
                        {st.halt_mins > 0 && ` • Halt: ${st.halt_mins}m`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-8 text-sm font-semibold">
                    <span className="text-slate-600 w-14 text-center">{st.arrival_time}</span>
                    <span className="text-blue-700 w-14 text-center">{st.departure_time}</span>
                    <span className="w-12 text-center text-xs font-bold bg-slate-200/70 text-slate-700 px-2 py-0.5 rounded-md">
                      PF {st.platform || '1'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-slate-400 text-sm">No intermediate stops schedule available.</p>
          )}

          <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200/80 text-xs text-amber-900 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" />
            <span>
              Timings are verified with Indian Railways PRS schedule for demo runs. Please arrive at the platform at least 20 minutes prior to departure.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition-colors"
          >
            Close Timetable
          </button>
        </div>

      </div>
    </div>
  );
}

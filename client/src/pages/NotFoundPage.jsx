import React from 'react';
import { Link } from 'react-router-dom';
import { Train, ArrowLeft, Home, Compass } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6 text-center">
      <div className="max-w-md space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400 mx-auto">
          <Train className="w-10 h-10 animate-bounce" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono-code font-bold uppercase tracking-widest text-orange-400 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20">
            Error 404 — Signal Not Found
          </span>
          <h1 className="text-4xl font-black font-heading text-white">
            Off the Track!
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            The station, train route, or booking resource you were searching for does not exist or has been switched to an alternate terminal.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <Link
            to="/"
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Return to RailEase Home</span>
          </Link>
          <Link
            to="/trains"
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-all"
          >
            <Compass className="w-4 h-4" />
            <span>Search Active Trains</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

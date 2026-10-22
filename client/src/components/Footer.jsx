import React from 'react';
import { Link } from 'react-router-dom';
import { Train, Shield, PhoneCall, Heart, Award, ArrowUpRight, Clock, HelpCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 text-sm no-print">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-900/60 via-slate-900 to-orange-950/40 border-b border-slate-800/80 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-slate-300 font-medium">
              Indian Railways PRS Online Systems: <span className="text-emerald-400 font-bold">Operational (Live Demo)</span>
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-6 text-slate-300">
            <span className="flex items-center gap-1.5">
              <PhoneCall className="w-3.5 h-3.5 text-orange-400" />
              Rail Madad Helpline: <strong className="text-white">139</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-blue-400" />
              RPF Security Helpline: <strong className="text-white">182</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              Tatkal Window: <strong className="text-white">10:00 AM (AC) / 11:00 AM (Non-AC)</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-orange-500 flex items-center justify-center text-white shadow-md">
                <Train className="w-5 h-5" />
              </div>
              <span className="text-2xl font-black text-white tracking-tight font-heading">
                Rail<span className="text-orange-500">Ease</span>
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              Next-generation railway reservation portal engineered for high-speed search, interactive berth selection, transparent fare breakdowns, and instantaneous digital ticketing.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-orange-400 font-medium">
              <Award className="w-4 h-4 text-orange-400 shrink-0" />
              B.Tech Software Engineering Capstone Project
            </div>
          </div>

          {/* Quick Routes */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Popular Trains</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/trains?from=NDLS&to=BSB" className="hover:text-orange-400 transition-colors flex items-center gap-1">
                  New Delhi ⇄ Varanasi Vande Bharat
                </Link>
              </li>
              <li>
                <Link to="/trains?from=NDLS&to=MMCT" className="hover:text-orange-400 transition-colors flex items-center gap-1">
                  Delhi ⇄ Mumbai Tejas Rajdhani
                </Link>
              </li>
              <li>
                <Link to="/trains?from=NDLS&to=LKO" className="hover:text-orange-400 transition-colors flex items-center gap-1">
                  Delhi ⇄ Lucknow Shatabdi
                </Link>
              </li>
              <li>
                <Link to="/trains?from=MAS&to=SBC" className="hover:text-orange-400 transition-colors flex items-center gap-1">
                  Chennai ⇄ Bengaluru Shatabdi
                </Link>
              </li>
              <li>
                <Link to="/trains?from=PUNE&to=CSMT" className="hover:text-orange-400 transition-colors flex items-center gap-1">
                  Pune ⇄ Mumbai Deccan Queen
                </Link>
              </li>
            </ul>
          </div>

          {/* Passenger Services */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Passenger Care</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/pnr-status" className="hover:text-white transition-colors">PNR Status Enquiry</Link></li>
              <li><Link to="/trains" className="hover:text-white transition-colors">Seat Availability</Link></li>
              <li><Link to="/my-bookings" className="hover:text-white transition-colors">Cancel Ticket & Refund</Link></li>
              <li><Link to="/my-bookings" className="hover:text-white transition-colors">Download E-Ticket</Link></li>
              <li><span className="text-slate-500">Tatkal Booking Guide</span></li>
            </ul>
          </div>

          {/* Academic & Tech Architecture */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Tech Architecture</h4>
            <ul className="space-y-2 text-xs">
              <li><span className="text-slate-400">React 19 & Vite 8</span></li>
              <li><span className="text-slate-400">Tailwind CSS Modern UI</span></li>
              <li><span className="text-slate-400">Node.js Express REST API</span></li>
              <li><span className="text-slate-400">SQLite (Better-SQLite3)</span></li>
              <li><span className="text-slate-400">JWT Authentication & BCrypt</span></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800/80 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            © 2026 RailEase — Academic Demonstration Project. Not an official Indian Railways / IRCTC website.
          </p>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-400 transition-colors cursor-pointer">Security Policy</span>
            <span>•</span>
            <span className="hover:text-slate-400 transition-colors cursor-pointer">Fare Rules</span>
            <span>•</span>
            <span className="hover:text-slate-400 transition-colors cursor-pointer">Disclaimer</span>
          </div>
        </div>

      </div>
    </footer>
  );
}

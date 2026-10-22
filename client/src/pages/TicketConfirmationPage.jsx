import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { 
  Train, Printer, Download, CheckCircle2, QrCode, ArrowLeft, 
  Share2, ShieldCheck, Calendar, Clock, MapPin, User, AlertCircle, RefreshCw 
} from 'lucide-react';

export default function TicketConfirmationPage() {
  const { pnr } = useParams();
  const [ticketData, setTicketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!pnr) return;
    setLoading(true);
    api.getPNRStatus(pnr)
      .then(data => {
        setTicketData(data);
      })
      .catch(err => {
        setError(err.message || 'Ticket not found.');
      })
      .finally(() => setLoading(false));
  }, [pnr]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-sm font-semibold text-slate-700">Generating Official Electronic Reservation Slip (ERS)...</p>
        </div>
      </div>
    );
  }

  if (error || !ticketData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-8 shadow-xl max-w-md text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900">Ticket Retrieval Failed</h2>
          <p className="text-xs text-slate-600">{error || 'Could not find booking for this PNR.'}</p>
          <Link
            to="/my-bookings"
            className="inline-block px-6 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold"
          >
            Go to My Bookings
          </Link>
        </div>
      </div>
    );
  }

  const { booking, passengers, payment, chartPrepared } = ticketData;

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Top Control Bar (Hidden when printing) */}
        <div className="no-print bg-white p-4 rounded-3xl shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <Link
            to="/my-bookings"
            className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to My Bookings</span>
          </Link>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print E-Ticket</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>

        {/* Official Printable IRCTC-Style Electronic Reservation Slip (ERS) */}
        <div className="ticket-container bg-white rounded-3xl shadow-2xl border-2 border-slate-300 overflow-hidden text-slate-900 p-6 sm:p-10 space-y-6">
          
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b-2 border-slate-800">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center text-white p-2">
                <Train className="w-9 h-9 text-orange-400" />
              </div>
              <div>
                <h1 className="text-2xl font-black font-heading tracking-tight">
                  INDIAN RAILWAYS — Rail<span className="text-orange-600">Ease</span>
                </h1>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Electronic Reservation Slip (ERS) • Valid with Government ID
                </p>
              </div>
            </div>

            {/* PNR Banner */}
            <div className="text-right sm:border-l-2 sm:border-slate-300 sm:pl-6">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                PNR Number
              </span>
              <span className="text-2xl font-black text-blue-800 font-mono-code tracking-wider">
                {booking.pnr}
              </span>
              <span className="inline-block mt-1 text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300">
                {booking.status}
              </span>
            </div>
          </div>

          {/* Train & Journey Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 uppercase font-bold block text-[10px]">Train No. & Name</span>
              <strong className="text-sm font-black text-slate-900">{booking.train_number}</strong>
              <p className="text-slate-700 font-semibold truncate">{booking.train_name}</p>
            </div>

            <div>
              <span className="text-slate-500 uppercase font-bold block text-[10px]">Date of Journey</span>
              <strong className="text-sm font-black text-slate-900 font-mono-code">{booking.journey_date}</strong>
              <p className="text-slate-700 font-semibold">Quota: {booking.quota}</p>
            </div>

            <div>
              <span className="text-slate-500 uppercase font-bold block text-[10px]">Class & Schedule</span>
              <strong className="text-sm font-black text-slate-900">{booking.class_code}</strong>
              <p className="text-slate-700 font-semibold">Dep: {booking.departure_time} | Arr: {booking.arrival_time}</p>
            </div>

            <div>
              <span className="text-slate-500 uppercase font-bold block text-[10px]">Booking Reference</span>
              <strong className="text-sm font-black text-slate-900 font-mono-code">BKG-{booking.id}</strong>
              <p className="text-slate-700 font-semibold">{booking.booked_at ? new Date(booking.booked_at).toLocaleDateString() : 'Confirmed'}</p>
            </div>
          </div>

          {/* Route Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block mb-1">
                From (Source Station)
              </span>
              <p className="text-base font-black text-slate-900">
                {booking.source_name} ({booking.source_code})
              </p>
              <p className="text-slate-600 font-medium">Departure Time: {booking.departure_time} IST</p>
            </div>

            <div className="p-4 rounded-2xl bg-orange-50/60 border border-orange-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-orange-700 block mb-1">
                To (Destination Station)
              </span>
              <p className="text-base font-black text-slate-900">
                {booking.dest_name} ({booking.dest_code})
              </p>
              <p className="text-slate-600 font-medium">Arrival Time: {booking.arrival_time} IST</p>
            </div>
          </div>

          {/* Passenger Details Table */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                Passenger Details & Seat Reservation:
              </h3>
              <span className="text-xs text-slate-500 font-medium">
                Total Passengers: {passengers.length}
              </span>
            </div>

            <div className="overflow-x-auto border-2 border-slate-200 rounded-2xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-white font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">#</th>
                    <th className="py-3 px-4">Passenger Name</th>
                    <th className="py-3 px-4">Age</th>
                    <th className="py-3 px-4">Gender</th>
                    <th className="py-3 px-4">Coach</th>
                    <th className="py-3 px-4">Seat / Berth No.</th>
                    <th className="py-3 px-4">Berth Type</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-semibold">
                  {passengers.map((p, idx) => (
                    <tr key={p.id || idx} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono-code">{idx + 1}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{p.name}</td>
                      <td className="py-3 px-4">{p.age} yrs</td>
                      <td className="py-3 px-4">{p.gender}</td>
                      <td className="py-3 px-4 font-mono-code font-bold text-blue-700">{p.coach_code}</td>
                      <td className="py-3 px-4 font-mono-code font-black text-slate-900">{p.seat_number}</td>
                      <td className="py-3 px-4 font-medium text-slate-700">{p.berth_type}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
                          {p.status || 'CNF'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Fare Summary & Payment Receipt */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center pt-4 border-t-2 border-slate-200">
            
            {/* QR Code graphic for verification */}
            <div className="sm:col-span-4 flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="w-20 h-20 bg-slate-900 rounded-xl flex items-center justify-center p-1 text-white">
                <QrCode className="w-16 h-16 text-orange-400" />
              </div>
              <div className="text-[11px] text-slate-500">
                <strong className="block text-slate-800 font-bold">Digital TTE Verification</strong>
                <span>Scan for contactless ticket inspection onboard.</span>
              </div>
            </div>

            {/* Fare Breakdown */}
            <div className="sm:col-span-8 space-y-1.5 text-xs text-slate-600 sm:text-right">
              <div className="flex justify-between sm:justify-end sm:gap-6">
                <span>Ticket Base Fare:</span>
                <span className="font-mono-code font-semibold text-slate-800">₹{booking.base_fare?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between sm:justify-end sm:gap-6">
                <span>Reservation & Superfast Surcharge:</span>
                <span className="font-mono-code font-semibold text-slate-800">
                  ₹{((booking.reservation_charge || 0) + (booking.superfast_charge || 0)).toFixed(2)}
                </span>
              </div>
              {booking.gst > 0 && (
                <div className="flex justify-between sm:justify-end sm:gap-6">
                  <span>Goods & Services Tax (GST 5%):</span>
                  <span className="font-mono-code font-semibold text-slate-800">₹{booking.gst?.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between sm:justify-end sm:gap-6 text-slate-900 font-bold text-sm pt-2 border-t border-slate-200">
                <span>Total Amount Paid:</span>
                <span className="font-mono-code font-black text-blue-700 text-lg">
                  ₹{booking.total_fare?.toFixed(2)}
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                Payment Mode: {booking.payment_method} • Transaction Ref: {booking.payment_ref}
              </p>
            </div>

          </div>

          {/* Important Passenger Instructions */}
          <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200/80 text-[11px] text-amber-950 space-y-1.5">
            <h4 className="font-bold flex items-center gap-1.5 text-amber-900">
              <ShieldCheck className="w-4 h-4 text-amber-700" />
              Important Travel Guidelines:
            </h4>
            <ul className="list-disc list-inside space-y-1 text-slate-700">
              <li>One of the passengers booked on this ERS must carry an original government-issued photo identity card (Aadhaar, Passport, Driving License, Voter ID).</li>
              <li>Chart preparation status: {chartPrepared ? 'Chart Finalized' : 'Chart in preparation'}. Check platform screens 30 mins before scheduled departure.</li>
              <li>Rail Madad 24x7 passenger grievance helpline is reachable at <strong>139</strong>.</li>
            </ul>
          </div>

        </div>

      </div>
    </div>
  );
}

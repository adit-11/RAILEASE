import React from 'react';
import { AlertTriangle, X, ShieldAlert, Check } from 'lucide-react';

export default function ConfirmationModal({
  isOpen,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  booking,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  loading = false
}) {
  if (!isOpen) return null;

  const totalFare = booking?.total_fare || 0;
  const paxCount = booking?.total_passengers || 1;
  const clerkage = 120 * paxCount;
  const refundAmount = Math.max(0, totalFare - clerkage);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 bg-red-50 border-b border-red-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shadow-xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-red-950 font-heading">{title}</h3>
              <p className="text-xs text-red-700">Irreversible railway ticket cancellation</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            disabled={loading}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-600 leading-relaxed">
            {message}
          </p>

          {booking && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>PNR Number:</span>
                <strong className="text-slate-900 font-mono-code font-bold">{booking.pnr}</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Train:</span>
                <span className="font-semibold text-slate-800">{booking.train_number} — {booking.train_name}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Original Fare Paid:</span>
                <span className="font-semibold text-slate-800">₹{totalFare.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>IRCTC Cancellation Clerkage ({paxCount} pax):</span>
                <span>- ₹{clerkage.toFixed(2)}</span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between text-emerald-700 text-sm font-bold">
                <span>Estimated Refund Amount:</span>
                <span>₹{refundAmount.toFixed(2)}</span>
              </div>
            </div>
          )}

          <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-[11px] text-amber-800 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Your reserved berths will be instantly returned to demo availability for other passengers.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-white text-xs font-bold transition-all cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-md shadow-red-600/20 cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Processing...' : confirmText}
          </button>
        </div>

      </div>
    </div>
  );
}

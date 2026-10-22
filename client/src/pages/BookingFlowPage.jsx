import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import SeatSelector from '../components/SeatSelector';
import confetti from 'canvas-confetti';
import { 
  Train, ArrowRight, UserPlus, Trash2, CheckCircle2, ShieldCheck, 
  CreditCard, QrCode, Building, Lock, AlertCircle, ArrowLeft, RefreshCw, Sparkles 
} from 'lucide-react';

export default function BookingFlowPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const trainId = searchParams.get('trainId');
  const classCode = searchParams.get('classCode') || 'CC';
  const journeyDate = searchParams.get('date') || new Date().toISOString().split('T')[0];
  const quota = searchParams.get('quota') || 'General';

  const [currentStep, setCurrentStep] = useState(1);
  const [trainData, setTrainData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Booking state
  const [selectedCoach, setSelectedCoach] = useState('C1');
  const [availableCoaches, setAvailableCoaches] = useState([]);
  
  // Passengers array
  const [passengers, setPassengers] = useState([
    { name: user?.name || '', age: '28', gender: 'Male', berthPreference: 'Lower' }
  ]);

  // Selected seats mapping: { [passengerIndex]: { seatNumber, berthType, coachCode } }
  const [selectedSeats, setSelectedSeats] = useState({});

  // Contact details
  const [contactEmail, setContactEmail] = useState(user?.email || 'passenger@railease.in');
  const [contactPhone, setContactPhone] = useState(user?.phone || '9876543210');

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [upiId, setUpiId] = useState('rohan@okaxis');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8821');
  const [cardHolder, setCardHolder] = useState(user?.name || 'Rohan Sharma');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('842');
  const [selectedBank, setSelectedBank] = useState('SBI');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch train details
  useEffect(() => {
    if (!trainId) {
      navigate('/trains');
      return;
    }

    setLoading(true);
    api.getTrainDetails(trainId)
      .then(data => {
        setTrainData(data);
        // Find matching coaches for chosen classCode
        const matching = data.coaches.filter(c => c.class_code === classCode);
        const codes = matching.map(c => c.coach_code);
        setAvailableCoaches(codes);
        if (codes.length > 0) {
          setSelectedCoach(codes[0]);
        }
      })
      .catch(err => {
        setError(err.message || 'Failed to load train details');
      })
      .finally(() => setLoading(false));
  }, [trainId, classCode]);

  // Passenger management
  const handleAddPassenger = () => {
    if (passengers.length >= 6) {
      showToast('Maximum 6 passengers allowed per booking', 'error');
      return;
    }
    setPassengers([
      ...passengers,
      { name: '', age: '25', gender: 'Male', berthPreference: 'Window' }
    ]);
  };

  const handleRemovePassenger = (index) => {
    if (passengers.length === 1) {
      showToast('At least one passenger is required', 'error');
      return;
    }
    const updated = passengers.filter((_, idx) => idx !== index);
    setPassengers(updated);

    // Clean up seat mapping
    const newSeats = {};
    let newIdx = 0;
    Object.entries(selectedSeats).forEach(([k, v]) => {
      if (Number(k) !== index) {
        newSeats[newIdx++] = v;
      }
    });
    setSelectedSeats(newSeats);
  };

  const handlePassengerChange = (index, field, value) => {
    const updated = [...passengers];
    updated[index][field] = value;
    setPassengers(updated);
  };

  const handleSeatSelected = (passengerIndex, seatNumber, berthType, coachCode) => {
    setSelectedSeats(prev => ({
      ...prev,
      [passengerIndex]: { seatNumber, berthType, coachCode }
    }));
    showToast(`Assigned ${coachCode}-${seatNumber} (${berthType}) to ${passengers[passengerIndex]?.name || `Passenger ${passengerIndex + 1}`}`, 'success', 2500);
  };

  // Calculations
  const coachInfo = trainData?.coaches.find(c => c.class_code === classCode) || trainData?.coaches[0];
  const baseFarePerPax = coachInfo?.base_fare || 1000;
  const paxCount = passengers.length;
  const totalBaseFare = baseFarePerPax * paxCount;
  const reservationCharge = 40 * paxCount;
  const superfastCharge = 45 * paxCount;
  const isAC = ['1A', '2A', '3A', 'CC', 'EC'].includes(classCode);
  const gst = isAC ? Number(((totalBaseFare + reservationCharge + superfastCharge) * 0.05).toFixed(2)) : 0;
  const totalPayable = Number((totalBaseFare + reservationCharge + superfastCharge + gst).toFixed(2));

  // Step Validation
  const validateStep2 = () => {
    for (let i = 0; i < passengers.length; i++) {
      const p = passengers[i];
      if (!p.name || p.name.trim().length < 2) {
        showToast(`Please enter a valid name for Passenger ${i + 1}`, 'error');
        return false;
      }
      const ageNum = parseInt(p.age, 10);
      if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
        showToast(`Please enter a valid age for Passenger ${i + 1}`, 'error');
        return false;
      }
    }
    if (!contactEmail || !contactEmail.includes('@')) {
      showToast('Please enter a valid contact email for ticket delivery', 'error');
      return false;
    }
    if (!contactPhone || contactPhone.trim().length < 10) {
      showToast('Please enter a 10-digit mobile number for SMS ticket delivery', 'error');
      return false;
    }
    return true;
  };

  // Final Booking Submission
  const handleFinalBooking = async () => {
    setIsSubmitting(true);
    try {
      const formattedPassengers = passengers.map((p, idx) => {
        const assigned = selectedSeats[idx];
        return {
          name: p.name.trim(),
          age: parseInt(p.age, 10),
          gender: p.gender,
          berthPreference: p.berthPreference,
          coachCode: assigned?.coachCode || selectedCoach,
          seatNumber: assigned?.seatNumber || null
        };
      });

      const payload = {
        userId: user?.id || null,
        trainId: Number(trainId),
        journeyDate,
        classCode,
        quota,
        passengers: formattedPassengers,
        paymentMethod,
        contactEmail,
        contactPhone
      };

      const res = await api.createBooking(payload);

      // Trigger Confetti
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });

      showToast('Booking confirmed! Redirecting to E-Ticket...', 'success');
      setTimeout(() => {
        const confirmedPnr = res?.booking?.pnr || res?.pnr;
        if (confirmedPnr) {
          navigate(`/ticket/${confirmedPnr}`);
        } else {
          navigate('/my-bookings');
        }
      }, 1000);

    } catch (err) {
      console.error('Booking submission error:', err);
      showToast(err.message || 'Booking failed. Seat may already be reserved.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-sm font-semibold text-slate-700">Loading reservation terminal...</p>
        </div>
      </div>
    );
  }

  if (error || !trainData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-8 shadow-xl max-w-md text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900">Reservation Error</h2>
          <p className="text-xs text-slate-600">{error || 'Train not found.'}</p>
          <button
            onClick={() => navigate('/trains')}
            className="px-6 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold"
          >
            Back to Train Search
          </button>
        </div>
      </div>
    );
  }

  const { train } = trainData;

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Step Progression Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            
            {/* Step 1 */}
            <div className={`flex flex-col items-center ${currentStep >= 1 ? 'text-blue-700' : 'text-slate-400'}`}>
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                currentStep >= 1 ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-slate-300'
              }`}>
                1
              </div>
              <span className="text-[11px] font-bold mt-1">Review</span>
            </div>

            <div className={`flex-1 h-0.5 mx-2 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-slate-200'}`}></div>

            {/* Step 2 */}
            <div className={`flex flex-col items-center ${currentStep >= 2 ? 'text-blue-700' : 'text-slate-400'}`}>
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                currentStep >= 2 ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-slate-300'
              }`}>
                2
              </div>
              <span className="text-[11px] font-bold mt-1">Passengers</span>
            </div>

            <div className={`flex-1 h-0.5 mx-2 ${currentStep >= 3 ? 'bg-blue-600' : 'bg-slate-200'}`}></div>

            {/* Step 3 */}
            <div className={`flex flex-col items-center ${currentStep >= 3 ? 'text-blue-700' : 'text-slate-400'}`}>
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                currentStep >= 3 ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-slate-300'
              }`}>
                3
              </div>
              <span className="text-[11px] font-bold mt-1">Coach & Seat</span>
            </div>

            <div className={`flex-1 h-0.5 mx-2 ${currentStep >= 4 ? 'bg-blue-600' : 'bg-slate-200'}`}></div>

            {/* Step 4 */}
            <div className={`flex flex-col items-center ${currentStep >= 4 ? 'text-blue-700' : 'text-slate-400'}`}>
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                currentStep >= 4 ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-slate-300'
              }`}>
                4
              </div>
              <span className="text-[11px] font-bold mt-1">Demo Pay</span>
            </div>

          </div>
        </div>

        {/* Train Summary Banner */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0">
              <Train className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black font-heading">{train.name}</h2>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  #{train.number}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {train.source_name} ({train.source_code}) → {train.dest_name} ({train.dest_code}) • Dep: {train.departure_time} • Arr: {train.arrival_time}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div className="bg-slate-800 px-3.5 py-2 rounded-xl border border-slate-700">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Class</span>
              <span className="text-white font-extrabold text-sm">{classCode} — {coachInfo?.class_name}</span>
            </div>
            <div className="bg-slate-800 px-3.5 py-2 rounded-xl border border-slate-700">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Journey Date</span>
              <span className="text-orange-400 font-extrabold text-sm">{journeyDate}</span>
            </div>
            <div className="bg-slate-800 px-3.5 py-2 rounded-xl border border-slate-700">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Quota</span>
              <span className="text-emerald-400 font-extrabold text-sm">{quota}</span>
            </div>
          </div>
        </div>

        {/* 2-Column Layout: Step Workspace + Real-Time Fare Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Step Workspace */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* STEP 1: Train & Journey Review */}
            {currentStep === 1 && (
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-6">
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="text-lg font-bold text-slate-900 font-heading">
                    Step 1: Train & Class Confirmation
                  </h3>
                  <p className="text-xs text-slate-500">
                    Verify route, scheduled departure, and travel class details.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                    <span className="text-slate-400 font-bold uppercase block mb-1">Departure Station</span>
                    <strong className="text-sm text-slate-900 block">{train.source_name} ({train.source_code})</strong>
                    <span className="text-blue-700 font-semibold">Scheduled Departure: {train.departure_time}</span>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                    <span className="text-slate-400 font-bold uppercase block mb-1">Destination Station</span>
                    <strong className="text-sm text-slate-900 block">{train.dest_name} ({train.dest_code})</strong>
                    <span className="text-orange-700 font-semibold">Scheduled Arrival: {train.arrival_time}</span>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-200 text-xs text-blue-900 flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
                  <span>
                    Your ticket will be issued under <strong>{quota} Quota</strong> with guaranteed electronic verification and chart tracking.
                  </span>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="px-6 py-3 rounded-2xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs flex items-center gap-2 shadow-md"
                  >
                    <span>Proceed to Passenger Details</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Passenger Details */}
            {currentStep === 2 && (
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 font-heading">
                      Step 2: Enter Passenger Details
                    </h3>
                    <p className="text-xs text-slate-500">
                      Add up to 6 passengers for this journey. Names must match government ID.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddPassenger}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200 transition-colors"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Add Passenger</span>
                  </button>
                </div>

                {/* Passenger Cards */}
                <div className="space-y-4">
                  {passengers.map((p, index) => (
                    <div key={index} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 relative group">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                          Passenger {index + 1}
                        </span>
                        {passengers.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemovePassenger(index)}
                            className="text-red-500 hover:text-red-700 p-1"
                            title="Remove passenger"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                        <div className="sm:col-span-5">
                          <label className="block text-[11px] font-bold text-slate-500 mb-1">Full Name</label>
                          <input
                            type="text"
                            placeholder="e.g. Rohan Sharma"
                            value={p.name}
                            onChange={(e) => handlePassengerChange(index, 'name', e.target.value)}
                            className="w-full bg-white text-slate-900 text-xs rounded-xl border border-slate-300 p-2.5 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-bold text-slate-500 mb-1">Age</label>
                          <input
                            type="number"
                            min="1"
                            max="120"
                            value={p.age}
                            onChange={(e) => handlePassengerChange(index, 'age', e.target.value)}
                            className="w-full bg-white text-slate-900 text-xs rounded-xl border border-slate-300 p-2.5 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-bold text-slate-500 mb-1">Gender</label>
                          <select
                            value={p.gender}
                            onChange={(e) => handlePassengerChange(index, 'gender', e.target.value)}
                            className="w-full bg-white text-slate-900 text-xs rounded-xl border border-slate-300 p-2.5 focus:ring-2 focus:ring-blue-600 focus:outline-none cursor-pointer"
                          >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Transgender">Transgender</option>
                          </select>
                        </div>

                        <div className="sm:col-span-3">
                          <label className="block text-[11px] font-bold text-slate-500 mb-1">Berth Preference</label>
                          <select
                            value={p.berthPreference}
                            onChange={(e) => handlePassengerChange(index, 'berthPreference', e.target.value)}
                            className="w-full bg-white text-slate-900 text-xs rounded-xl border border-slate-300 p-2.5 focus:ring-2 focus:ring-blue-600 focus:outline-none cursor-pointer"
                          >
                            <option value="Lower">Lower Berth</option>
                            <option value="Middle">Middle Berth</option>
                            <option value="Upper">Upper Berth</option>
                            <option value="Side Lower">Side Lower</option>
                            <option value="Side Upper">Side Upper</option>
                            <option value="Window">Window Seat</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Contact Information */}
                <div className="pt-4 border-t border-slate-100">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                    Ticket Delivery Contact
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">Email for E-Ticket</label>
                      <input
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className="w-full bg-white text-slate-900 text-xs rounded-xl border border-slate-300 p-2.5 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">10-Digit Mobile Number</label>
                      <input
                        type="tel"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        className="w-full bg-white text-slate-900 text-xs rounded-xl border border-slate-300 p-2.5 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (validateStep2()) {
                        setCurrentStep(3);
                      }
                    }}
                    className="px-6 py-3 rounded-2xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs flex items-center gap-2 shadow-md"
                  >
                    <span>Proceed to Seat Selection</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Interactive Visual Seat Selector */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <SeatSelector
                  trainId={train.id}
                  journeyDate={journeyDate}
                  coachCode={selectedCoach}
                  availableCoaches={availableCoaches}
                  onCoachChange={(code) => setSelectedCoach(code)}
                  passengers={passengers}
                  selectedSeats={selectedSeats}
                  onSeatSelect={handleSeatSelected}
                />

                <div className="flex items-center justify-between bg-white p-5 rounded-3xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold"
                  >
                    Back to Passengers
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(4)}
                    className="px-6 py-3 rounded-2xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs flex items-center gap-2 shadow-md"
                  >
                    <span>Confirm Seats & Proceed to Pay</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: Simulated Payment Screen */}
            {currentStep === 4 && (
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-6">
                
                {/* Academic Demo Disclaimer Banner */}
                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold">Simulated Academic Payment Gateway</strong>
                    <span>
                      This is an educational demonstration. No real bank accounts or credit cards are charged. You can click "Pay & Confirm Booking" to generate your real PNR immediately.
                    </span>
                  </div>
                </div>

                {/* Payment Methods Tabs */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                    Choose Payment Mode:
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('UPI')}
                      className={`p-3.5 rounded-2xl border-2 text-center transition-all cursor-pointer flex flex-col items-center gap-2 ${
                        paymentMethod === 'UPI'
                          ? 'border-blue-600 bg-blue-50/60 text-blue-900 font-bold'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <QrCode className="w-5 h-5 text-blue-600" />
                      <span className="text-xs">UPI QR / VPA</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('Card')}
                      className={`p-3.5 rounded-2xl border-2 text-center transition-all cursor-pointer flex flex-col items-center gap-2 ${
                        paymentMethod === 'Card'
                          ? 'border-blue-600 bg-blue-50/60 text-blue-900 font-bold'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <CreditCard className="w-5 h-5 text-blue-600" />
                      <span className="text-xs">Debit / Credit Card</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('NetBanking')}
                      className={`p-3.5 rounded-2xl border-2 text-center transition-all cursor-pointer flex flex-col items-center gap-2 ${
                        paymentMethod === 'NetBanking'
                          ? 'border-blue-600 bg-blue-50/60 text-blue-900 font-bold'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <Building className="w-5 h-5 text-blue-600" />
                      <span className="text-xs">Net Banking</span>
                    </button>
                  </div>
                </div>

                {/* UPI Simulator */}
                {paymentMethod === 'UPI' && (
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center gap-6">
                    <div className="w-36 h-36 bg-white p-3 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center">
                      <div className="w-28 h-28 bg-slate-900 rounded-lg flex items-center justify-center p-1 text-white">
                        <QrCode className="w-24 h-24 text-orange-400" />
                      </div>
                    </div>
                    <div className="space-y-3 flex-1 text-center sm:text-left">
                      <h4 className="text-sm font-bold text-slate-800">Scan QR Code or enter UPI ID</h4>
                      <p className="text-xs text-slate-500">
                        Compatible with Google Pay, PhonePe, Paytm, and BHIM UPI.
                      </p>
                      <div>
                        <input
                          type="text"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          placeholder="yourname@upi"
                          className="w-full max-w-xs bg-white text-slate-900 text-xs rounded-xl border border-slate-300 p-2.5 font-mono-code"
                        />
                      </div>
                      <span className="inline-block text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Simulated auto-approval ready
                      </span>
                    </div>
                  </div>
                )}

                {/* Card Simulator */}
                {paymentMethod === 'Card' && (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-tr from-slate-900 via-blue-950 to-indigo-900 text-white p-5 rounded-2xl shadow-md max-w-sm mx-auto space-y-4">
                      <div className="flex justify-between items-center text-xs text-slate-400">
                        <span>RailEase Demo Card</span>
                        <span className="font-bold text-orange-400">VISA / RuPay</span>
                      </div>
                      <p className="text-lg font-mono-code tracking-widest text-center py-2">
                        {cardNumber}
                      </p>
                      <div className="flex justify-between text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase">Card Holder</span>
                          <span className="font-bold">{cardHolder}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase">Expires</span>
                          <span className="font-bold font-mono-code">{cardExpiry}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs max-w-sm mx-auto">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Card Number</label>
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          className="w-full bg-slate-50 text-slate-900 p-2 rounded-xl border border-slate-300 font-mono-code"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">CVV</label>
                        <input
                          type="password"
                          maxLength="3"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          className="w-full bg-slate-50 text-slate-900 p-2 rounded-xl border border-slate-300 font-mono-code"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Net Banking Simulator */}
                {paymentMethod === 'NetBanking' && (
                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-slate-500">Select Bank:</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                      {['SBI (State Bank)', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Punjab National Bank', 'Bank of Baroda'].map(b => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => setSelectedBank(b)}
                          className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                            selectedBank === b
                              ? 'border-blue-600 bg-blue-50 text-blue-900'
                              : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Confirm and Pay Button */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    disabled={isSubmitting}
                    className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold"
                  >
                    Back to Seats
                  </button>

                  <button
                    type="button"
                    onClick={handleFinalBooking}
                    disabled={isSubmitting}
                    className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-sm shadow-xl shadow-orange-500/25 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Lock className="w-4 h-4" />
                    <span>{isSubmitting ? 'Securing PNR...' : `Pay & Confirm ₹${totalPayable}`}</span>
                  </button>
                </div>

              </div>
            )}

          </div>

          {/* Right Column: Fare Breakdown Card */}
          <div className="lg:col-span-4 sticky top-28">
            <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-200 space-y-4">
              
              <div className="border-b border-slate-100 pb-3">
                <h4 className="text-sm font-black text-slate-900 font-heading uppercase tracking-wider">
                  Fare Summary
                </h4>
                <p className="text-[11px] text-slate-500">Official Indian Railways Fare Breakdown</p>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Base Ticket Fare ({paxCount} × ₹{baseFarePerPax}):</span>
                  <span className="font-semibold text-slate-900 font-mono-code">₹{totalBaseFare.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>IRCTC Reservation Charge:</span>
                  <span className="font-semibold text-slate-900 font-mono-code">₹{reservationCharge.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>Superfast Surcharge:</span>
                  <span className="font-semibold text-slate-900 font-mono-code">₹{superfastCharge.toFixed(2)}</span>
                </div>

                {isAC && (
                  <div className="flex justify-between text-slate-600">
                    <span>GST (5% for AC Classes):</span>
                    <span className="font-semibold text-slate-900 font-mono-code">₹{gst.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Payment Gateway Convenience Fee:</span>
                  <span>FREE (₹0.00)</span>
                </div>

                <div className="border-t-2 border-dashed border-slate-200 pt-3 flex justify-between items-baseline">
                  <span className="text-sm font-bold text-slate-900">Total Payable:</span>
                  <span className="text-2xl font-black text-blue-700 font-mono-code">
                    ₹{totalPayable.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Passenger & Seat Allocation Preview in Sidebar */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Allocated Berths ({paxCount} Pax):
                </span>
                {passengers.map((p, idx) => {
                  const assigned = selectedSeats[idx];
                  return (
                    <div key={idx} className="flex justify-between items-center text-xs">
                      <span className="text-slate-700 truncate font-medium">{p.name || `Pax ${idx + 1}`}</span>
                      <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 font-mono-code">
                        {assigned ? `${assigned.coachCode}-${assigned.seatNumber} (${assigned.berthType})` : `${selectedCoach}-Auto`}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1">
                <Lock className="w-3 h-3 text-emerald-600" />
                <span>256-bit TLS encrypted session</span>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

import React from 'react';
import { Link } from 'react-router-dom';
import TrainSearchCard from '../components/TrainSearchCard';
import { 
  Train, ShieldCheck, Zap, CreditCard, Sparkles, Clock, CheckCircle2, 
  MapPin, Award, Compass, Smartphone, RefreshCw, ChevronRight, Users, Eye
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-slate-950 via-slate-900 to-blue-950 text-white pt-12 pb-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
        
        {/* Decorative Indian Railways grid & glow effects */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute top-1/3 right-10 w-[400px] h-[250px] bg-orange-500/15 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          
          {/* Badge */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/80 border border-slate-700/80 text-xs font-semibold shadow-lg backdrop-blur-md">
              <span className="flex h-2 w-2 rounded-full bg-orange-500 animate-pulse"></span>
              <span className="text-orange-400 font-bold">RailEase 2.0</span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-200">The Modern Railway Reservation Experience</span>
            </div>
          </div>

          {/* Headline */}
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white font-heading leading-tight">
              Your Journey, <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500">Simplified.</span>
            </h1>
            <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
              Book Vande Bharat, Rajdhani, Shatabdi, and Superfast express trains in seconds. 
              Featuring interactive coach berth selection, collision-free seat reservation, and instant printable E-Tickets.
            </p>
          </div>

          {/* Embedded Train Search Widget */}
          <div className="max-w-5xl mx-auto">
            <TrainSearchCard />
          </div>

        </div>

      </section>

      {/* Floating Quick Stats Counter Bar */}
      <section className="-mt-14 relative z-30 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200/90 p-6 grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-4 border-r border-slate-100 last:border-0 pr-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
              <Train className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900 font-mono-code">12+</p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Express Trains</p>
            </div>
          </div>

          <div className="flex items-center gap-4 border-r border-slate-100 last:border-0 pr-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900 font-mono-code">10,000+</p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Demo Passengers</p>
            </div>
          </div>

          <div className="flex items-center gap-4 border-r border-slate-100 last:border-0 pr-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900 font-mono-code">99.8%</p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Booking Reliability</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900 font-mono-code">139</p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rail Madad 24x7</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Travel Experiences */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-orange-600 uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Premium Indian Train Fleets</span>
            </div>
            <h2 className="text-3xl font-black text-slate-900 font-heading">
              Ride India's Fastest & Most Iconic Trains
            </h2>
          </div>
          <Link
            to="/trains"
            className="mt-4 sm:mt-0 text-sm font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 group"
          >
            <span>View All Active Schedules</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Vande Bharat */}
          <div className="bg-white rounded-3xl p-6 shadow-md hover:shadow-xl border border-slate-200 transition-all group">
            <div className="h-44 rounded-2xl bg-gradient-to-tr from-slate-900 via-blue-950 to-orange-900 flex flex-col justify-between p-5 text-white mb-5 relative overflow-hidden">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-orange-500 text-white uppercase tracking-wider">
                  Semi-High Speed
                </span>
                <span className="text-xs font-bold bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-lg">
                  160 km/h
                </span>
              </div>
              <div>
                <h3 className="text-xl font-black font-heading">Vande Bharat Express</h3>
                <p className="text-xs text-orange-200">New Delhi ⇄ Varanasi Jn (22436)</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              State-of-the-art aerodynamic trainsets with 180° rotatable executive seats, onboard GPS infotainment, automatic plug doors, and bio-vacuum toilets.
            </p>
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <span className="text-sm font-black text-slate-900">From ₹1,750 (CC)</span>
              <Link
                to="/trains?from=NDLS&to=BSB"
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-blue-700 text-white text-xs font-bold transition-colors"
              >
                Book Now
              </Link>
            </div>
          </div>

          {/* Card 2: Tejas Rajdhani */}
          <div className="bg-white rounded-3xl p-6 shadow-md hover:shadow-xl border border-slate-200 transition-all group">
            <div className="h-44 rounded-2xl bg-gradient-to-tr from-red-950 via-slate-900 to-rose-900 flex flex-col justify-between p-5 text-white mb-5 relative overflow-hidden">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-red-600 text-white uppercase tracking-wider">
                  Superfast AC
                </span>
                <span className="text-xs font-bold bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-lg">
                  Overnight Sleeper
                </span>
              </div>
              <div>
                <h3 className="text-xl font-black font-heading">Mumbai Tejas Rajdhani</h3>
                <p className="text-xs text-red-200">New Delhi ⇄ Mumbai Central (12952)</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Smart sleeper coaches equipped with CCTV surveillance, passenger announcement systems, fire detection suppression, and premium catering.
            </p>
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <span className="text-sm font-black text-slate-900">From ₹2,280 (3A)</span>
              <Link
                to="/trains?from=NDLS&to=MMCT"
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-blue-700 text-white text-xs font-bold transition-colors"
              >
                Book Now
              </Link>
            </div>
          </div>

          {/* Card 3: Swarna Shatabdi */}
          <div className="bg-white rounded-3xl p-6 shadow-md hover:shadow-xl border border-slate-200 transition-all group">
            <div className="h-44 rounded-2xl bg-gradient-to-tr from-blue-950 via-slate-900 to-indigo-900 flex flex-col justify-between p-5 text-white mb-5 relative overflow-hidden">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-blue-600 text-white uppercase tracking-wider">
                  Day Express
                </span>
                <span className="text-xs font-bold bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-lg">
                  Same Day Return
                </span>
              </div>
              <div>
                <h3 className="text-xl font-black font-heading">Lucknow Swarna Shatabdi</h3>
                <p className="text-xs text-blue-200">New Delhi ⇄ Lucknow Charbagh (12004)</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Punctual intercity express with breakfast and snacks served at your seat, wide panoramic windows, and smooth air suspension.
            </p>
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <span className="text-sm font-black text-slate-900">From ₹1,165 (CC)</span>
              <Link
                to="/trains?from=NDLS&to=LKO"
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-blue-700 text-white text-xs font-bold transition-colors"
              >
                Book Now
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* How It Works Flow */}
      <section className="py-16 bg-slate-100/70 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-600 mb-2 block">
              Seamless 4-Step Process
            </span>
            <h2 className="text-3xl font-black text-slate-900 font-heading">
              How Booking Works on RailEase
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Designed from the ground up to eliminate tedious form errors and long queuing delays.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            
            {/* Step 1 */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 text-left relative">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-black text-lg mb-4 font-mono-code">
                01
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Search Trains</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Enter source, destination, journey date, and class. Our engine immediately filters real-time availability across Indian railway zones.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 text-left relative">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center font-black text-lg mb-4 font-mono-code">
                02
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Select Coach & Berth</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Experience our visual seat selector. Pick lower, middle, upper berths or window seats with guaranteed collision prevention.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 text-left relative">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-lg mb-4 font-mono-code">
                03
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Simulated Payment</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Complete a simulated checkout via UPI QR code, Debit/Credit Card, or NetBanking with zero real funds risked.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 text-left relative">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-lg mb-4 font-mono-code">
                04
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Instant E-Ticket & PNR</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Receive an authentic 10-digit PNR number and a print-ready digital E-Ticket with QR code, passenger chart, and fare receipt.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* RailEase vs Traditional Portal Comparison */}
      <section className="py-20 max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700 mb-1 block">
            Software Engineering Comparison
          </span>
          <h2 className="text-3xl font-black text-slate-900 font-heading">
            Why RailEase Outperforms Legacy Systems
          </h2>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900 text-white text-xs uppercase tracking-wider">
              <tr>
                <th className="py-4 px-6">Feature</th>
                <th className="py-4 px-6 text-orange-400 font-bold">RailEase Modern Platform</th>
                <th className="py-4 px-6 text-slate-400">Legacy Railway Portals</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              <tr className="hover:bg-slate-50">
                <td className="py-4 px-6 font-bold text-slate-800">Visual Seat & Berth Selection</td>
                <td className="py-4 px-6 text-emerald-700 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Interactive coach map with occupied highlights
                </td>
                <td className="py-4 px-6 text-slate-500">Only text dropdown preference (no visual preview)</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-4 px-6 font-bold text-slate-800">Seat Collision Prevention</td>
                <td className="py-4 px-6 text-emerald-700 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Database ACID transaction locking
                </td>
                <td className="py-4 px-6 text-slate-500">Frequent concurrency timeouts during peak hours</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-4 px-6 font-bold text-slate-800">User Interface & Latency</td>
                <td className="py-4 px-6 text-emerald-700 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Sub-100ms Vite React SPA + Tailwind
                </td>
                <td className="py-4 px-6 text-slate-500">Heavy page reloads with repetitive CAPTCHA steps</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-4 px-6 font-bold text-slate-800">Instant Cancellation & Seat Restoration</td>
                <td className="py-4 px-6 text-emerald-700 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Automatic refund estimate & instant berth recovery
                </td>
                <td className="py-4 px-6 text-slate-500">Multi-day manual clerkage reconciliation</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-4 px-6 font-bold text-slate-800">Role-Based Admin Oversight</td>
                <td className="py-4 px-6 text-emerald-700 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Dedicated Admin Dashboard with analytics & schedule control
                </td>
                <td className="py-4 px-6 text-slate-500">Separate internal terminal systems</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="py-16 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-950 text-white text-center px-4">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/40 text-xs font-bold">
            <Award className="w-4 h-4" /> Ready for Live Evaluation
          </div>
          <h2 className="text-3xl sm:text-4xl font-black font-heading">
            Experience Indian Railway Reservation Done Right.
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Test the entire end-to-end booking flow: search trains, customize berths, simulate payment, retrieve live PNR status, and review the administrative operations.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              to="/trains"
              className="px-8 py-3.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm shadow-xl shadow-orange-600/30 transition-all hover:scale-105"
            >
              Start Ticket Booking
            </Link>
            <Link
              to="/pnr-status"
              className="px-8 py-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-white font-bold text-sm border border-slate-700 transition-all"
            >
              Track Sample PNR
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}

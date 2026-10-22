import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  ShieldCheck, LayoutDashboard, Train, Ticket, Users, Activity, 
  Plus, Trash2, Search, RefreshCw, AlertCircle, ArrowUpRight, CheckCircle2, 
  DollarSign, TrendingUp, Calendar, Clock, BarChart3, PieChart, X, ShieldAlert 
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [activeSection, setActiveSection] = useState('overview'); // 'overview', 'trains', 'bookings', 'users', 'logs'
  const [overviewData, setOverviewData] = useState(null);
  const [trainsList, setTrainsList] = useState([]);
  const [bookingsList, setBookingsList] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter in Tables
  const [searchQuery, setSearchQuery] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('ALL');

  // Add Train Modal State
  const [showAddTrainModal, setShowAddTrainModal] = useState(false);
  const [newTrainNumber, setNewTrainNumber] = useState('');
  const [newTrainName, setNewTrainName] = useState('');
  const [newTrainType, setNewTrainType] = useState('Superfast');
  const [newSourceCode, setNewSourceCode] = useState('NDLS');
  const [newSourceName, setNewSourceName] = useState('New Delhi');
  const [newDestCode, setNewDestCode] = useState('JP');
  const [newDestName, setNewDestName] = useState('Jaipur Jn');
  const [newDepTime, setNewDepTime] = useState('06:30');
  const [newArrTime, setNewArrTime] = useState('11:45');
  const [newDuration, setNewDuration] = useState('5h 15m');
  const [newDistance, setNewDistance] = useState('310');

  // Check Admin Authorization
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        showToast('Administrative login required', 'error');
        navigate('/login');
      } else if (!isAdmin) {
        showToast('Unauthorized: Administrator role required', 'error');
        navigate('/');
      }
    }
  }, [user, isAdmin, authLoading]);

  // Load Section Data
  const loadData = async () => {
    if (!isAdmin) return;
    setLoading(true);
    try {
      if (activeSection === 'overview') {
        const data = await api.getAdminOverview();
        setOverviewData(data);
      } else if (activeSection === 'trains') {
        const data = await api.getAdminTrains();
        setTrainsList(data.trains || []);
      } else if (activeSection === 'bookings') {
        const data = await api.getAdminBookings({
          search: searchQuery,
          status: bookingStatusFilter
        });
        setBookingsList(data.bookings || []);
      } else if (activeSection === 'users') {
        const data = await api.getAdminUsers();
        setUsersList(data.users || []);
      }
    } catch (err) {
      showToast(err.message || 'Failed to load administrative records', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeSection, bookingStatusFilter]);

  const handleSearchBookings = (e) => {
    e.preventDefault();
    loadData();
  };

  // Add Train Handler
  const handleAddTrain = async (e) => {
    e.preventDefault();
    try {
      await api.addAdminTrain({
        number: newTrainNumber,
        name: newTrainName,
        type: newTrainType,
        source_code: newSourceCode,
        source_name: newSourceName,
        dest_code: newDestCode,
        dest_name: newDestName,
        departure_time: newDepTime,
        arrival_time: newArrTime,
        duration: newDuration,
        distance_km: parseInt(newDistance, 10) || 400
      });

      showToast(`Train ${newTrainNumber} (${newTrainName}) added successfully!`, 'success');
      setShowAddTrainModal(false);
      // Reset form
      setNewTrainNumber('');
      setNewTrainName('');
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed to add train', 'error');
    }
  };

  // Delete Train Handler
  const handleDeleteTrain = async (trainId, trainNumber) => {
    if (!window.confirm(`Are you sure you want to delete Train #${trainNumber}?`)) return;
    try {
      await api.deleteAdminTrain(trainId);
      showToast(`Train #${trainNumber} removed from service`, 'success');
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed to delete train', 'error');
    }
  };

  if (authLoading || (!isAdmin && user)) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-white">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-orange-400" />
          <p className="text-xs font-semibold">Verifying administrative security token...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 p-6 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          
          {/* Logo & Badge */}
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-orange-500 text-white flex items-center justify-center font-black">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-lg font-black text-white font-heading">
                  Rail<span className="text-orange-500">Ease</span> Admin
                </span>
                <p className="text-[10px] text-orange-400 font-bold uppercase tracking-widest">
                  Control Centre
                </p>
              </div>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1.5 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveSection('overview')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all text-left cursor-pointer ${
                activeSection === 'overview'
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Operations Overview</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('trains')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all text-left cursor-pointer ${
                activeSection === 'trains'
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Train className="w-4 h-4" />
              <span>Train & Schedule Manager</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('bookings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all text-left cursor-pointer ${
                activeSection === 'bookings'
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Ticket className="w-4 h-4" />
              <span>All Passenger Bookings</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('users')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all text-left cursor-pointer ${
                activeSection === 'users'
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Registered Accounts</span>
            </button>
          </nav>
        </div>

        {/* Admin User Footer */}
        <div className="pt-6 border-t border-slate-800 text-xs">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-orange-400">
              A
            </div>
            <div className="truncate">
              <strong className="block text-slate-200 truncate">{user?.name}</strong>
              <span className="text-[10px] text-slate-500 truncate">{user?.email}</span>
            </div>
          </div>
          <Link
            to="/"
            className="block text-center py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition-colors"
          >
            ← Back to Public Portal
          </Link>
        </div>
      </aside>

      {/* Main Content Workspace */}
      <main className="flex-1 p-6 sm:p-10 overflow-y-auto space-y-8">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <h1 className="text-2xl font-black font-heading text-white capitalize">
              {activeSection === 'overview' && 'System Analytics & Performance'}
              {activeSection === 'trains' && 'Indian Railways Fleet Management'}
              {activeSection === 'bookings' && 'Live Reservations & Passenger Database'}
              {activeSection === 'users' && 'User Directory & Authentication Roles'}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Active Session: Admin Controller • Local Database: SQLite WAL High Performance
            </p>
          </div>

          <div className="flex items-center gap-3">
            {activeSection === 'trains' && (
              <button
                type="button"
                onClick={() => setShowAddTrainModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Express Train</span>
              </button>
            )}

            <button
              onClick={loadData}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Refresh dataset"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* SECTION 1: OVERVIEW & CHARTS */}
        {activeSection === 'overview' && overviewData && (
          <div className="space-y-8">
            
            {/* Stat Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Total Bookings
                </span>
                <p className="text-3xl font-black text-white font-mono-code">
                  {overviewData.stats.totalBookings}
                </p>
                <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {overviewData.stats.confirmedBookings} Confirmed
                </span>
              </div>

              <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Simulated Revenue
                </span>
                <p className="text-3xl font-black text-emerald-400 font-mono-code">
                  ₹{overviewData.stats.totalRevenue?.toLocaleString()}
                </p>
                <span className="text-[11px] text-slate-400">Net of simulated refunds</span>
              </div>

              <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Active Express Trains
                </span>
                <p className="text-3xl font-black text-orange-400 font-mono-code">
                  {overviewData.stats.totalTrains}
                </p>
                <span className="text-[11px] text-slate-400">Vande Bharat, Rajdhani, Shatabdi</span>
              </div>

              <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Cancellations
                </span>
                <p className="text-3xl font-black text-red-400 font-mono-code">
                  {overviewData.stats.cancelledBookings}
                </p>
                <span className="text-[11px] text-slate-400">Seats returned to pool</span>
              </div>
            </div>

            {/* Visual Charts: Class Breakdown & Popular Routes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Class Booking Distribution Chart */}
              <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-orange-400" />
                    <span>Booking Volume by Class</span>
                  </h3>
                  <span className="text-xs text-slate-500">Live Breakdown</span>
                </div>

                <div className="space-y-3 pt-2">
                  {overviewData.charts.classStats.map(stat => {
                    const pct = Math.min(100, Math.round((stat.count / (overviewData.stats.totalBookings || 1)) * 100));
                    return (
                      <div key={stat.class_code} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-200">{stat.class_code} Class</span>
                          <span className="text-slate-400 font-mono-code">{stat.count} bookings ({pct}%)</span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-600 to-orange-500 rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Popular Routes */}
              <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <span>High-Demand Railway Corridors</span>
                  </h3>
                  <span className="text-xs text-slate-500">Top Routes</span>
                </div>

                <div className="space-y-2 pt-2">
                  {overviewData.charts.routeStats.map((r, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/60 border border-slate-800 text-xs font-semibold">
                      <span className="text-slate-200">{r.route}</span>
                      <span className="text-emerald-400 font-mono-code font-bold bg-slate-900 px-2.5 py-1 rounded-md">
                        {r.count} Bookings
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Recent Audit Trail Logs */}
            <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-400" />
                <span>System Security & Operational Audit Log</span>
              </h3>

              <div className="divide-y divide-slate-800 text-xs">
                {overviewData.auditLogs.map(log => (
                  <div key={log.id} className="py-2.5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 rounded font-mono-code text-[10px] font-bold bg-slate-800 text-orange-400 border border-slate-700">
                        {log.action}
                      </span>
                      <span className="text-slate-300">{log.details}</span>
                    </div>
                    <span className="text-slate-500 font-mono-code text-[11px] shrink-0">
                      {log.created_at}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* SECTION 2: TRAINS MANAGEMENT */}
        {activeSection === 'trains' && (
          <div className="space-y-6">
            <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-800/80 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-4 px-6">Train No. & Name</th>
                      <th className="py-4 px-6">Type</th>
                      <th className="py-4 px-6">Source → Dest</th>
                      <th className="py-4 px-6">Dep / Arr</th>
                      <th className="py-4 px-6">Coaches</th>
                      <th className="py-4 px-6 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-medium">
                    {trainsList.map(t => (
                      <tr key={t.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-4 px-6 font-bold text-white">
                          <span className="font-mono-code text-orange-400 mr-2">#{t.number}</span>
                          {t.name}
                        </td>
                        <td className="py-4 px-6">
                          <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-200 border border-slate-700 text-[10px] font-bold">
                            {t.type}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-slate-300">
                          {t.source_code} → {t.dest_code} ({t.distance_km} km)
                        </td>
                        <td className="py-4 px-6 font-mono-code text-slate-300">
                          {t.departure_time} - {t.arrival_time}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex gap-1">
                            {t.coaches?.map(c => (
                              <span key={c.id} className="px-1.5 py-0.5 rounded bg-blue-900/50 text-blue-300 font-mono-code text-[10px]">
                                {c.coach_code}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <button
                            type="button"
                            onClick={() => handleDeleteTrain(t.id, t.number)}
                            className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer"
                            title="Remove train"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 3: BOOKINGS MANAGEMENT */}
        {activeSection === 'bookings' && (
          <div className="space-y-6">
            
            {/* Filter & Search Bar */}
            <div className="bg-slate-900 p-4 rounded-3xl border border-slate-800 flex flex-col sm:flex-row gap-3 justify-between items-center">
              <form onSubmit={handleSearchBookings} className="flex gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Search by PNR, Train, Email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-slate-800 text-white text-xs rounded-xl border border-slate-700 px-4 py-2 font-mono-code focus:outline-none focus:ring-2 focus:ring-orange-500 w-64"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-orange-500 text-white font-bold text-xs"
                >
                  Search
                </button>
              </form>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400 font-bold">Status:</span>
                <select
                  value={bookingStatusFilter}
                  onChange={(e) => setBookingStatusFilter(e.target.value)}
                  className="bg-slate-800 text-white text-xs rounded-xl border border-slate-700 px-3 py-2 cursor-pointer"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>
            </div>

            {/* Bookings Table */}
            <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-800/80 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-4 px-6">PNR</th>
                      <th className="py-4 px-6">Train</th>
                      <th className="py-4 px-6">Route & Date</th>
                      <th className="py-4 px-6">Passengers</th>
                      <th className="py-4 px-6">Fare</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6">Customer</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-medium">
                    {bookingsList.map(b => (
                      <tr key={b.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-4 px-6 font-mono-code font-bold text-orange-400">
                          {b.pnr}
                        </td>
                        <td className="py-4 px-6 font-bold text-white">
                          #{b.train_number} — {b.train_name}
                        </td>
                        <td className="py-4 px-6 text-slate-300">
                          {b.source_code} → {b.dest_code} • {b.journey_date}
                        </td>
                        <td className="py-4 px-6 font-mono-code text-slate-300">
                          {b.total_passengers} Pax ({b.class_code})
                        </td>
                        <td className="py-4 px-6 font-mono-code font-black text-emerald-400">
                          ₹{b.total_fare?.toFixed(2)}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            b.status === 'CONFIRMED'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : 'bg-red-950 text-red-400 border border-red-800'
                          }`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-slate-400 text-[11px]">
                          {b.contact_email}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* SECTION 4: USERS MANAGEMENT */}
        {activeSection === 'users' && (
          <div className="space-y-6">
            <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-800/80 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-4 px-6">User ID</th>
                      <th className="py-4 px-6">Full Name</th>
                      <th className="py-4 px-6">Email Address</th>
                      <th className="py-4 px-6">Phone</th>
                      <th className="py-4 px-6">Role</th>
                      <th className="py-4 px-6">Total Bookings</th>
                      <th className="py-4 px-6">Registered On</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-medium">
                    {usersList.map(u => (
                      <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-4 px-6 font-mono-code text-slate-400">#{u.id}</td>
                        <td className="py-4 px-6 font-bold text-white">{u.name}</td>
                        <td className="py-4 px-6 text-slate-300">{u.email}</td>
                        <td className="py-4 px-6 font-mono-code text-slate-400">{u.phone || '—'}</td>
                        <td className="py-4 px-6">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            u.role === 'admin'
                              ? 'bg-orange-950 text-orange-400 border border-orange-800'
                              : 'bg-blue-950 text-blue-400 border border-blue-800'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-4 px-6 font-mono-code font-bold text-slate-200">
                          {u.bookings_count}
                        </td>
                        <td className="py-4 px-6 text-slate-500 font-mono-code text-[11px]">
                          {u.created_at}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Add Train Modal */}
      {showAddTrainModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div 
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full text-white shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Train className="w-5 h-5 text-orange-400" />
                <span>Add Express Train to Railway Roster</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddTrainModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTrain} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Train Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 12958"
                    value={newTrainNumber}
                    onChange={(e) => setNewTrainNumber(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 font-mono-code text-white focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Train Type</label>
                  <select
                    value={newTrainType}
                    onChange={(e) => setNewTrainType(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white cursor-pointer"
                  >
                    <option value="Vande Bharat">Vande Bharat</option>
                    <option value="Rajdhani">Rajdhani Express</option>
                    <option value="Shatabdi">Shatabdi Express</option>
                    <option value="Superfast">Superfast Express</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Train Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Swarna Jayanti Rajdhani"
                  value={newTrainName}
                  onChange={(e) => setNewTrainName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Source Code</label>
                  <input
                    type="text"
                    required
                    placeholder="NDLS"
                    value={newSourceCode}
                    onChange={(e) => setNewSourceCode(e.target.value.toUpperCase())}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 font-mono-code text-white uppercase"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Destination Code</label>
                  <input
                    type="text"
                    required
                    placeholder="JP"
                    value={newDestCode}
                    onChange={(e) => setNewDestCode(e.target.value.toUpperCase())}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 font-mono-code text-white uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Departure</label>
                  <input
                    type="text"
                    value={newDepTime}
                    onChange={(e) => setNewDepTime(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 font-mono-code text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Arrival</label>
                  <input
                    type="text"
                    value={newArrTime}
                    onChange={(e) => setNewArrTime(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 font-mono-code text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Distance (km)</label>
                  <input
                    type="number"
                    value={newDistance}
                    onChange={(e) => setNewDistance(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 font-mono-code text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddTrainModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold"
                >
                  Create Train
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

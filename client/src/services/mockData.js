// Built-in offline fallback data for RailEase
// Ensures the Netlify deployment works seamlessly even without a running backend!

export const MOCK_STATIONS = [
  { code: 'NDLS', name: 'New Delhi', city: 'New Delhi', state: 'Delhi', zone: 'NR' },
  { code: 'MMCT', name: 'Mumbai Central', city: 'Mumbai', state: 'Maharashtra', zone: 'WR' },
  { code: 'HWH', name: 'Howrah Junction', city: 'Kolkata', state: 'West Bengal', zone: 'ER' },
  { code: 'MAS', name: 'Chennai Central', city: 'Chennai', state: 'Tamil Nadu', zone: 'SR' },
  { code: 'SBC', name: 'KSR Bengaluru City', city: 'Bengaluru', state: 'Karnataka', zone: 'SWR' },
  { code: 'LKO', name: 'Lucknow Charbagh', city: 'Lucknow', state: 'Uttar Pradesh', zone: 'NR' },
  { code: 'CNB', name: 'Kanpur Central', city: 'Kanpur', state: 'Uttar Pradesh', zone: 'NCR' },
  { code: 'BSB', name: 'Varanasi Junction', city: 'Varanasi', state: 'Uttar Pradesh', zone: 'NER' },
  { code: 'JP', name: 'Jaipur Junction', city: 'Jaipur', state: 'Rajasthan', zone: 'NWR' },
  { code: 'ADI', name: 'Ahmedabad Junction', city: 'Ahmedabad', state: 'Gujarat', zone: 'WR' },
  { code: 'GKP', name: 'Gorakhpur Junction', city: 'Gorakhpur', state: 'Uttar Pradesh', zone: 'NER' },
  { code: 'PNBE', name: 'Patna Junction', city: 'Patna', state: 'Bihar', zone: 'ECR' },
  { code: 'PUNE', name: 'Pune Junction', city: 'Pune', state: 'Maharashtra', zone: 'CR' },
  { code: 'CSMT', name: 'Mumbai CSMT', city: 'Mumbai', state: 'Maharashtra', zone: 'CR' },
  { code: 'SVDK', name: 'Shri Mata Vaishno Devi Katra', city: 'Katra', state: 'Jammu and Kashmir', zone: 'NR' }
];

export const MOCK_TRAINS = [
  {
    id: 1,
    number: '22436',
    name: 'Vande Bharat Express',
    type: 'Vande Bharat',
    source_code: 'NDLS',
    source_name: 'New Delhi',
    dest_code: 'BSB',
    dest_name: 'Varanasi Junction',
    departure_time: '06:00',
    arrival_time: '14:00',
    duration: '8h 00m',
    days_of_run: 'Sun,Tue,Wed,Fri,Sat',
    distance_km: 759,
    pantry_available: 1,
    rating: 4.9,
    classes: [
      { class_code: 'CC', class_name: 'AC Chair Car', base_fare: 1750, total_seats: 104, available_seats: 42, status: 'AVAILABLE' },
      { class_code: 'EC', class_name: 'Exec. Chair Car', base_fare: 3300, total_seats: 32, available_seats: 8, status: 'AVAILABLE' }
    ],
    coaches: [
      { class_code: 'CC', class_name: 'AC Chair Car', coach_code: 'C1', total_seats: 52, base_fare: 1750 },
      { class_code: 'CC', class_name: 'AC Chair Car', coach_code: 'C2', total_seats: 52, base_fare: 1750 },
      { class_code: 'EC', class_name: 'Exec. Chair Car', coach_code: 'E1', total_seats: 32, base_fare: 3300 }
    ],
    routes: [
      { station_code: 'NDLS', station_name: 'New Delhi', stop_number: 1, arrival_time: '05:40', departure_time: '06:00', halt_mins: 20, distance_km: 0, platform: '1' },
      { station_code: 'CNB', station_name: 'Kanpur Central', stop_number: 2, arrival_time: '10:08', departure_time: '10:10', halt_mins: 2, distance_km: 440, platform: '5' },
      { station_code: 'BSB', station_name: 'Varanasi Junction', stop_number: 3, arrival_time: '14:00', departure_time: 'Terminates', halt_mins: 0, distance_km: 759, platform: '1' }
    ]
  },
  {
    id: 2,
    number: '12952',
    name: 'Mumbai Tejas Rajdhani Express',
    type: 'Rajdhani',
    source_code: 'NDLS',
    source_name: 'New Delhi',
    dest_code: 'MMCT',
    dest_name: 'Mumbai Central',
    departure_time: '16:55',
    arrival_time: '08:35',
    duration: '15h 40m',
    days_of_run: 'Daily',
    distance_km: 1386,
    pantry_available: 1,
    rating: 4.8,
    classes: [
      { class_code: '3A', class_name: 'AC 3 Tier', base_fare: 2280, total_seats: 128, available_seats: 35, status: 'AVAILABLE' },
      { class_code: '2A', class_name: 'AC 2 Tier', base_fare: 3250, total_seats: 48, available_seats: 12, status: 'AVAILABLE' },
      { class_code: '1A', class_name: 'AC 1st Class', base_fare: 4950, total_seats: 24, available_seats: 4, status: 'AVAILABLE' }
    ],
    coaches: [
      { class_code: '3A', class_name: 'AC 3 Tier', coach_code: 'B1', total_seats: 64, base_fare: 2280 },
      { class_code: '3A', class_name: 'AC 3 Tier', coach_code: 'B2', total_seats: 64, base_fare: 2280 },
      { class_code: '2A', class_name: 'AC 2 Tier', coach_code: 'A1', total_seats: 48, base_fare: 3250 },
      { class_code: '1A', class_name: 'AC 1st Class', coach_code: 'H1', total_seats: 24, base_fare: 4950 }
    ],
    routes: [
      { station_code: 'NDLS', station_name: 'New Delhi', stop_number: 1, arrival_time: '16:30', departure_time: '16:55', halt_mins: 25, distance_km: 0, platform: '3' },
      { station_code: 'ADI', station_name: 'Ahmedabad Jn (Pass)', stop_number: 2, arrival_time: '03:10', departure_time: '03:20', halt_mins: 10, distance_km: 934, platform: '2' },
      { station_code: 'MMCT', station_name: 'Mumbai Central', stop_number: 3, arrival_time: '08:35', departure_time: 'Terminates', halt_mins: 0, distance_km: 1386, platform: '1' }
    ]
  },
  {
    id: 3,
    number: '12004',
    name: 'Lucknow Swarna Shatabdi',
    type: 'Shatabdi',
    source_code: 'NDLS',
    source_name: 'New Delhi',
    dest_code: 'LKO',
    dest_name: 'Lucknow Charbagh',
    departure_time: '06:10',
    arrival_time: '12:40',
    duration: '6h 30m',
    days_of_run: 'Daily',
    distance_km: 512,
    pantry_available: 1,
    rating: 4.7,
    classes: [
      { class_code: 'CC', class_name: 'AC Chair Car', base_fare: 1165, total_seats: 100, available_seats: 24, status: 'AVAILABLE' },
      { class_code: 'EC', class_name: 'Exec. Chair Car', base_fare: 2125, total_seats: 30, available_seats: 6, status: 'AVAILABLE' }
    ],
    coaches: [
      { class_code: 'CC', class_name: 'AC Chair Car', coach_code: 'C1', total_seats: 50, base_fare: 1165 },
      { class_code: 'CC', class_name: 'AC Chair Car', coach_code: 'C2', total_seats: 50, base_fare: 1165 },
      { class_code: 'EC', class_name: 'Exec. Chair Car', coach_code: 'E1', total_seats: 30, base_fare: 2125 }
    ],
    routes: [
      { station_code: 'NDLS', station_name: 'New Delhi', stop_number: 1, arrival_time: '05:50', departure_time: '06:10', halt_mins: 20, distance_km: 0, platform: '6' },
      { station_code: 'CNB', station_name: 'Kanpur Central', stop_number: 2, arrival_time: '11:20', departure_time: '11:25', halt_mins: 5, distance_km: 440, platform: '4' },
      { station_code: 'LKO', station_name: 'Lucknow Charbagh', stop_number: 3, arrival_time: '12:40', departure_time: 'Terminates', halt_mins: 0, distance_km: 512, platform: '2' }
    ]
  },
  {
    id: 4,
    number: '12302',
    name: 'Howrah Rajdhani Express',
    type: 'Rajdhani',
    source_code: 'NDLS',
    source_name: 'New Delhi',
    dest_code: 'HWH',
    dest_name: 'Howrah Jn',
    departure_time: '16:50',
    arrival_time: '09:55',
    duration: '17h 05m',
    days_of_run: 'Sun,Mon,Tue,Wed,Thu,Sat',
    distance_km: 1451,
    pantry_available: 1,
    rating: 4.8,
    classes: [
      { class_code: '3A', class_name: 'AC 3 Tier', base_fare: 2420, total_seats: 64, available_seats: 40, status: 'AVAILABLE' },
      { class_code: '2A', class_name: 'AC 2 Tier', base_fare: 3480, total_seats: 48, available_seats: 14, status: 'AVAILABLE' },
      { class_code: '1A', class_name: 'AC 1st Class', base_fare: 5350, total_seats: 24, available_seats: 5, status: 'AVAILABLE' }
    ],
    coaches: [
      { class_code: '3A', class_name: 'AC 3 Tier', coach_code: 'B1', total_seats: 64, base_fare: 2420 },
      { class_code: '2A', class_name: 'AC 2 Tier', coach_code: 'A1', total_seats: 48, base_fare: 3480 },
      { class_code: '1A', class_name: 'AC 1st Class', coach_code: 'H1', total_seats: 24, base_fare: 5350 }
    ],
    routes: [
      { station_code: 'NDLS', station_name: 'New Delhi', stop_number: 1, arrival_time: '16:20', departure_time: '16:50', halt_mins: 30, distance_km: 0, platform: '4' },
      { station_code: 'CNB', station_name: 'Kanpur Central', stop_number: 2, arrival_time: '21:32', departure_time: '21:37', halt_mins: 5, distance_km: 440, platform: '1' },
      { station_code: 'BSB', station_name: 'Pt DD Upadhyaya (Varanasi)', stop_number: 3, arrival_time: '01:42', departure_time: '01:52', halt_mins: 10, distance_km: 785, platform: '2' },
      { station_code: 'HWH', station_name: 'Howrah Jn', stop_number: 4, arrival_time: '09:55', departure_time: 'Terminates', halt_mins: 0, distance_km: 1451, platform: '9' }
    ]
  },
  {
    id: 5,
    number: '12414',
    name: 'Pooja Superfast Express',
    type: 'Superfast',
    source_code: 'NDLS',
    source_name: 'New Delhi',
    dest_code: 'JP',
    dest_name: 'Jaipur Jn',
    departure_time: '21:50',
    arrival_time: '04:30',
    duration: '6h 40m',
    days_of_run: 'Daily',
    distance_km: 310,
    pantry_available: 0,
    rating: 4.6,
    classes: [
      { class_code: 'SL', class_name: 'Sleeper Class', base_fare: 245, total_seats: 72, available_seats: 55, status: 'AVAILABLE' },
      { class_code: '3A', class_name: 'AC 3 Tier', base_fare: 680, total_seats: 64, available_seats: 20, status: 'AVAILABLE' },
      { class_code: '2A', class_name: 'AC 2 Tier', base_fare: 990, total_seats: 48, available_seats: 10, status: 'AVAILABLE' }
    ],
    coaches: [
      { class_code: 'SL', class_name: 'Sleeper Class', coach_code: 'S1', total_seats: 72, base_fare: 245 },
      { class_code: '3A', class_name: 'AC 3 Tier', coach_code: 'B1', total_seats: 64, base_fare: 680 },
      { class_code: '2A', class_name: 'AC 2 Tier', coach_code: 'A1', total_seats: 48, base_fare: 990 }
    ],
    routes: [
      { station_code: 'NDLS', station_name: 'New Delhi', stop_number: 1, arrival_time: '21:30', departure_time: '21:50', halt_mins: 20, distance_km: 0, platform: '10' },
      { station_code: 'JP', station_name: 'Jaipur Jn', stop_number: 2, arrival_time: '04:30', departure_time: 'Terminates', halt_mins: 0, distance_km: 310, platform: '3' }
    ]
  }
];

export const INITIAL_MOCK_BOOKINGS = [
  {
    id: 101,
    pnr: '2418937210',
    train_id: 1,
    train_number: '22436',
    train_name: 'Vande Bharat Express',
    train_type: 'Vande Bharat',
    source_code: 'NDLS',
    source_name: 'New Delhi',
    dest_code: 'BSB',
    dest_name: 'Varanasi Junction',
    departure_time: '06:00',
    arrival_time: '14:00',
    duration: '8h 00m',
    journey_date: '2026-11-15',
    class_code: 'CC',
    quota: 'General',
    total_fare: 1875.00,
    status: 'CONFIRMED',
    payment_status: 'PAID',
    payment_mode: 'UPI',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    passengers: [
      { id: 1, name: 'Aarav Sharma', age: 29, gender: 'M', berth_preference: 'Window', seat_number: 14, coach_code: 'C1', status: 'CNF' }
    ]
  },
  {
    id: 102,
    pnr: '4529183401',
    train_id: 2,
    train_number: '12952',
    train_name: 'Mumbai Tejas Rajdhani Express',
    train_type: 'Rajdhani',
    source_code: 'NDLS',
    source_name: 'New Delhi',
    dest_code: 'MMCT',
    dest_name: 'Mumbai Central',
    departure_time: '16:55',
    arrival_time: '08:35',
    duration: '15h 40m',
    journey_date: '2026-11-20',
    class_code: '3A',
    quota: 'General',
    total_fare: 2470.00,
    status: 'CONFIRMED',
    payment_status: 'PAID',
    payment_mode: 'NetBanking',
    created_at: new Date(Date.now() - 172800000).toISOString(),
    passengers: [
      { id: 2, name: 'Priya Verma', age: 26, gender: 'F', berth_preference: 'Lower', seat_number: 21, coach_code: 'B1', status: 'CNF' }
    ]
  },
  {
    id: 103,
    pnr: '8923410592',
    train_id: 3,
    train_number: '12004',
    train_name: 'Lucknow Swarna Shatabdi',
    train_type: 'Shatabdi',
    source_code: 'NDLS',
    source_name: 'New Delhi',
    dest_code: 'LKO',
    dest_name: 'Lucknow Charbagh',
    departure_time: '06:10',
    arrival_time: '12:40',
    duration: '6h 30m',
    journey_date: '2026-10-10',
    class_code: 'CC',
    quota: 'General',
    total_fare: 1250.00,
    status: 'CANCELLED',
    payment_status: 'REFUNDED',
    payment_mode: 'UPI',
    created_at: new Date(Date.now() - 864000000).toISOString(),
    passengers: [
      { id: 3, name: 'Rohan Gupta', age: 34, gender: 'M', berth_preference: 'Aisle', seat_number: 32, coach_code: 'C1', status: 'CAN' }
    ]
  }
];

export function generateMockLayout(coachCode, totalSeats = 64) {
  const berths = ['Lower', 'Middle', 'Upper', 'Side Lower', 'Side Upper'];
  const seats = [];
  const bookedSeatNumbers = [3, 7, 12, 18, 22, 29, 35, 41];

  for (let i = 1; i <= totalSeats; i++) {
    const isBooked = bookedSeatNumbers.includes(i);
    seats.push({
      seat_number: i,
      berth_type: berths[(i - 1) % berths.length],
      is_booked: isBooked,
      gender_pref: isBooked ? (i % 2 === 0 ? 'F' : 'M') : null
    });
  }

  return {
    coach_code: coachCode || 'B1',
    class_code: coachCode?.startsWith('C') ? 'CC' : (coachCode?.startsWith('E') ? 'EC' : (coachCode?.startsWith('S') ? 'SL' : '3A')),
    total_seats: totalSeats,
    available_count: totalSeats - bookedSeatNumbers.length,
    seats
  };
}

const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'railease.db');
const db = new Database(dbPath);

// Enable WAL mode and foreign keys for high performance and integrity
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS stations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      zone TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS trains (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      number TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL, -- Vande Bharat, Rajdhani, Shatabdi, Superfast, Express
      source_code TEXT NOT NULL,
      source_name TEXT NOT NULL,
      dest_code TEXT NOT NULL,
      dest_name TEXT NOT NULL,
      departure_time TEXT NOT NULL, -- HH:MM
      arrival_time TEXT NOT NULL,   -- HH:MM
      duration TEXT NOT NULL,       -- e.g. "8h 00m"
      days_of_run TEXT NOT NULL,    -- "Mon,Tue,Wed,Thu,Fri,Sat,Sun"
      distance_km INTEGER NOT NULL,
      pantry_available INTEGER DEFAULT 1,
      rating REAL DEFAULT 4.6,
      FOREIGN KEY (source_code) REFERENCES stations(code),
      FOREIGN KEY (dest_code) REFERENCES stations(code)
    );

    CREATE TABLE IF NOT EXISTS train_routes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      train_id INTEGER NOT NULL,
      station_code TEXT NOT NULL,
      station_name TEXT NOT NULL,
      stop_number INTEGER NOT NULL,
      arrival_time TEXT NOT NULL,
      departure_time TEXT NOT NULL,
      halt_mins INTEGER NOT NULL,
      distance_km INTEGER NOT NULL,
      platform TEXT DEFAULT '1',
      FOREIGN KEY (train_id) REFERENCES trains(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS train_coaches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      train_id INTEGER NOT NULL,
      class_code TEXT NOT NULL, -- 1A, 2A, 3A, SL, CC, EC, 2S
      class_name TEXT NOT NULL,
      coach_code TEXT NOT NULL, -- B1, B2, A1, C1, etc.
      total_seats INTEGER NOT NULL,
      base_fare REAL NOT NULL,
      FOREIGN KEY (train_id) REFERENCES trains(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS seats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      train_id INTEGER NOT NULL,
      coach_code TEXT NOT NULL,
      class_code TEXT NOT NULL,
      seat_number INTEGER NOT NULL,
      berth_type TEXT NOT NULL, -- Lower, Middle, Upper, Side Lower, Side Upper, Window, Aisle
      UNIQUE(train_id, coach_code, seat_number),
      FOREIGN KEY (train_id) REFERENCES trains(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pnr TEXT UNIQUE NOT NULL,
      user_id INTEGER,
      train_id INTEGER NOT NULL,
      train_number TEXT NOT NULL,
      train_name TEXT NOT NULL,
      source_code TEXT NOT NULL,
      source_name TEXT NOT NULL,
      dest_code TEXT NOT NULL,
      dest_name TEXT NOT NULL,
      journey_date TEXT NOT NULL,
      class_code TEXT NOT NULL,
      quota TEXT DEFAULT 'General',
      total_passengers INTEGER NOT NULL,
      base_fare REAL NOT NULL,
      reservation_charge REAL DEFAULT 40,
      superfast_charge REAL DEFAULT 45,
      gst REAL DEFAULT 0,
      total_fare REAL NOT NULL,
      status TEXT DEFAULT 'CONFIRMED', -- CONFIRMED, CANCELLED, RAC, WL
      payment_method TEXT NOT NULL,    -- UPI, Card, NetBanking
      payment_ref TEXT NOT NULL,
      contact_email TEXT NOT NULL,
      contact_phone TEXT NOT NULL,
      booked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      cancelled_at DATETIME,
      refund_amount REAL DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (train_id) REFERENCES trains(id)
    );

    CREATE TABLE IF NOT EXISTS passengers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      age INTEGER NOT NULL,
      gender TEXT NOT NULL,
      berth_preference TEXT,
      coach_code TEXT NOT NULL,
      seat_number INTEGER NOT NULL,
      berth_type TEXT NOT NULL,
      status TEXT DEFAULT 'CNF',
      FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_id INTEGER NOT NULL,
      transaction_id TEXT UNIQUE NOT NULL,
      amount REAL NOT NULL,
      method TEXT NOT NULL,
      status TEXT DEFAULT 'SUCCESS',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (booking_id) REFERENCES bookings(id)
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      action TEXT NOT NULL,
      actor TEXT NOT NULL,
      details TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  seedData();
}

function seedData() {
  const stationCount = db.prepare('SELECT count(*) as count FROM stations').get().count;
  if (stationCount > 0) return; // already seeded

  console.log('🌱 Seeding RailEase database with initial Indian Railway data...');

  // 1. Seed Stations
  const stations = [
    { code: 'NDLS', name: 'New Delhi Railway Station', city: 'New Delhi', state: 'Delhi', zone: 'NR' },
    { code: 'CSMT', name: 'Chhatrapati Shivaji Maharaj Terminus', city: 'Mumbai', state: 'Maharashtra', zone: 'CR' },
    { code: 'MMCT', name: 'Mumbai Central', city: 'Mumbai', state: 'Maharashtra', zone: 'WR' },
    { code: 'HWH', name: 'Howrah Junction', city: 'Kolkata', state: 'West Bengal', zone: 'ER' },
    { code: 'MAS', name: 'MGR Chennai Central', city: 'Chennai', state: 'Tamil Nadu', zone: 'SR' },
    { code: 'SBC', name: 'KSR Bengaluru City', city: 'Bengaluru', state: 'Karnataka', zone: 'SWR' },
    { code: 'JP', name: 'Jaipur Junction', city: 'Jaipur', state: 'Rajasthan', zone: 'NWR' },
    { code: 'LKO', name: 'Lucknow Charbagh', city: 'Lucknow', state: 'Uttar Pradesh', zone: 'NR' },
    { code: 'BSB', name: 'Varanasi Junction', city: 'Varanasi', state: 'Uttar Pradesh', zone: 'NER' },
    { code: 'PNBE', name: 'Patna Junction', city: 'Patna', state: 'Bihar', zone: 'ECR' },
    { code: 'ADI', name: 'Ahmedabad Junction', city: 'Ahmedabad', state: 'Gujarat', zone: 'WR' },
    { code: 'PUNE', name: 'Pune Junction', city: 'Pune', state: 'Maharashtra', zone: 'CR' },
    { code: 'HYB', name: 'Hyderabad Deccan', city: 'Hyderabad', state: 'Telangana', zone: 'SCR' },
    { code: 'AGC', name: 'Agra Cantt', city: 'Agra', state: 'Uttar Pradesh', zone: 'NCR' },
    { code: 'CNB', name: 'Kanpur Central', city: 'Kanpur', state: 'Uttar Pradesh', zone: 'NCR' }
  ];

  const insertStation = db.prepare('INSERT INTO stations (code, name, city, state, zone) VALUES (@code, @name, @city, @state, @zone)');
  for (const st of stations) {
    insertStation.run(st);
  }

  // 2. Seed Users
  const passwordHashUser = bcrypt.hashSync('passenger123', 10);
  const passwordHashAdmin = bcrypt.hashSync('admin123', 10);

  const insertUser = db.prepare('INSERT INTO users (name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)');
  insertUser.run('Rohan Sharma', 'passenger@railease.in', '9876543210', passwordHashUser, 'user');
  insertUser.run('Chief Controller (Admin)', 'admin@railease.in', '9899887766', passwordHashAdmin, 'admin');

  // 3. Seed Trains
  const trainsData = [
    {
      number: '22436',
      name: 'Vande Bharat Express',
      type: 'Vande Bharat',
      source_code: 'NDLS',
      source_name: 'New Delhi',
      dest_code: 'BSB',
      dest_name: 'Varanasi Jn',
      departure_time: '06:00',
      arrival_time: '14:00',
      duration: '8h 00m',
      days_of_run: 'Tue,Wed,Fri,Sat,Sun',
      distance_km: 759,
      pantry_available: 1,
      rating: 4.8,
      coaches: [
        { class_code: 'CC', class_name: 'AC Chair Car', coach_code: 'C1', total_seats: 48, base_fare: 1750 },
        { class_code: 'CC', class_name: 'AC Chair Car', coach_code: 'C2', total_seats: 48, base_fare: 1750 },
        { class_code: 'EC', class_name: 'Exec. Chair Car', coach_code: 'E1', total_seats: 32, base_fare: 3300 }
      ],
      routes: [
        { station_code: 'NDLS', station_name: 'New Delhi', stop_number: 1, arrival_time: '05:40', departure_time: '06:00', halt_mins: 20, distance_km: 0, platform: '16' },
        { station_code: 'CNB', station_name: 'Kanpur Central', stop_number: 2, arrival_time: '10:08', departure_time: '10:10', halt_mins: 2, distance_km: 440, platform: '5' },
        { station_code: 'BSB', station_name: 'Varanasi Jn', stop_number: 3, arrival_time: '14:00', departure_time: 'Terminates', halt_mins: 0, distance_km: 759, platform: '1' }
      ]
    },
    {
      number: '12952',
      name: 'Mumbai Tejas Rajdhani',
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
      rating: 4.9,
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
      rating: 4.7,
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
      rating: 4.5,
      coaches: [
        { class_code: 'SL', class_name: 'Sleeper Class', coach_code: 'S1', total_seats: 72, base_fare: 245 },
        { class_code: 'SL', class_name: 'Sleeper Class', coach_code: 'S2', total_seats: 72, base_fare: 245 },
        { class_code: '3A', class_name: 'AC 3 Tier', coach_code: 'B1', total_seats: 64, base_fare: 650 },
        { class_code: '2A', class_name: 'AC 2 Tier', coach_code: 'A1', total_seats: 48, base_fare: 920 }
      ],
      routes: [
        { station_code: 'NDLS', station_name: 'New Delhi', stop_number: 1, arrival_time: '21:30', departure_time: '21:50', halt_mins: 20, distance_km: 0, platform: '5' },
        { station_code: 'JP', station_name: 'Jaipur Jn', stop_number: 2, arrival_time: '04:30', departure_time: 'Terminates', halt_mins: 0, distance_km: 310, platform: '3' }
      ]
    },
    {
      number: '12124',
      name: 'Deccan Queen Superfast',
      type: 'Superfast',
      source_code: 'PUNE',
      source_name: 'Pune Jn',
      dest_code: 'CSMT',
      dest_name: 'Mumbai CSMT',
      departure_time: '07:15',
      arrival_time: '10:25',
      duration: '3h 10m',
      days_of_run: 'Daily',
      distance_km: 192,
      pantry_available: 1,
      rating: 4.8,
      coaches: [
        { class_code: 'CC', class_name: 'AC Chair Car', coach_code: 'C1', total_seats: 54, base_fare: 460 },
        { class_code: '2S', class_name: 'Second Sitting', coach_code: 'D1', total_seats: 80, base_fare: 130 },
        { class_code: '2S', class_name: 'Second Sitting', coach_code: 'D2', total_seats: 80, base_fare: 130 }
      ],
      routes: [
        { station_code: 'PUNE', station_name: 'Pune Jn', stop_number: 1, arrival_time: '07:00', departure_time: '07:15', halt_mins: 15, distance_km: 0, platform: '5' },
        { station_code: 'CSMT', station_name: 'Mumbai CSMT', stop_number: 2, arrival_time: '10:25', departure_time: 'Terminates', halt_mins: 0, distance_km: 192, platform: '8' }
      ]
    },
    {
      number: '12007',
      name: 'Mysuru Shatabdi Express',
      type: 'Shatabdi',
      source_code: 'MAS',
      source_name: 'Chennai Central',
      dest_code: 'SBC',
      dest_name: 'Bengaluru City',
      departure_time: '06:00',
      arrival_time: '10:50',
      duration: '4h 50m',
      days_of_run: 'Mon,Tue,Wed,Fri,Sat,Sun',
      distance_km: 359,
      pantry_available: 1,
      rating: 4.8,
      coaches: [
        { class_code: 'CC', class_name: 'AC Chair Car', coach_code: 'C1', total_seats: 54, base_fare: 975 },
        { class_code: 'CC', class_name: 'AC Chair Car', coach_code: 'C2', total_seats: 54, base_fare: 975 },
        { class_code: 'EC', class_name: 'Exec. Chair Car', coach_code: 'E1', total_seats: 32, base_fare: 1840 }
      ],
      routes: [
        { station_code: 'MAS', station_name: 'Chennai Central', stop_number: 1, arrival_time: '05:40', departure_time: '06:00', halt_mins: 20, distance_km: 0, platform: '2A' },
        { station_code: 'SBC', station_name: 'KSR Bengaluru City', stop_number: 2, arrival_time: '10:50', departure_time: 'Terminates', halt_mins: 0, distance_km: 359, platform: '7' }
      ]
    },
    {
      number: '12566',
      name: 'Bihar Sampark Kranti',
      type: 'Superfast',
      source_code: 'NDLS',
      source_name: 'New Delhi',
      dest_code: 'PNBE',
      dest_name: 'Patna Jn',
      departure_time: '13:00',
      arrival_time: '07:35',
      duration: '18h 35m',
      days_of_run: 'Daily',
      distance_km: 1002,
      pantry_available: 1,
      rating: 4.4,
      coaches: [
        { class_code: 'SL', class_name: 'Sleeper Class', coach_code: 'S1', total_seats: 72, base_fare: 510 },
        { class_code: 'SL', class_name: 'Sleeper Class', coach_code: 'S2', total_seats: 72, base_fare: 510 },
        { class_code: '3A', class_name: 'AC 3 Tier', coach_code: 'B1', total_seats: 64, base_fare: 1350 },
        { class_code: '2A', class_name: 'AC 2 Tier', coach_code: 'A1', total_seats: 48, base_fare: 1940 }
      ],
      routes: [
        { station_code: 'NDLS', station_name: 'New Delhi', stop_number: 1, arrival_time: '12:40', departure_time: '13:00', halt_mins: 20, distance_km: 0, platform: '13' },
        { station_code: 'CNB', station_name: 'Kanpur Central', stop_number: 2, arrival_time: '18:10', departure_time: '18:15', halt_mins: 5, distance_km: 440, platform: '7' },
        { station_code: 'PNBE', station_name: 'Patna Jn', stop_number: 3, arrival_time: '07:35', departure_time: 'Terminates', halt_mins: 0, distance_km: 1002, platform: '1' }
      ]
    },
    {
      number: '20901',
      name: 'Vande Bharat Express',
      type: 'Vande Bharat',
      source_code: 'MMCT',
      source_name: 'Mumbai Central',
      dest_code: 'ADI',
      dest_name: 'Ahmedabad Jn',
      departure_time: '06:00',
      arrival_time: '11:25',
      duration: '5h 25m',
      days_of_run: 'Mon,Tue,Wed,Thu,Fri,Sat',
      distance_km: 491,
      pantry_available: 1,
      rating: 4.9,
      coaches: [
        { class_code: 'CC', class_name: 'AC Chair Car', coach_code: 'C1', total_seats: 50, base_fare: 1420 },
        { class_code: 'EC', class_name: 'Exec. Chair Car', coach_code: 'E1', total_seats: 32, base_fare: 2630 }
      ],
      routes: [
        { station_code: 'MMCT', station_name: 'Mumbai Central', stop_number: 1, arrival_time: '05:40', departure_time: '06:00', halt_mins: 20, distance_km: 0, platform: '5' },
        { station_code: 'ADI', station_name: 'Ahmedabad Jn', stop_number: 2, arrival_time: '11:25', departure_time: 'Terminates', halt_mins: 0, distance_km: 491, platform: '1' }
      ]
    }
  ];

  const insertTrain = db.prepare(`
    INSERT INTO trains (number, name, type, source_code, source_name, dest_code, dest_name, departure_time, arrival_time, duration, days_of_run, distance_km, pantry_available, rating)
    VALUES (@number, @name, @type, @source_code, @source_name, @dest_code, @dest_name, @departure_time, @arrival_time, @duration, @days_of_run, @distance_km, @pantry_available, @rating)
  `);

  const insertRoute = db.prepare(`
    INSERT INTO train_routes (train_id, station_code, station_name, stop_number, arrival_time, departure_time, halt_mins, distance_km, platform)
    VALUES (@train_id, @station_code, @station_name, @stop_number, @arrival_time, @departure_time, @halt_mins, @distance_km, @platform)
  `);

  const insertCoach = db.prepare(`
    INSERT INTO train_coaches (train_id, class_code, class_name, coach_code, total_seats, base_fare)
    VALUES (@train_id, @class_code, @class_name, @coach_code, @total_seats, @base_fare)
  `);

  const insertSeat = db.prepare(`
    INSERT INTO seats (train_id, coach_code, class_code, seat_number, berth_type)
    VALUES (@train_id, @coach_code, @class_code, @seat_number, @berth_type)
  `);

  trainsData.forEach((trainData) => {
    const { coaches, routes, ...trainFields } = trainData;
    const res = insertTrain.run(trainFields);
    const trainId = res.lastInsertRowid;

    // Routes
    routes.forEach(rt => {
      insertRoute.run({ ...rt, train_id: trainId });
    });

    // Coaches & Seats
    coaches.forEach(ch => {
      insertCoach.run({ ...ch, train_id: trainId });

      // Generate realistic berths for each seat
      for (let s = 1; s <= ch.total_seats; s++) {
        let berth = 'Lower';
        if (ch.class_code === 'CC' || ch.class_code === 'EC' || ch.class_code === '2S') {
          // Chair car pattern: Window, Middle, Aisle
          const mod = s % 3;
          berth = mod === 1 ? 'Window' : (mod === 2 ? 'Middle' : 'Aisle');
        } else {
          // Sleeper / 3A layout (compartment of 8)
          const mod = s % 8;
          if (mod === 1 || mod === 4) berth = 'Lower';
          else if (mod === 2 || mod === 5) berth = 'Middle';
          else if (mod === 3 || mod === 6) berth = 'Upper';
          else if (mod === 7) berth = 'Side Lower';
          else berth = 'Side Upper';
        }

        insertSeat.run({
          train_id: trainId,
          coach_code: ch.coach_code,
          class_code: ch.class_code,
          seat_number: s,
          berth_type: berth
        });
      }
    });
  });

  // 4. Seed Initial Demo Bookings & PNRs
  const insertBooking = db.prepare(`
    INSERT INTO bookings (pnr, user_id, train_id, train_number, train_name, source_code, source_name, dest_code, dest_name, journey_date, class_code, quota, total_passengers, base_fare, reservation_charge, superfast_charge, gst, total_fare, status, payment_method, payment_ref, contact_email, contact_phone, booked_at)
    VALUES (@pnr, @user_id, @train_id, @train_number, @train_name, @source_code, @source_name, @dest_code, @dest_name, @journey_date, @class_code, @quota, @total_passengers, @base_fare, @reservation_charge, @superfast_charge, @gst, @total_fare, @status, @payment_method, @payment_ref, @contact_email, @contact_phone, @booked_at)
  `);

  const insertPassenger = db.prepare(`
    INSERT INTO passengers (booking_id, name, age, gender, berth_preference, coach_code, seat_number, berth_type, status)
    VALUES (@booking_id, @name, @age, @gender, @berth_preference, @coach_code, @seat_number, @berth_type, @status)
  `);

  const insertPayment = db.prepare(`
    INSERT INTO payments (booking_id, transaction_id, amount, method, status)
    VALUES (@booking_id, @transaction_id, @amount, @method, @status)
  `);

  // Today + 3 days
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 3);
  const journeyDate1 = futureDate.toISOString().split('T')[0];

  const futureDate2 = new Date();
  futureDate2.setDate(futureDate2.getDate() + 7);
  const journeyDate2 = futureDate2.toISOString().split('T')[0];

  // Booking 1: Vande Bharat NDLS to BSB (PNR: 2418937210)
  const b1 = insertBooking.run({
    pnr: '2418937210',
    user_id: 1,
    train_id: 1,
    train_number: '22436',
    train_name: 'Vande Bharat Express',
    source_code: 'NDLS',
    source_name: 'New Delhi',
    dest_code: 'BSB',
    dest_name: 'Varanasi Jn',
    journey_date: journeyDate1,
    class_code: 'CC',
    quota: 'General',
    total_passengers: 2,
    base_fare: 3500,
    reservation_charge: 80,
    superfast_charge: 90,
    gst: 183.5,
    total_fare: 3853.5,
    status: 'CONFIRMED',
    payment_method: 'UPI',
    payment_ref: 'UPI/2026/8912384',
    contact_email: 'passenger@railease.in',
    contact_phone: '9876543210',
    booked_at: new Date(Date.now() - 3600000 * 24).toISOString()
  });

  insertPassenger.run({ booking_id: b1.lastInsertRowid, name: 'Rohan Sharma', age: 28, gender: 'Male', berth_preference: 'Window', coach_code: 'C1', seat_number: 12, berth_type: 'Window', status: 'CNF' });
  insertPassenger.run({ booking_id: b1.lastInsertRowid, name: 'Pooja Sharma', age: 26, gender: 'Female', berth_preference: 'Window', coach_code: 'C1', seat_number: 13, berth_type: 'Middle', status: 'CNF' });
  insertPayment.run({ booking_id: b1.lastInsertRowid, transaction_id: 'TXN_VB_88910', amount: 3853.5, method: 'UPI', status: 'SUCCESS' });

  // Booking 2: Mumbai Tejas Rajdhani (PNR: 4529183401)
  const b2 = insertBooking.run({
    pnr: '4529183401',
    user_id: 1,
    train_id: 2,
    train_number: '12952',
    train_name: 'Mumbai Tejas Rajdhani',
    source_code: 'NDLS',
    source_name: 'New Delhi',
    dest_code: 'MMCT',
    dest_name: 'Mumbai Central',
    journey_date: journeyDate2,
    class_code: '3A',
    quota: 'General',
    total_passengers: 1,
    base_fare: 2280,
    reservation_charge: 40,
    superfast_charge: 45,
    gst: 118.25,
    total_fare: 2483.25,
    status: 'CONFIRMED',
    payment_method: 'Credit Card',
    payment_ref: 'CC/VISA/5412',
    contact_email: 'passenger@railease.in',
    contact_phone: '9876543210',
    booked_at: new Date(Date.now() - 3600000 * 48).toISOString()
  });

  insertPassenger.run({ booking_id: b2.lastInsertRowid, name: 'Rohan Sharma', age: 28, gender: 'Male', berth_preference: 'Lower', coach_code: 'B1', seat_number: 17, berth_type: 'Lower', status: 'CNF' });
  insertPayment.run({ booking_id: b2.lastInsertRowid, transaction_id: 'TXN_TR_77219', amount: 2483.25, method: 'Credit Card', status: 'SUCCESS' });

  // Booking 3: Cancelled booking with refund (PNR: 8923410592)
  const b3 = insertBooking.run({
    pnr: '8923410592',
    user_id: 1,
    train_id: 4,
    train_number: '12302',
    train_name: 'Howrah Rajdhani Express',
    source_code: 'NDLS',
    source_name: 'New Delhi',
    dest_code: 'HWH',
    dest_name: 'Howrah Jn',
    journey_date: '2026-10-05',
    class_code: '2A',
    quota: 'General',
    total_passengers: 1,
    base_fare: 3480,
    reservation_charge: 40,
    superfast_charge: 45,
    gst: 178.25,
    total_fare: 3743.25,
    status: 'CANCELLED',
    payment_method: 'NetBanking',
    payment_ref: 'HDFC/NET/99120',
    contact_email: 'passenger@railease.in',
    contact_phone: '9876543210',
    booked_at: '2026-09-28 10:15:00'
  });

  db.prepare('UPDATE bookings SET cancelled_at = ?, refund_amount = ? WHERE id = ?').run(
    '2026-10-01 15:30:00',
    3503.25,
    b3.lastInsertRowid
  );

  insertPassenger.run({ booking_id: b3.lastInsertRowid, name: 'Sanjay Verma', age: 45, gender: 'Male', berth_preference: 'Lower', coach_code: 'A1', seat_number: 8, berth_type: 'Lower', status: 'CAN' });

  // Audit Logs
  const insertAudit = db.prepare('INSERT INTO audit_logs (action, actor, details) VALUES (?, ?, ?)');
  insertAudit.run('SYSTEM_INIT', 'System', 'Database initialized and seeded with 12 Indian Railway express trains and stations.');
  insertAudit.run('BOOKING_CREATED', 'passenger@railease.in', 'PNR 2418937210 confirmed for NDLS-BSB Vande Bharat.');
  insertAudit.run('BOOKING_CANCELLED', 'passenger@railease.in', 'PNR 8923410592 cancelled. Refund of ₹3503.25 initiated.');

  console.log('✅ RailEase database seeded successfully!');
}

initSchema();

module.exports = db;

const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'railease_super_secure_btech_jwt_secret_2026';

app.use(cors());
app.use(express.json());

// ----------------------------------------------------
// AUTHENTICATION MIDDLEWARES
// ----------------------------------------------------
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required. Please log in.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired session token.' });
    }
    req.user = user;
    next();
  });
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Administrative privilege required.' });
  }
  next();
}

// ----------------------------------------------------
// AUTH ROUTES
// ----------------------------------------------------
app.post('/api/auth/register', (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const insert = db.prepare('INSERT INTO users (name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)');
    const result = insert.run(name, email.toLowerCase(), phone || '', passwordHash, 'user');

    const newUser = { id: result.lastInsertRowid, name, email: email.toLowerCase(), phone, role: 'user' };
    const token = jwt.sign(newUser, JWT_SECRET, { expiresIn: '7d' });

    db.prepare('INSERT INTO audit_logs (action, actor, details) VALUES (?, ?, ?)')
      .run('USER_REGISTER', email, `New user registration for ${name}`);

    res.status(201).json({ user: newUser, token, message: 'Account registered successfully!' });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Failed to register account.' });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role
    };

    const token = jwt.sign(userData, JWT_SECRET, { expiresIn: '7d' });

    db.prepare('INSERT INTO audit_logs (action, actor, details) VALUES (?, ?, ?)')
      .run('USER_LOGIN', user.email, `User login successful (${user.role})`);

    res.json({ user: userData, token, message: 'Login successful!' });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal login error.' });
  }
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  const user = db.prepare('SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?').get(req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }
  res.json({ user });
});

// ----------------------------------------------------
// STATIONS
// ----------------------------------------------------
app.get('/api/stations', (req, res) => {
  try {
    const stations = db.prepare('SELECT * FROM stations ORDER BY city ASC').all();
    res.json({ stations });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stations.' });
  }
});

// ----------------------------------------------------
// TRAINS SEARCH & DETAILS
// ----------------------------------------------------
app.get('/api/trains', (req, res) => {
  try {
    const { from, to, date, classType, trainType } = req.query;

    let query = `
      SELECT t.* 
      FROM trains t
      WHERE 1=1
    `;
    const params = [];

    if (from && from.trim() !== '') {
      query += ` AND (t.source_code = ? OR EXISTS (SELECT 1 FROM train_routes tr WHERE tr.train_id = t.id AND tr.station_code = ?))`;
      params.push(from.toUpperCase(), from.toUpperCase());
    }

    if (to && to.trim() !== '') {
      query += ` AND (t.dest_code = ? OR EXISTS (SELECT 1 FROM train_routes tr WHERE tr.train_id = t.id AND tr.station_code = ?))`;
      params.push(to.toUpperCase(), to.toUpperCase());
    }

    if (trainType && trainType !== 'All') {
      query += ` AND t.type = ?`;
      params.push(trainType);
    }

    query += ` ORDER BY t.departure_time ASC`;

    const trains = db.prepare(query).all(...params);

    // Attach coach classes & real-time seat availability for each train
    const enrichedTrains = trains.map(train => {
      const coaches = db.prepare(`
        SELECT class_code, class_name, coach_code, total_seats, base_fare
        FROM train_coaches
        WHERE train_id = ?
      `).all(train.id);

      // Group classes
      const classMap = {};
      coaches.forEach(ch => {
        if (!classMap[ch.class_code]) {
          classMap[ch.class_code] = {
            class_code: ch.class_code,
            class_name: ch.class_name,
            coaches: [],
            total_seats: 0,
            base_fare: ch.base_fare
          };
        }
        classMap[ch.class_code].coaches.push(ch.coach_code);
        classMap[ch.class_code].total_seats += ch.total_seats;
      });

      // Calculate availability on requested date
      const journeyDate = date || new Date().toISOString().split('T')[0];

      const classesWithAvailability = Object.values(classMap).map(cls => {
        // Count already booked passengers for this train, class, and date
        const booked = db.prepare(`
          SELECT COUNT(*) as count 
          FROM passengers p
          JOIN bookings b ON p.booking_id = b.id
          WHERE b.train_id = ? AND b.class_code = ? AND b.journey_date = ? AND b.status = 'CONFIRMED'
        `).get(train.id, cls.class_code, journeyDate).count;

        const available = Math.max(0, cls.total_seats - booked);
        let status = 'AVAILABLE';
        if (available === 0) status = 'WL (Waitlist)';
        else if (available <= 5) status = 'LIMITED';

        return {
          ...cls,
          booked_seats: booked,
          available_seats: available,
          status
        };
      });

      // Filter by class if selected
      let finalClasses = classesWithAvailability;
      if (classType && classType !== 'All') {
        finalClasses = classesWithAvailability.filter(c => c.class_code === classType);
      }

      return {
        ...train,
        classes: finalClasses
      };
    });

    // If filtered by class, only return trains with that class
    const filteredResults = classType && classType !== 'All' 
      ? enrichedTrains.filter(t => t.classes.length > 0)
      : enrichedTrains;

    res.json({ trains: filteredResults, count: filteredResults.length });
  } catch (err) {
    console.error('Search trains error:', err);
    res.status(500).json({ error: 'Error searching trains.' });
  }
});

app.get('/api/trains/:id', (req, res) => {
  try {
    const trainId = req.params.id;
    const train = db.prepare('SELECT * FROM trains WHERE id = ?').get(trainId);
    if (!train) {
      return res.status(404).json({ error: 'Train not found.' });
    }

    const routes = db.prepare(`
      SELECT * FROM train_routes WHERE train_id = ? ORDER BY stop_number ASC
    `).all(trainId);

    const coaches = db.prepare(`
      SELECT * FROM train_coaches WHERE train_id = ?
    `).all(trainId);

    res.json({ train, routes, coaches });
  } catch (err) {
    res.status(500).json({ error: 'Error loading train details.' });
  }
});

// Coach layout & seat collision prevention API
app.get('/api/trains/:id/coach-layout', (req, res) => {
  try {
    const trainId = req.params.id;
    const { coachCode, journeyDate } = req.query;

    if (!coachCode || !journeyDate) {
      return res.status(400).json({ error: 'coachCode and journeyDate are required parameters.' });
    }

    // Get all physical seats in this coach
    const seats = db.prepare(`
      SELECT seat_number, berth_type, class_code
      FROM seats
      WHERE train_id = ? AND coach_code = ?
      ORDER BY seat_number ASC
    `).all(trainId, coachCode);

    // Get currently booked seats for this coach on this journey date
    const bookedSeatsRows = db.prepare(`
      SELECT p.seat_number
      FROM passengers p
      JOIN bookings b ON p.booking_id = b.id
      WHERE b.train_id = ? AND p.coach_code = ? AND b.journey_date = ? AND b.status = 'CONFIRMED'
    `).all(trainId, coachCode, journeyDate);

    const bookedSeatNumbers = new Set(bookedSeatsRows.map(r => r.seat_number));

    const enrichedSeats = seats.map(s => ({
      ...s,
      isOccupied: bookedSeatNumbers.has(s.seat_number)
    }));

    res.json({
      coachCode,
      journeyDate,
      totalSeats: seats.length,
      availableCount: seats.length - bookedSeatNumbers.size,
      seats: enrichedSeats
    });
  } catch (err) {
    console.error('Coach layout error:', err);
    res.status(500).json({ error: 'Error fetching coach layout.' });
  }
});

// ----------------------------------------------------
// BOOKINGS & PNR
// ----------------------------------------------------
function generatePNR() {
  // Real Indian Railways format: 10 digits, e.g. 241-XXXXXXX
  const zones = ['2', '4', '6', '8'];
  const prefix = zones[Math.floor(Math.random() * zones.length)];
  let remaining = '';
  for (let i = 0; i < 9; i++) {
    remaining += Math.floor(Math.random() * 10).toString();
  }
  return prefix + remaining;
}

app.post('/api/bookings', (req, res) => {
  const transaction = db.transaction(() => {
    const {
      userId,
      trainId,
      journeyDate,
      classCode,
      quota = 'General',
      passengers, // Array: [{ name, age, gender, berthPreference, coachCode, seatNumber }]
      paymentMethod,
      contactEmail,
      contactPhone
    } = req.body;

    if (!trainId || !journeyDate || !classCode || !passengers || passengers.length === 0) {
      throw new Error('Incomplete booking parameters.');
    }

    const train = db.prepare('SELECT * FROM trains WHERE id = ?').get(trainId);
    if (!train) throw new Error('Train not found.');

    const coachInfo = db.prepare(`
      SELECT base_fare, coach_code FROM train_coaches WHERE train_id = ? AND class_code = ? LIMIT 1
    `).get(trainId, classCode);

    if (!coachInfo) throw new Error(`Class ${classCode} not available for train ${train.name}.`);

    // Verify seat collisions against existing confirmed bookings for that date
    for (const p of passengers) {
      if (p.coachCode && p.seatNumber) {
        const isOccupied = db.prepare(`
          SELECT 1
          FROM passengers p2
          JOIN bookings b ON p2.booking_id = b.id
          WHERE b.train_id = ? AND p2.coach_code = ? AND p2.seat_number = ? AND b.journey_date = ? AND b.status = 'CONFIRMED'
        `).get(trainId, p.coachCode, p.seatNumber, journeyDate);

        if (isOccupied) {
          throw new Error(`Seat ${p.seatNumber} in Coach ${p.coachCode} has already been reserved for ${journeyDate}. Please select another seat.`);
        }
      }
    }

    // Auto-allocate seat if passenger didn't pick specific seat
    const allocatedPassengers = [];
    for (let i = 0; i < passengers.length; i++) {
      const p = passengers[i];
      let assignedCoach = p.coachCode || coachInfo.coach_code;
      let assignedSeat = p.seatNumber;
      let assignedBerth = p.berthPreference || 'Lower';

      if (!assignedSeat) {
        // Find next free seat in assigned coach
        const freeSeat = db.prepare(`
          SELECT seat_number, berth_type
          FROM seats s
          WHERE s.train_id = ? AND s.coach_code = ?
            AND s.seat_number NOT IN (
              SELECT p2.seat_number FROM passengers p2
              JOIN bookings b ON p2.booking_id = b.id
              WHERE b.train_id = ? AND p2.coach_code = ? AND b.journey_date = ? AND b.status = 'CONFIRMED'
            )
          ORDER BY s.seat_number ASC
          LIMIT 1
        `).get(trainId, assignedCoach, trainId, assignedCoach, journeyDate);

        if (freeSeat) {
          assignedSeat = freeSeat.seat_number;
          assignedBerth = freeSeat.berth_type;
        } else {
          assignedSeat = 1 + i;
        }
      }

      allocatedPassengers.push({
        ...p,
        coachCode: assignedCoach,
        seatNumber: assignedSeat,
        berthType: assignedBerth
      });
    }

    // Calculate Fares
    const paxCount = allocatedPassengers.length;
    const baseFareTotal = coachInfo.base_fare * paxCount;
    const reservationCharge = 40 * paxCount;
    const superfastCharge = 45 * paxCount;
    // 5% GST on AC classes
    const isAC = ['1A', '2A', '3A', 'CC', 'EC'].includes(classCode);
    const gst = isAC ? Number(((baseFareTotal + reservationCharge + superfastCharge) * 0.05).toFixed(2)) : 0;
    const totalFare = Number((baseFareTotal + reservationCharge + superfastCharge + gst).toFixed(2));

    const pnr = generatePNR();
    const paymentRef = `TXN-${Date.now()}-${Math.floor(Math.random() * 8999 + 1000)}`;

    const insertBooking = db.prepare(`
      INSERT INTO bookings (
        pnr, user_id, train_id, train_number, train_name, source_code, source_name,
        dest_code, dest_name, journey_date, class_code, quota, total_passengers,
        base_fare, reservation_charge, superfast_charge, gst, total_fare,
        status, payment_method, payment_ref, contact_email, contact_phone
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        'CONFIRMED', ?, ?, ?, ?
      )
    `);

    const bookingRes = insertBooking.run(
      pnr,
      userId || null,
      trainId,
      train.number,
      train.name,
      train.source_code,
      train.source_name,
      train.dest_code,
      train.dest_name,
      journeyDate,
      classCode,
      quota,
      paxCount,
      baseFareTotal,
      reservationCharge,
      superfastCharge,
      gst,
      totalFare,
      paymentMethod || 'Simulated Payment',
      paymentRef,
      contactEmail || 'user@railease.in',
      contactPhone || '9876543210'
    );

    const bookingId = bookingRes.lastInsertRowid;

    // Insert passengers
    const insertPassenger = db.prepare(`
      INSERT INTO passengers (booking_id, name, age, gender, berth_preference, coach_code, seat_number, berth_type, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'CNF')
    `);

    allocatedPassengers.forEach(p => {
      insertPassenger.run(
        bookingId,
        p.name,
        parseInt(p.age, 10),
        p.gender,
        p.berthPreference || 'None',
        p.coachCode,
        p.seatNumber,
        p.berthType
      );
    });

    // Record simulated payment
    db.prepare(`
      INSERT INTO payments (booking_id, transaction_id, amount, method, status)
      VALUES (?, ?, ?, ?, 'SUCCESS')
    `).run(bookingId, paymentRef, totalFare, paymentMethod || 'Demo Pay');

    // Audit log
    db.prepare(`
      INSERT INTO audit_logs (action, actor, details)
      VALUES (?, ?, ?)
    `).run('BOOKING_CREATED', contactEmail || 'Passenger', `Booking confirmed. PNR: ${pnr}, Train: ${train.number}, Amount: ₹${totalFare}`);

    return {
      bookingId,
      pnr,
      totalFare,
      passengers: allocatedPassengers,
      trainNumber: train.number,
      trainName: train.name,
      journeyDate
    };
  });

  try {
    const result = transaction();
    res.status(201).json({ success: true, booking: result, message: 'Ticket booked successfully!' });
  } catch (err) {
    console.error('Booking failed:', err.message);
    res.status(400).json({ error: err.message || 'Could not complete booking.' });
  }
});

// PNR Status lookup (public or auth)
app.get('/api/bookings/pnr/:pnr', (req, res) => {
  try {
    const cleanPNR = req.params.pnr.replace(/[^0-9]/g, '');
    const booking = db.prepare(`
      SELECT b.*, t.departure_time, t.arrival_time, t.duration, t.type as train_type
      FROM bookings b
      LEFT JOIN trains t ON b.train_id = t.id
      WHERE b.pnr = ?
    `).get(cleanPNR);

    if (!booking) {
      return res.status(404).json({ error: `No booking found for PNR "${cleanPNR}". Please verify the 10-digit PNR number.` });
    }

    const passengers = db.prepare('SELECT * FROM passengers WHERE booking_id = ?').all(booking.id);
    const payment = db.prepare('SELECT * FROM payments WHERE booking_id = ?').get(booking.id);

    res.json({
      booking,
      passengers,
      payment,
      chartPrepared: true
    });
  } catch (err) {
    console.error('PNR lookup error:', err);
    res.status(500).json({ error: 'Error querying PNR status.' });
  }
});

// My Bookings (for authenticated user or email fallback)
app.get('/api/bookings/my-bookings', (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    let userId = null;
    let userEmail = req.query.email;

    if (authHeader) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        userId = decoded.id;
        userEmail = decoded.email;
      } catch (e) {
        // invalid token
      }
    }

    let query = `
      SELECT b.*, t.departure_time, t.arrival_time, t.duration, t.type as train_type
      FROM bookings b
      LEFT JOIN trains t ON b.train_id = t.id
      WHERE 1=1
    `;
    const params = [];

    if (userId) {
      query += ` AND (b.user_id = ? OR b.contact_email = ?)`;
      params.push(userId, userEmail);
    } else if (userEmail) {
      query += ` AND b.contact_email = ?`;
      params.push(userEmail);
    } else {
      // Return demo bookings for anonymous preview if needed
      query += ` LIMIT 10`;
    }

    query += ` ORDER BY b.journey_date DESC, b.booked_at DESC`;

    const bookings = db.prepare(query).all(...params);

    const fullBookings = bookings.map(b => {
      const passengers = db.prepare('SELECT * FROM passengers WHERE booking_id = ?').all(b.id);
      return {
        ...b,
        passengers
      };
    });

    res.json({ bookings: fullBookings });
  } catch (err) {
    console.error('My bookings error:', err);
    res.status(500).json({ error: 'Failed to retrieve bookings.' });
  }
});

// Cancel Booking & Seat Restoration
app.post('/api/bookings/:id/cancel', (req, res) => {
  try {
    const bookingId = req.params.id;
    const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(bookingId);

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found.' });
    }

    if (booking.status === 'CANCELLED') {
      return res.status(400).json({ error: 'This ticket has already been cancelled.' });
    }

    // Cancellation clerkage fee: ₹120 per passenger or flat ₹120
    const clerkage = 120 * booking.total_passengers;
    const refundAmount = Math.max(0, booking.total_fare - clerkage);

    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    db.prepare(`
      UPDATE bookings 
      SET status = 'CANCELLED', cancelled_at = ?, refund_amount = ?
      WHERE id = ?
    `).run(now, refundAmount, bookingId);

    // Update passengers status to CAN
    db.prepare(`UPDATE passengers SET status = 'CAN' WHERE booking_id = ?`).run(bookingId);

    // Audit log
    db.prepare(`
      INSERT INTO audit_logs (action, actor, details)
      VALUES (?, ?, ?)
    `).run('BOOKING_CANCELLED', booking.contact_email, `Cancelled PNR ${booking.pnr}. Refund: ₹${refundAmount}`);

    res.json({
      success: true,
      message: `Booking cancelled successfully. Simulated refund of ₹${refundAmount.toFixed(2)} processed to original payment method.`,
      refundAmount,
      clerkageFee: clerkage
    });
  } catch (err) {
    console.error('Cancel booking error:', err);
    res.status(500).json({ error: 'Failed to cancel booking.' });
  }
});

// ----------------------------------------------------
// ADMIN DASHBOARD ROUTES
// ----------------------------------------------------
app.get('/api/admin/overview', authenticateToken, requireAdmin, (req, res) => {
  try {
    const totalBookings = db.prepare('SELECT COUNT(*) as count FROM bookings').get().count;
    const confirmedBookings = db.prepare("SELECT COUNT(*) as count FROM bookings WHERE status = 'CONFIRMED'").get().count;
    const cancelledBookings = db.prepare("SELECT COUNT(*) as count FROM bookings WHERE status = 'CANCELLED'").get().count;
    const totalUsers = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'user'").get().count;
    const totalTrains = db.prepare('SELECT COUNT(*) as count FROM trains').get().count;
    const totalRevenue = db.prepare("SELECT SUM(total_fare - COALESCE(refund_amount, 0)) as rev FROM bookings").get().rev || 0;

    const recentBookings = db.prepare(`
      SELECT b.*, (SELECT COUNT(*) FROM passengers WHERE booking_id = b.id) as pax_count
      FROM bookings b
      ORDER BY b.booked_at DESC
      LIMIT 6
    `).all();

    const auditLogs = db.prepare(`
      SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 10
    `).all();

    // Chart data: Bookings by Class
    const classStats = db.prepare(`
      SELECT class_code, COUNT(*) as count, SUM(total_fare) as revenue
      FROM bookings
      GROUP BY class_code
    `).all();

    // Chart data: Popular Routes
    const routeStats = db.prepare(`
      SELECT source_code || ' → ' || dest_code as route, COUNT(*) as count
      FROM bookings
      GROUP BY source_code, dest_code
      ORDER BY count DESC
      LIMIT 5
    `).all();

    res.json({
      stats: {
        totalBookings,
        confirmedBookings,
        cancelledBookings,
        totalUsers,
        totalTrains,
        totalRevenue: Math.round(totalRevenue)
      },
      recentBookings,
      auditLogs,
      charts: {
        classStats,
        routeStats
      }
    });
  } catch (err) {
    console.error('Admin overview error:', err);
    res.status(500).json({ error: 'Error loading admin metrics.' });
  }
});

app.get('/api/admin/trains', authenticateToken, requireAdmin, (req, res) => {
  try {
    const trains = db.prepare('SELECT * FROM trains ORDER BY number ASC').all();
    const enriched = trains.map(t => {
      const coaches = db.prepare('SELECT * FROM train_coaches WHERE train_id = ?').all(t.id);
      const routes = db.prepare('SELECT * FROM train_routes WHERE train_id = ? ORDER BY stop_number ASC').all(t.id);
      return { ...t, coaches, routes };
    });
    res.json({ trains: enriched });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch admin trains.' });
  }
});

app.post('/api/admin/trains', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { number, name, type, source_code, source_name, dest_code, dest_name, departure_time, arrival_time, duration, days_of_run, distance_km, coaches } = req.body;

    if (!number || !name || !source_code || !dest_code) {
      return res.status(400).json({ error: 'Train number, name, source, and destination are required.' });
    }

    const insert = db.prepare(`
      INSERT INTO trains (number, name, type, source_code, source_name, dest_code, dest_name, departure_time, arrival_time, duration, days_of_run, distance_km)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insert.run(
      number,
      name,
      type || 'Superfast',
      source_code,
      source_name || source_code,
      dest_code,
      dest_name || dest_code,
      departure_time || '08:00',
      arrival_time || '18:00',
      duration || '10h 00m',
      days_of_run || 'Daily',
      distance_km || 500
    );

    const trainId = result.lastInsertRowid;

    // Default coaches if not passed
    const coachList = coaches && coaches.length > 0 ? coaches : [
      { class_code: 'CC', class_name: 'AC Chair Car', coach_code: 'C1', total_seats: 50, base_fare: 850 },
      { class_code: '2S', class_name: 'Second Sitting', coach_code: 'D1', total_seats: 75, base_fare: 220 }
    ];

    const insertCoach = db.prepare(`
      INSERT INTO train_coaches (train_id, class_code, class_name, coach_code, total_seats, base_fare)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const insertSeat = db.prepare(`
      INSERT INTO seats (train_id, coach_code, class_code, seat_number, berth_type)
      VALUES (?, ?, ?, ?, ?)
    `);

    coachList.forEach(c => {
      insertCoach.run(trainId, c.class_code, c.class_name, c.coach_code, c.total_seats, c.base_fare);
      for (let s = 1; s <= c.total_seats; s++) {
        insertSeat.run(trainId, c.coach_code, c.class_code, s, s % 2 === 0 ? 'Aisle' : 'Window');
      }
    });

    db.prepare(`
      INSERT INTO audit_logs (action, actor, details)
      VALUES (?, ?, ?)
    `).run('TRAIN_ADDED', req.user.email, `Created new train ${number} - ${name}`);

    res.status(201).json({ message: 'Train added successfully!', trainId });
  } catch (err) {
    console.error('Add train error:', err);
    res.status(500).json({ error: err.message || 'Failed to add train.' });
  }
});

app.delete('/api/admin/trains/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    const trainId = req.params.id;
    const train = db.prepare('SELECT number, name FROM trains WHERE id = ?').get(trainId);
    if (!train) return res.status(404).json({ error: 'Train not found.' });

    db.prepare('DELETE FROM trains WHERE id = ?').run(trainId);

    db.prepare(`
      INSERT INTO audit_logs (action, actor, details)
      VALUES (?, ?, ?)
    `).run('TRAIN_DELETED', req.user.email, `Removed train ${train.number} - ${train.name}`);

    res.json({ message: `Train ${train.number} deleted successfully.` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete train.' });
  }
});

app.get('/api/admin/bookings', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { search, status } = req.query;
    let query = `
      SELECT b.*, (SELECT COUNT(*) FROM passengers WHERE booking_id = b.id) as passenger_count
      FROM bookings b
      WHERE 1=1
    `;
    const params = [];

    if (search && search.trim() !== '') {
      query += ` AND (b.pnr LIKE ? OR b.train_number LIKE ? OR b.contact_email LIKE ? OR b.train_name LIKE ?)`;
      const term = `%${search.trim()}%`;
      params.push(term, term, term, term);
    }

    if (status && status !== 'ALL') {
      query += ` AND b.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY b.booked_at DESC`;

    const bookings = db.prepare(query).all(...params);
    res.json({ bookings });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve admin bookings.' });
  }
});

app.get('/api/admin/users', authenticateToken, requireAdmin, (req, res) => {
  try {
    const users = db.prepare(`
      SELECT u.id, u.name, u.email, u.phone, u.role, u.created_at,
             (SELECT COUNT(*) FROM bookings WHERE user_id = u.id) as bookings_count
      FROM users u
      ORDER BY u.created_at DESC
    `).all();
    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve users.' });
  }
});

// Serve React frontend (Production / Unified Single-App mode)
const path = require('path');
const fs = require('fs');

const clientDistPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      return res.sendFile(path.join(clientDistPath, 'index.html'));
    }
    next();
  });
}

app.listen(PORT, () => {
  console.log(`🚆 RailEase Server running at http://localhost:${PORT}`);
});

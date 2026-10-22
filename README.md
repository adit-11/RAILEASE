# 🚆 RailEase — Smart Railway Reservation System

> **B.Tech Software Engineering University Capstone Project**  
> A full-stack, responsive Indian Railway booking platform inspired by IRCTC with a modern, clean, and intuitive user experience.

---

## 🌟 Executive Summary

**RailEase** re-engineers the Indian Railways ticket reservation and passenger enquiry workflow. Built with **React 19**, **Vite**, **Tailwind CSS**, **Node.js Express**, and an **ACID-compliant SQLite relational database**, it resolves critical usability drawbacks of legacy railway websites by providing:

1. **Interactive Visual Coach & Berth Selection**: Choose exact physical berths (Lower, Middle, Upper, Side Lower, Side Upper, Window, Aisle) with real-time occupied vs. available indicators.
2. **ACID Concurrency & Seat Collision Prevention**: Database transactions ensure that two concurrent bookings cannot reserve the same berth on the same journey date.
3. **End-to-End Multi-Step Booking Wizard**: Fast 4-step workflow (Review → Passenger Roster → Berth Map → Simulated Payment).
4. **Electronic Reservation Slip (ERS)**: Print-ready, downloadable E-Tickets featuring digital QR codes, official barcodes, and complete fare breakdowns.
5. **Real-Time PNR Status Tracker**: Instant lookups by 10-digit PNR with passenger-level status (`CNF`, `CAN`, `RAC`, `WL`) and charting indicators.
6. **Self-Service Cancellations & Refund Simulation**: Instant cancellation calculating official clerkage fees and immediately restoring released berths back to the public booking pool.
7. **Comprehensive Role-Based Admin Operations Dashboard**: Live metrics, revenue tracking, dynamic train schedule & roster manager, bookings monitor, and security audit logging.

---

## 🛠️ Technology Stack

| Layer | Technologies Used | Key Libraries & Specifications |
| :--- | :--- | :--- |
| **Frontend UI** | React 19, Vite 8, Tailwind CSS v4 | `react-router-dom`, `lucide-react`, `canvas-confetti` |
| **Typography & Design** | Plus Jakarta Sans, Space Grotesk | Glassmorphism, Deep Navy (`#0A192F`), Indian Railways Royal Blue (`#1E40AF`), Saffron Accent (`#F97316`) |
| **Backend API** | Node.js, Express.js | REST architecture, CORS, JSON API |
| **Database** | SQLite via `better-sqlite3` | WAL mode, foreign key enforcement, transactional consistency |
| **Security & Auth** | JSON Web Tokens (JWT), BCrypt.js | Password hashing (salt rounds: 10), Role-based route guards (`admin` vs `user`) |

---

## 🔑 Demo Access Credentials & Test Data

The application comes pre-seeded with realistic Indian Railways express trains, major junction stations, user accounts, and confirmed booking records.

### 1. Pre-Configured Login Credentials

| Role | Email Address | Password | Privileges |
| :--- | :--- | :--- | :--- |
| **Normal Passenger** | `passenger@railease.in` | `passenger123` | Search, book tickets, view reservations, cancel tickets, download E-Tickets |
| **Chief Controller (Admin)** | `admin@railease.in` | `admin123` | Operations overview, revenue analytics, train roster editor, passenger records, audit logs |

> **Tip**: The Login page includes **one-click quick fill buttons** ("Demo Passenger" and "Demo Admin") for convenient live demonstration during university evaluation.

### 2. Sample PNRs for Live Status Lookup

Enter any of these 10-digit PNRs on the **PNR Status** page (`/pnr-status`):
- **`2418937210`**: New Delhi ⇄ Varanasi Jn (22436 Vande Bharat Express) — Confirmed (2 Passengers, Coach C1)
- **`4529183401`**: New Delhi ⇄ Mumbai Central (12952 Tejas Rajdhani) — Confirmed (1 Passenger, Coach B1)
- **`8923410592`**: New Delhi ⇄ Howrah Jn (12302 Howrah Rajdhani) — Cancelled with Simulated Refund of ₹3,503.25

---

## 🚀 Quick Start Guide (Running Locally)

### Prerequisites
- **Node.js**: v18.0.0 or later (Tested on Node.js v24 LTS)
- **NPM**: v9.0.0 or later

### Step 1: Install Dependencies
Open a terminal in the root project folder:

```powershell
# Install backend dependencies
cd server
npm install
node db.js    # Initializes SQLite database and seeds initial data

# Install frontend dependencies
cd ../client
npm install
```

### Step 2: Start the System
You can run both the backend and frontend together:

```powershell
# From the root directory:
node start-all.js
```

Or run each service in separate terminals:

```powershell
# Terminal 1 - Backend Server (Port 5000):
cd server
node index.js

# Terminal 2 - Frontend Dev Server (Port 5173):
cd client
npm run dev
```

### Step 3: Open in Browser
Visit **`http://localhost:5173`** in your browser.

---

## 🚆 System Architecture & Database Schema

```
┌────────────────────────────────────────────────────────┐
│                   RailEase Client                      │
│        (React 19 + Tailwind CSS + Lucide React)        │
└───────────────────────────┬────────────────────────────┘
                            │  HTTP / REST (/api/*)
┌───────────────────────────▼────────────────────────────┐
│                  Express.js Backend                    │
│            JWT Auth & Role-Based Middleware            │
└───────────────────────────┬────────────────────────────┘
                            │  better-sqlite3 (WAL Mode)
┌───────────────────────────▼────────────────────────────┐
│                  SQLite Database                       │
│  users • stations • trains • train_routes • seats      │
│  train_coaches • bookings • passengers • payments      │
└────────────────────────────────────────────────────────┘
```

### Relational Schema Design

1. **`users`**: `id`, `name`, `email` (UNIQUE), `phone`, `password_hash`, `role` (`user` / `admin`), `created_at`
2. **`stations`**: `id`, `code` (e.g. `NDLS`, `MMCT`, `BSB`), `name`, `city`, `state`, `zone`
3. **`trains`**: `id`, `number` (UNIQUE), `name`, `type` (`Vande Bharat`, `Rajdhani`, `Shatabdi`, `Superfast`), `source_code`, `dest_code`, `departure_time`, `arrival_time`, `duration`, `days_of_run`, `distance_km`, `pantry_available`, `rating`
4. **`train_routes`**: `id`, `train_id`, `station_code`, `station_name`, `stop_number`, `arrival_time`, `departure_time`, `halt_mins`, `distance_km`, `platform`
5. **`train_coaches`**: `id`, `train_id`, `class_code` (`1A`, `2A`, `3A`, `CC`, `EC`, `SL`, `2S`), `coach_code` (`C1`, `B1`, `A1`, `S1`), `total_seats`, `base_fare`
6. **`seats`**: `id`, `train_id`, `coach_code`, `seat_number`, `berth_type` (`Lower`, `Middle`, `Upper`, `Side Lower`, `Side Upper`, `Window`, `Aisle`)
7. **`bookings`**: `id`, `pnr` (UNIQUE, 10 digits), `user_id`, `train_id`, `train_number`, `journey_date`, `class_code`, `quota`, `total_passengers`, `base_fare`, `reservation_charge`, `superfast_charge`, `gst`, `total_fare`, `status` (`CONFIRMED` / `CANCELLED`), `payment_method`, `payment_ref`, `refund_amount`, `booked_at`, `cancelled_at`
8. **`passengers`**: `id`, `booking_id`, `name`, `age`, `gender`, `berth_preference`, `coach_code`, `seat_number`, `berth_type`, `status` (`CNF` / `CAN`)
9. **`payments`**: `id`, `booking_id`, `transaction_id`, `amount`, `method`, `status` (`SUCCESS`)
10. **`audit_logs`**: `id`, `action`, `actor`, `details`, `created_at`

---

## 📋 Comprehensive Feature Checklist

### A. Home Page
- [x] Sticky modern navigation bar with logo, active link states, user profile dropdown, and mobile drawer.
- [x] Hero section with headline: *"Your Journey, Simplified."* and Indian Railway branding.
- [x] High-converting **Train Search Card** with source & destination station selectors, station swap animation, journey date picker, travel class, and passenger quota.
- [x] 1-Click quick route chips (Delhi ⇄ Varanasi, Delhi ⇄ Mumbai, Delhi ⇄ Lucknow, Chennai ⇄ Bengaluru, Pune ⇄ Mumbai).
- [x] Real-time live statistics counters (12+ Express Trains, 10,000+ Demo Passengers, 99.8% Reliability, 139 Helpline).
- [x] Feature highlights for Vande Bharat, Tejas Rajdhani, and Swarna Shatabdi fleets.
- [x] 4-Step "How It Works" workflow guide.
- [x] Software Engineering comparison table (RailEase vs legacy IRCTC).
- [x] Official Indian Railways disclaimer and emergency helpline numbers (139 Rail Madad, 182 RPF).

### B. Train Search Results
- [x] Real-time train query with source, destination, and date filters.
- [x] Filter sidebar: Departure time slots (Early, Morning, Midday, Night), train type, maximum fare slider, and "Available Only" toggle.
- [x] Sorting dropdown: Earliest departure, fastest duration, lowest fare, and passenger rating.
- [x] Interactive class cards displaying live base fare and calculated available seats.
- [x] Route & Timetable Modal: Displays all intermediate stops, arrival/departure timings, halt durations, and platform numbers.

### C. Passenger Details & Seat Selection
- [x] Multi-step booking progression tracker.
- [x] Multi-passenger roster management (add up to 6 passengers, name, age, gender, berth preference).
- [x] **Visual Coach & Berth Selector**:
  - Displays actual coach layout with physical seat numbers and berth types.
  - Distinguishes available berths, current passenger's selected berth, group berths, and occupied berths (disabled).
  - Enforces database-level collision prevention to block duplicate seat allocation.
- [x] Itemized fare breakdown (Base Fare, Reservation Charge ₹40, Superfast Surcharge ₹45, AC 5% GST, Free Gateway Fee).

### D. Simulated Payment & Confirmation
- [x] Multi-tab payment options: UPI QR code / VPA, Debit/Credit Card with live card flip preview, and Net Banking (SBI, HDFC, ICICI, Axis, PNB).
- [x] Academic demonstration safety banner confirming zero financial risk.
- [x] Immediate booking creation with unique 10-digit PNR and festive confetti animation.

### E. Electronic Reservation Slip (ERS) & Ticket Confirmation
- [x] Print-ready, high-resolution E-Ticket (`/ticket/:pnr`).
- [x] Large PNR banner, QR code for digital TTE verification, passenger reservation table, and fare receipt.
- [x] Instant **"Print Ticket"** and **"Download PDF"** buttons.

### F. PNR Status Enquiry
- [x] Dedicated PNR tracking page (`/pnr-status`).
- [x] 10-Digit number validation with sample quick-click PNR chips.
- [x] Real-time status display with chart prepared badge, passenger-wise booking vs current status, and refund information if cancelled.

### G. My Bookings Dashboard
- [x] Categorized tabs: Upcoming Journeys, Completed Journeys, Cancelled & Refunded Tickets, and All Bookings.
- [x] Search filter by PNR or Train name.
- [x] Cancellation with **Confirmation Modal**: calculates official cancellation clerkage fees (₹120/pax), initiates simulated refund, and releases seats back into the reservation pool.

### H. Role-Based Admin Operations Portal
- [x] Protected routes requiring JWT token with `admin` role.
- [x] Key metrics: Total Bookings, Confirmed Bookings, Cancelled Bookings, Registered Passengers, Active Trains, and Simulated Net Revenue.
- [x] Visual SVG/CSS analytical charts: Booking distribution by travel class and high-demand route corridors.
- [x] **Train Management**: Add new trains with source, destination, timings, distance, and coaches; delete existing trains.
- [x] **Live Bookings Explorer**: Search by PNR, passenger, email, and filter by status.
- [x] **User Directory**: View registered passenger accounts, booking counts, and registration timestamps.
- [x] **System Security Audit Trail**: Real-time log of registrations, logins, bookings, and cancellations.

---

## 👨‍🏫 University Project Presentation Checklist

When presenting this project to your professor or examiner:

1. **Demonstrate Public Search**:
   - Open `http://localhost:5173`.
   - Click the "Delhi ⇄ Varanasi" quick route chip and click **Search Trains**.
   - Show the Vande Bharat Express (22436) and Howrah Rajdhani (12302) results.
   - Click **View Route & Schedule** to demonstrate intermediate halts (Kanpur Central PF 5, Varanasi PF 1).
2. **Demonstrate Interactive Seat Selection**:
   - Click **Book Ticket for CC**.
   - Add passenger details and proceed to **Step 3 (Seat Selection)**.
   - Show the interactive coach map, choose specific berths, and proceed to payment.
3. **Demonstrate E-Ticket & PNR**:
   - Complete the simulated payment and show the generated E-Ticket with the 10-digit PNR and QR code.
   - Click **Print Ticket** to trigger the browser's printable E-Ticket view.
4. **Demonstrate PNR Enquiry**:
   - Navigate to **PNR Status** and paste the newly generated PNR (or use pre-seeded `2418937210`).
   - Show passenger status and charting indicators.
5. **Demonstrate Ticket Cancellation & Refund**:
   - Navigate to **My Bookings**.
   - Click **Cancel Ticket** on an active booking.
   - Show the clerkage fee calculation and simulated refund confirmation.
6. **Demonstrate Admin Operations**:
   - Go to **Sign In** and click **Demo Admin** (`admin@railease.in` / `admin123`).
   - Open **Admin Portal** to showcase the analytics charts, fleet roster, and security audit log.

---

## 📄 License & Attribution

Designed and developed for academic evaluation as a Software Engineering Capstone Project. All train numbers, schedules, and station codes reflect Indian Railways conventions for simulation purposes.

// server.js — Spice Garden Backend
// Run: node server.js  (or: npm run dev  for auto-restart)

require('dotenv').config();
const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const path     = require('path');

const app = express();

// ── MIDDLEWARE ───────────────────────────────────────────────────────────────
app.use(cors());                          // Allow requests from your HTML pages
app.use(express.json());                  // Parse JSON request bodies
app.use(express.urlencoded({ extended: true }));

// Serve your HTML files as static files
// Put main.html, table reservation.html, takeaway.html in the /public folder
app.use(express.static(path.join(__dirname, 'public')));

// ── DATABASE ─────────────────────────────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅  MongoDB connected — spicegarden database ready'))
  .catch(err => {
    console.error('❌  MongoDB connection failed:', err.message);
    console.error('    Make sure MongoDB is running and MONGO_URI in .env is correct.');
    process.exit(1);
  });

// ── ROUTES ───────────────────────────────────────────────────────────────────
app.use('/api/reservations', require('./routes/reservations'));
app.use('/api/orders',       require('./routes/orders'));

// ── ADMIN DASHBOARD ──────────────────────────────────────────────────────────
// Simple page to view all bookings & orders
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// ── ROOT ─────────────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'main.html'));
});

// ── 404 HANDLER ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

// ── START SERVER ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🌶  Spice Garden server running at http://localhost:${PORT}`);
  console.log(`📋  Admin dashboard        → http://localhost:${PORT}/admin`);
  console.log(`📡  Reservations API       → http://localhost:${PORT}/api/reservations`);
  console.log(`📡  Orders API             → http://localhost:${PORT}/api/orders\n`);
});

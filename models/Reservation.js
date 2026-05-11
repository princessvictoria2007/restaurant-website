// models/Reservation.js
// Stores all table booking data from "table reservation.html"

const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  // Customer details
  name:      { type: String, required: true, trim: true },
  phone:     { type: String, required: true, trim: true },

  // Table details (from the table grid)
  tableNum:  { type: String, required: true },   // e.g. "T-03"
  tableZone: { type: String, required: true },   // e.g. "Main Hall"
  tableCapacity: { type: Number, required: true },

  // Booking details
  date:      { type: String, required: true },   // "YYYY-MM-DD"
  occasion:  { type: String, default: '' },      // Birthday, Anniversary, etc.
  notes:     { type: String, default: '' },      // Special requests

  // Status — restaurant can update this
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Reservation', reservationSchema);

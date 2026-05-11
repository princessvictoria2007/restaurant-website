// routes/reservations.js
// All API endpoints for table reservations

const express = require('express');
const router  = express.Router();
const Reservation = require('../models/Reservation');

// ── POST /api/reservations ──────────────────────────────────────────────────
// Called by table reservation.html when customer clicks "Confirm Reservation"
router.post('/', async (req, res) => {
  try {
    const { name, phone, tableNum, tableZone, tableCapacity, date, occasion, notes } = req.body;

    // Basic validation
    if (!name || !phone || !tableNum || !date) {
      return res.status(400).json({ success: false, message: 'Name, phone, table, and date are required.' });
    }

    // Check if this table is already booked on the same date
    const conflict = await Reservation.findOne({
      tableNum,
      date,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (conflict) {
      return res.status(409).json({
        success: false,
        message: `Table ${tableNum} is already booked for ${date}. Please choose another table or date.`
      });
    }

    // Save to database
    const reservation = new Reservation({
      name, phone, tableNum, tableZone,
      tableCapacity: tableCapacity || 2,
      date, occasion, notes
    });

    await reservation.save();

    res.status(201).json({
      success: true,
      message: 'Reservation confirmed!',
      data: {
        id:        reservation._id,
        name:      reservation.name,
        tableNum:  reservation.tableNum,
        tableZone: reservation.tableZone,
        date:      reservation.date,
        occasion:  reservation.occasion,
        status:    reservation.status
      }
    });

  } catch (err) {
    console.error('Reservation error:', err);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

// ── GET /api/reservations/availability?date=YYYY-MM-DD ─────────────────────
// Called by table reservation.html on page load to show booked tables
router.get('/availability', async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ success: false, message: 'date query parameter required.' });

    const booked = await Reservation.find({
      date,
      status: { $in: ['pending', 'confirmed'] }
    }).select('tableNum tableZone -_id');

    res.json({
      success: true,
      date,
      bookedTables: booked.map(r => r.tableNum)
    });

  } catch (err) {
    console.error('Availability error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ── GET /api/reservations ───────────────────────────────────────────────────
// Admin: view all reservations (newest first)
router.get('/', async (req, res) => {
  try {
    const { date, status } = req.query;
    const filter = {};
    if (date)   filter.date   = date;
    if (status) filter.status = status;

    const reservations = await Reservation.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: reservations.length, data: reservations });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ── PATCH /api/reservations/:id/status ─────────────────────────────────────
// Admin: update reservation status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const valid = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (!valid.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }

    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!reservation) return res.status(404).json({ success: false, message: 'Reservation not found.' });

    res.json({ success: true, data: reservation });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;

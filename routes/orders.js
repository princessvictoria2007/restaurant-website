// routes/orders.js
// All API endpoints for takeaway orders

const express = require('express');
const router  = express.Router();
const Order   = require('../models/Order');

// ── POST /api/orders ────────────────────────────────────────────────────────
// Called by takeaway.html when customer clicks "Place Order"
router.post('/', async (req, res) => {
  try {
    const { customerName, customerPhone, items, deliveryMode, deliveryAddress } = req.body;

    // Basic validation
    if (!customerName || !customerPhone) {
      return res.status(400).json({ success: false, message: 'Name and phone are required.' });
    }
    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Order must have at least one item.' });
    }
    if (deliveryMode === 'delivery' && !deliveryAddress) {
      return res.status(400).json({ success: false, message: 'Delivery address is required.' });
    }

    // Calculate totals
    const subtotal      = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const packingCharge = 20;
    const deliveryCharge = deliveryMode === 'delivery' ? 40 : 0;
    const totalAmount   = subtotal + packingCharge + deliveryCharge;

    // Build items with subtotals
    const orderItems = items.map(item => ({
      name:     item.name,
      price:    item.price,
      qty:      item.qty,
      subtotal: item.price * item.qty
    }));

    // Save to database
    const order = new Order({
      customerName,
      customerPhone,
      items: orderItems,
      subtotal,
      packingCharge,
      deliveryCharge,
      totalAmount,
      deliveryMode,
      deliveryAddress: deliveryAddress || ''
    });

    await order.save();

    const eta = deliveryMode === 'pickup'
      ? 'Ready for Pickup in 25–30 minutes'
      : 'Delivery in 40–50 minutes';

    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      data: {
        id:          order._id,
        totalAmount: order.totalAmount,
        deliveryMode: order.deliveryMode,
        status:      order.status,
        eta
      }
    });

  } catch (err) {
    console.error('Order error:', err);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

// ── GET /api/orders ─────────────────────────────────────────────────────────
// Admin: view all orders (newest first)
router.get('/', async (req, res) => {
  try {
    const { status, mode } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (mode)   filter.deliveryMode = mode;

    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ── GET /api/orders/:id ─────────────────────────────────────────────────────
// Get a single order by ID
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ── PATCH /api/orders/:id/status ────────────────────────────────────────────
// Admin: update order status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const valid = ['received', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'];
    if (!valid.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;

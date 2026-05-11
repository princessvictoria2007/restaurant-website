// models/Order.js
// Stores all takeaway orders from "takeaway.html"

const mongoose = require('mongoose');

// Each item in the order
const orderItemSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  price:    { type: Number, required: true },
  qty:      { type: Number, required: true, min: 1 },
  subtotal: { type: Number, required: true }   // price × qty
}, { _id: false });

const orderSchema = new mongoose.Schema({
  // Customer details (collected at checkout)
  customerName:  { type: String, required: true, trim: true },
  customerPhone: { type: String, required: true, trim: true },

  // Order items
  items: { type: [orderItemSchema], required: true },

  // Totals
  subtotal:       { type: Number, required: true },  // sum of items
  packingCharge:  { type: Number, default: 20 },
  deliveryCharge: { type: Number, default: 0 },      // 40 if delivery, 0 if pickup
  totalAmount:    { type: Number, required: true },

  // Pickup or Delivery
  deliveryMode:    { type: String, enum: ['pickup', 'delivery'], required: true },
  deliveryAddress: { type: String, default: '' },    // filled if deliveryMode === 'delivery'

  // Status — restaurant updates this
  status: {
    type: String,
    enum: ['received', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'received'
  },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);

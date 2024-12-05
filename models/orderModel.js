const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users', // Assuming you have a User model
    required: true,
  },
  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product', // Assuming you have a Product model
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
      price: {
        type: Number,
        required: true,
      },
    },
  ],
  totalPrice: {
    type: Number,
    required: true,
  },
  address: {
    addressLine1: { type: String, required: true },
    addressLine2: { type: String, required: false },
    addressLine3: { type: String, required: false },
    landmark: { type: String, required: false },
    pincode: { type: String, required: true },
  },
  bookingDate: {
    type: Date,
    required: true,
  },
  timeSlot: {
    key: { type: String, required: true }, // e.g., 'first'
    value: { type: String, required: true }, // e.g., '9AM - 10AM'
  },
  paymentMode: {
    type: String,
    enum: ['online', 'cash'],
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending',
  },
  orderStatus: {
    type: String,
    enum: ['processing', 'shipped', 'delivered', 'cancelled'],
    default: 'processing',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Orders = mongoose.model('Booking', orderSchema);

module.exports = Orders;

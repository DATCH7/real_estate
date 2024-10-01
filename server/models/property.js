const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  surface: Number,
  rooms: Number,
  type: String,
  category: { type: String, enum: ['sell', 'rent'], required: true },
  address: String,
  photos: [String],
  diagnostics: String,
  equipment: [String],
  publishedAt: { type: Date, default: Date.now },
  agentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isFeatured: { type: Boolean, default: false }
});

module.exports = mongoose.model('Property', propertySchema);

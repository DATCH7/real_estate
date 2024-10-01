const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
  addedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Favorite', favoriteSchema);

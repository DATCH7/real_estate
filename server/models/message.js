const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
  content: String,
  sentAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', messageSchema);

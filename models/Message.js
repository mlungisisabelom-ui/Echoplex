const mongoose = require('mongoose');
const Schema = new mongoose.Schema({
    from: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    to: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    type: { type: String, enum: ['text', 'audio', 'reaction'], default: 'text' },
    text: String,
    audio: String,
    reaction: String, // e.g., 'like', 'love', 'laugh'
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Message', Schema);

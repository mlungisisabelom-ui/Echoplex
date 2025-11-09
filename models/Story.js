const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    media: { type: String, required: true }, // URL to image/video
    text: String, // Optional text overlay
    expiresAt: { type: Date, default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) }, // 24 hours
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Story', storySchema);

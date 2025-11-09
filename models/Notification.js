const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['friend_request', 'like', 'comment', 'share', 'message'], required: true },
    from: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    relatedId: { type: mongoose.Schema.Types.ObjectId }, // e.g., postId, requestId
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', Schema);

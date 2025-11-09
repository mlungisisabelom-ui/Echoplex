const mongoose = require('mongoose');
const Schema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatar: String,
    bio: String,
    badges: [String], // e.g., ['verified', 'influencer', 'moderator']
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    privacy: { type: String, enum: ['public', 'friends'], default: 'public' },
    settings: {
        notifications: {
            likes: { type: Boolean, default: true },
            comments: { type: Boolean, default: true },
            friendRequests: { type: Boolean, default: true },
            messages: { type: Boolean, default: true }
        },
        privacy: {
            profileVisible: { type: Boolean, default: true },
            postsVisible: { type: Boolean, default: true },
            friendsVisible: { type: Boolean, default: true }
        },
        account: {
            twoFactor: { type: Boolean, default: false },
            emailNotifications: { type: Boolean, default: true }
        }
    },
    createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('User', Schema);

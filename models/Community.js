const mongoose = require('mongoose');
const Schema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    description: String,
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    moderators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    rules: [String],
    avatar: String,
    banner: String,
    isPrivate: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Community', Schema);

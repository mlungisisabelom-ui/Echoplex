const mongoose = require('mongoose');

const marketplaceItemSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    images: [String],
    category: { type: String, required: true },
    condition: { type: String, enum: ['new', 'used'], default: 'used' },
    location: String,
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['active', 'sold', 'deleted'], default: 'active' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MarketplaceItem', marketplaceItemSchema);

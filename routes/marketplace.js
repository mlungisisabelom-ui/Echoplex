const express = require('express');
const router = express.Router();
const MarketplaceItem = require('../models/MarketplaceItem');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// Get all marketplace items
router.get('/', async (req, res) => {
    try {
        const { category, minPrice, maxPrice, location } = req.query;
        let query = { status: 'active' };

        if (category) query.category = category;
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = parseFloat(minPrice);
            if (maxPrice) query.price.$lte = parseFloat(maxPrice);
        }
        if (location) query.location = { $regex: location, $options: 'i' };

        const items = await MarketplaceItem.find(query).populate('seller', 'name avatar').sort({ createdAt: -1 });
        res.json(items);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Create marketplace item
router.post('/', auth, upload.fields([{ name: 'images', maxCount: 5 }]), async (req, res) => {
    try {
        const { title, description, price, category, condition, location } = req.body;
        const images = req.files.images ? req.files.images.map(file => file.location) : [];

        const item = new MarketplaceItem({
            title,
            description,
            price: parseFloat(price),
            images,
            category,
            condition,
            location,
            seller: req.user.id
        });

        await item.save();
        res.status(201).json(await item.populate('seller', 'name avatar'));
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Update item status (mark as sold)
router.put('/:id/status', auth, async (req, res) => {
    try {
        const { status } = req.body;
        const item = await MarketplaceItem.findById(req.params.id);
        if (!item || item.seller.toString() !== req.user.id) return res.status(403).json({ error: 'Not authorized' });

        item.status = status;
        await item.save();
        res.json(item);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Delete item
router.delete('/:id', auth, async (req, res) => {
    try {
        const item = await MarketplaceItem.findById(req.params.id);
        if (!item || item.seller.toString() !== req.user.id) return res.status(403).json({ error: 'Not authorized' });

        item.status = 'deleted';
        await item.save();
        res.json({ message: 'Item deleted' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

module.exports = router;

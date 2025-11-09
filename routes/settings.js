const express = require('express');
const router = express.Router();
const User = require('../models/user');
const auth = require('../middleware/auth');

// Get user settings
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('settings');
        res.json(user.settings);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Update user settings
router.put('/', auth, async (req, res) => {
    try {
        const { settings } = req.body;
        const user = await User.findByIdAndUpdate(req.user.id, { settings }, { new: true });
        res.json(user.settings);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

module.exports = router;

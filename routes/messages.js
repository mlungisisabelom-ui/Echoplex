const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const auth = require('../middleware/auth');

// Get messages with a user
router.get('/:otherId', auth, async (req, res) => {
    const { otherId } = req.params;
    const msgs = await Message.find({
        $or: [
            { from: req.user._id, to: otherId },
            { from: otherId, to: req.user._id }
        ]
    }).sort({ createdAt: 1 });
    res.json(msgs);
});

// Send message
router.post('/:otherId', auth, async (req, res) => {
    const { otherId } = req.params;
    const { type, text, audio, reaction } = req.body;
    const msg = new Message({
        from: req.user._id,
        to: otherId,
        type: type || 'text',
        text,
        audio,
        reaction
    });
    await msg.save();
    res.json(msg);
});

// Mark messages as read
router.put('/:otherId/read', auth, async (req, res) => {
    await Message.updateMany(
        { from: req.params.otherId, to: req.user._id, read: false },
        { read: true }
    );
    res.json({ success: true });
});

module.exports = router;

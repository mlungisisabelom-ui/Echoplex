const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Post = require('../models/post');
const auth = require('../middleware/auth');

router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('name avatar bio badges friends privacy');
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Check privacy: if friends only, ensure requester is friend
        if (user.privacy === 'friends' && req.user && !user.friends.includes(req.user._id)) {
            return res.status(403).json({ error: 'Profile is private' });
        }

        const posts = await Post.find({ author: req.params.id }).populate('author', 'name avatar badges').sort({ createdAt: -1 });
        res.json({ user, posts });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.put('/profile', auth, async (req, res) => {
    try {
        const { bio, privacy } = req.body;
        const update = {};
        if (bio !== undefined) update.bio = bio;
        if (privacy !== undefined) update.privacy = privacy;
        const user = await User.findByIdAndUpdate(req.user._id, update, { new: true });
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Admin route to assign badges (for testing/demo purposes)
router.post('/:id/badge', auth, async (req, res) => {
    try {
        // In production, check if req.user is admin
        const { badge } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        if (!user.badges.includes(badge)) {
            user.badges.push(badge);
            await user.save();
        }
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;

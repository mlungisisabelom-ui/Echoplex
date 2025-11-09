const express = require('express');
const router = express.Router();
const Story = require('../models/Story');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// Create a story
router.post('/', auth, upload.single('media'), async (req, res) => {
    try {
        const story = new Story({
            author: req.user.id,
            media: req.file ? req.file.path : req.body.media,
            text: req.body.text || ''
        });
        await story.save();
        res.status(201).json(story);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Get stories from friends
router.get('/', auth, async (req, res) => {
    try {
        const user = await require('../models/user').findById(req.user.id).populate('friends');
        const friendIds = user.friends.map(f => f._id);
        friendIds.push(req.user.id); // Include own stories
        const stories = await Story.find({ author: { $in: friendIds }, expiresAt: { $gt: new Date() } }).populate('author', 'name avatar');
        res.json(stories);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Delete a story (only author)
router.delete('/:id', auth, async (req, res) => {
    try {
        const story = await Story.findById(req.params.id);
        if (!story || story.author.toString() !== req.user.id) return res.status(403).json({ error: 'Not authorized' });
        await story.remove();
        res.json({ message: 'Story deleted' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

module.exports = router;

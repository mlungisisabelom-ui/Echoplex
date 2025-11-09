const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Post = require('../models/post');
const Community = require('../models/Community');
const auth = require('../middleware/auth');

// Search users, posts, communities
router.get('/', auth, async (req, res) => {
    try {
        const query = req.query.q;
        const type = req.query.type; // 'users', 'posts', 'communities', or undefined for all
        const dateFrom = req.query.dateFrom ? new Date(req.query.dateFrom) : null;
        const dateTo = req.query.dateTo ? new Date(req.query.dateTo) : null;

        if (!query) return res.json({ users: [], posts: [], communities: [] });

        let users = [], posts = [], communities = [];

        if (!type || type === 'users') {
            users = await User.find({ name: { $regex: query, $options: 'i' } }).select('name avatar');
        }

        if (!type || type === 'posts') {
            let postQuery = { text: { $regex: query, $options: 'i' } };
            if (dateFrom || dateTo) {
                postQuery.createdAt = {};
                if (dateFrom) postQuery.createdAt.$gte = dateFrom;
                if (dateTo) postQuery.createdAt.$lte = dateTo;
            }
            posts = await Post.find(postQuery).populate('author', 'name avatar').sort({ createdAt: -1 });
        }

        if (!type || type === 'communities') {
            communities = await Community.find({ name: { $regex: query, $options: 'i' } });
        }

        // Trending topics (simple implementation: count posts with hashtags)
        const trending = await Post.aggregate([
            { $match: { text: { $regex: '#', $options: 'i' } } },
            { $project: { hashtags: { $split: ['$text', ' '] } } },
            { $unwind: '$hashtags' },
            { $match: { hashtags: { $regex: '^#' } } },
            { $group: { _id: '$hashtags', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        res.json({ users, posts, communities, trending });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
async function moderateContent(text) {
    const isSafe = true;
    return isSafe;
}
router.get('/', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const posts = await Post.find()
        .populate('author', 'name avatar badges')
        .populate('sharedPost')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    res.json(posts);
});
router.post('/', auth, upload.fields([{ name: 'images', maxCount: 5 }, { name: 'audio', maxCount: 1 }]), async (req, res) => {
    const { text, pollQuestion, pollOptions, location } = req.body;
    const images = req.files.images ? req.files.images.map(file => file.location) : [];
    const audio = req.files.audio ? req.files.audio[0].location : null;
    const postData = { author: req.user._id };
    if (text) {
        const isSafe = await moderateContent(text);
        if (!isSafe) return res.status(403).json({ error: "Content flagged by moderation." });
        postData.text = text;
    }
    if (images.length > 0) postData.images = images;
    if (audio) postData.audio = audio;
    if (location) postData.location = location;
    if (pollQuestion && pollOptions) {
        postData.poll = { question: pollQuestion, options: JSON.parse(pollOptions).map(opt => ({ text: opt, votes: 0 })) };
    }
    const post = await Post.create(postData);
    res.json(await post.populate('author', 'name avatar badges'));
});

router.post('/:id/vote', auth, async (req, res) => {
    const { optionIndex } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post || !post.poll) return res.status(404).json({ error: 'Poll not found' });
    if (optionIndex >= 0 && optionIndex < post.poll.options.length) {
        post.poll.options[optionIndex].votes += 1;
        await post.save();
        res.json({ success: true, poll: post.poll });
    } else {
        res.status(400).json({ error: 'Invalid poll option' });
    }
});

router.post('/:id/like', auth, async (req, res) => {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Not found' });
    if (!post.likes.includes(req.user._id)) {
        post.likes.push(req.user._id);
        await post.save();

        // Create notification for the post author if not liking own post
        if (post.author.toString() !== req.user._id.toString()) {
            await Notification.create({
                user: post.author,
                type: 'like',
                from: req.user._id,
                message: `${(await require('../models/user').findById(req.user._id)).name} liked your post`,
                relatedId: post._id
            });
        }
    }
    res.json({ success: true });
});

// Add comment to post
router.post('/:id/comment', auth, async (req, res) => {
    const { text } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    const comment = { author: req.user._id, text };
    post.comments.push(comment);
    await post.save();
    res.json(await post.populate('comments.author', 'name avatar'));
});

// Add reply to comment
router.post('/:postId/comment/:commentId/reply', auth, async (req, res) => {
    const { text } = req.body;
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    const reply = { author: req.user._id, text };
    comment.replies.push(reply);
    await post.save();
    res.json(await post.populate('comments.author comments.replies.author', 'name avatar'));
});

// Like comment
router.post('/:postId/comment/:commentId/like', auth, async (req, res) => {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    if (!comment.likes.includes(req.user._id)) {
        comment.likes.push(req.user._id);
        await post.save();
    }
    res.json({ success: true });
});

// Share post
router.post('/:id/share', auth, async (req, res) => {
    const { shareText } = req.body;
    const originalPost = await Post.findById(req.params.id);
    if (!originalPost) return res.status(404).json({ error: 'Post not found' });
    const sharedPost = await Post.create({
        author: req.user._id,
        sharedPost: originalPost._id,
        shareText: shareText || ''
    });

    // Add sharer to original post's shares array if not already present
    if (!originalPost.shares.includes(req.user._id)) {
        originalPost.shares.push(req.user._id);
        await originalPost.save();
    }

    res.json(await sharedPost.populate('author', 'name avatar badges'));

    // Create notification for the original post author if not sharing own post
    if (originalPost.author.toString() !== req.user._id.toString()) {
        await Notification.create({
            user: originalPost.author,
            type: 'share',
            from: req.user._id,
            message: `${(await require('../models/user').findById(req.user._id)).name} shared your post`,
            relatedId: originalPost._id
        });
    }
});

module.exports = router;

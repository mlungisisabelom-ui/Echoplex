const express = require('express');
const router = express.Router();
const FriendRequest = require('../models/FriendRequest');
const User = require('../models/user');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

router.post('/request/:userId', auth, async (req, res) => {
    const { userId } = req.params;
    if (userId === req.user._id.toString()) return res.status(400).json({ error: 'Cannot send request to yourself' });
    const existing = await FriendRequest.findOne({ from: req.user._id, to: userId, status: 'pending' });
    if (existing) return res.status(400).json({ error: 'Request already sent' });
    const request = await FriendRequest.create({ from: req.user._id, to: userId });
    res.json(request);
});

router.post('/accept/:requestId', auth, async (req, res) => {
    const request = await FriendRequest.findById(req.params.requestId);
    if (!request || request.to.toString() !== req.user._id.toString()) return res.status(404).json({ error: 'Not found' });
    request.status = 'accepted';
    await request.save();
    await User.findByIdAndUpdate(request.from, { $addToSet: { friends: request.to } });
    await User.findByIdAndUpdate(request.to, { $addToSet: { friends: request.from } });

    // Create notification for the sender
    await Notification.create({
        user: request.from,
        type: 'friend_request',
        from: request.to,
        message: `${(await User.findById(request.to)).name} accepted your friend request`,
        relatedId: request._id
    });

    res.json({ success: true });
});

router.post('/decline/:requestId', auth, async (req, res) => {
    const request = await FriendRequest.findById(req.params.requestId);
    if (!request || request.to.toString() !== req.user._id.toString()) return res.status(404).json({ error: 'Not found' });
    request.status = 'declined';
    await request.save();
    res.json({ success: true });
});

router.get('/requests', auth, async (req, res) => {
    const requests = await FriendRequest.find({ to: req.user._id, status: 'pending' }).populate('from', 'name avatar');
    res.json(requests);
});

router.get('/', auth, async (req, res) => {
    const user = await User.findById(req.user._id).populate('friends', 'name avatar bio');
    res.json(user.friends);
});

module.exports = router;

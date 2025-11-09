const express = require('express');
const router = express.Router();
const Community = require('../models/Community');
const auth = require('../middleware/auth');

router.get('/', async (req, res) => {
    const communities = await Community.find().populate('creator', 'name').limit(20);
    res.json(communities);
});

router.get('/:id', async (req, res) => {
    const community = await Community.findById(req.params.id).populate('creator members moderators', 'name avatar');
    if (!community) return res.status(404).json({ error: 'Community not found' });
    res.json(community);
});

router.post('/', auth, async (req, res) => {
    const { name, description, rules, isPrivate } = req.body;
    const community = await Community.create({
        name,
        description,
        rules: rules || [],
        isPrivate: isPrivate || false,
        creator: req.user._id,
        members: [req.user._id],
        moderators: [req.user._id]
    });
    res.status(201).json(await community.populate('creator', 'name'));
});

router.post('/:id/join', auth, async (req, res) => {
    const community = await Community.findById(req.params.id);
    if (!community) return res.status(404).json({ error: 'Community not found' });
    if (community.members.includes(req.user._id)) return res.status(400).json({ error: 'Already a member' });
    community.members.push(req.user._id);
    await community.save();
    res.json({ success: true });
});

router.post('/:id/leave', auth, async (req, res) => {
    const community = await Community.findById(req.params.id);
    if (!community) return res.status(404).json({ error: 'Community not found' });
    community.members = community.members.filter(id => !id.equals(req.user._id));
    community.moderators = community.moderators.filter(id => !id.equals(req.user._id));
    await community.save();
    res.json({ success: true });
});

module.exports = router;

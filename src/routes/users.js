const express = require('express');
const router = express.Router();

// example: public endpoint
router.get('/public', (req, res) => {
  res.json({ msg: 'This is public' });
});

// protected endpoint — req.user set by middleware
router.get('/me', (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  res.json({
    uid: req.user.uid,
    email: req.user.email,
    claims: req.user.claims
  });
});

module.exports = router;

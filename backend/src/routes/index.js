const express = require('express');
const router = express.Router();
const claimRouter = require('./claimRouter');
const loginRouter = require('./loginRouter');
const mapRouter = require('./mapRouter');

router.use('/user', loginRouter);

router.use('/claim', claimRouter);

router.use('/map', mapRouter);

module.exports = router;
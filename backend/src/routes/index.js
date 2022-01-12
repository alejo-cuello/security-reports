const express = require('express');
const router = express.Router();
const claimRouter = require('./claimRouter');
const loginRouter = require('./loginRouter');


router.use('/login', loginRouter);
router.use('/signup', loginRouter);

router.use('/claim', claimRouter);

module.exports = router;
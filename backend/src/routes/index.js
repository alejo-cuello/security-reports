const express = require('express');
const router = express.Router();
const loginRouter = require('./loginRouter');
const claimRouter = require('./claimRouter');
const insecurityFactRouter = require('./insecurityFactRouter');
const claimTypeRouter = require('./claimTypeRouter');

router.use('/user', loginRouter);

router.use('/claim', claimRouter);

router.use('/insecurityFact', insecurityFactRouter);

router.use('/claimTypes', claimTypeRouter);

module.exports = router;
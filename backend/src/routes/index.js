const express = require('express');
const router = express.Router();
const loginRouter = require('./loginRouter');
const claimRouter = require('./claimRouter');
const insecurityFactRouter = require('./insecurityFactRouter');
const claimTypeRouter = require('./claimTypeRouter');
const insecurityFactTypeRouter = require('./insecurityFactTypeRouter');
const institutionRouter = require('./institutionRouter');
const contactRouter = require('./contactRouter');

router.use('/user', loginRouter);

router.use('/claim', claimRouter);

router.use('/insecurityFact', insecurityFactRouter);

router.use('/claimTypes', claimTypeRouter);

router.use('/insecurityFactTypes', insecurityFactTypeRouter);

router.use('/institutions', institutionRouter);

router.use('/contacts', contactRouter);

module.exports = router;
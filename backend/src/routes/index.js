const express = require('express');
const router = express.Router();
const userRouter = require('./userRouter');
const claimRouter = require('./claimRouter');
const insecurityFactRouter = require('./insecurityFactRouter');
const claimTypeRouter = require('./claimTypeRouter');
const insecurityFactTypeRouter = require('./insecurityFactTypeRouter');
const institutionRouter = require('./institutionRouter');
const contactRouter = require('./contactRouter');
const mapRouter = require('./mapRouter');
const statusRouter = require('./statusRouter');
const filesRouter = require('./filesRouter');
const emergencyTelephoneRouter = require('./emergencyTelephoneRouter');
const reportRouter = require('./reportRouter');

router.use('/user', userRouter);

router.use('/claim', claimRouter);

router.use('/insecurityFact', insecurityFactRouter);

router.use('/claimTypes', claimTypeRouter);

router.use('/insecurityFactTypes', insecurityFactTypeRouter);

router.use('/institutions', institutionRouter);

router.use('/contacts', contactRouter);

router.use('/map', mapRouter);

router.use('/status', statusRouter);

router.use('/files', filesRouter);

router.use('/emergencyTelephones', emergencyTelephoneRouter);

router.use('/reports', reportRouter);

module.exports = router;
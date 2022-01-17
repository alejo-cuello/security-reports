const express = require('express');
const router = express.Router();
const loginController = require('../controllers/loginController');

router.post('/login', loginController.login);
router.post('/signup', loginController.signup);
router.get('/confirmEmail/:token', loginController.confirmEmail);

module.exports = router;
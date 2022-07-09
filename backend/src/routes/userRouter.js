const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/login', userController.login);
router.post('/signup', userController.signup);
router.get('/signup/confirmEmail/:token', userController.confirmEmailSignup);
router.put('/changePassword', userController.changePassword);
router.get('/changePassword/confirmEmail/:token', userController.confirmEmailChangePassword);

module.exports = router;
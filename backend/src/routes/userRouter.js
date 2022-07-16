const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const verifyToken = require('../middlewares/verifyToken');
const passport = require('passport');


router.post('/login', userController.login);
router.post('/signup', userController.signup);
router.get('/signup/confirmEmail/:token', userController.confirmEmailSignup);
router.put('/editProfileData/:userId', verifyToken, userController.editProfileData);
router.put('/changePassword', userController.changePassword);
router.get('/changePassword/confirmEmail/:token', userController.confirmEmailChangePassword);

router.get('/auth/facebook', passport.authenticate('facebook'));

router.get('/auth/facebook/callback', 
    passport.authenticate('facebook', {
        failureRedirect: `${process.env.CLIENT_URL}/login`
    }),
    // TODO: Esto seguro se tiene q pasar a un controlador
    (req, res) => {
        // Successful authentication, redirect home.
        return res.redirect(`${process.env.CLIENT_URL}/pre-login?role=${req.user.role}&token=${req.user.accessToken}`);
    }
);

module.exports = router;
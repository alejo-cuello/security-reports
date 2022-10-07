const FacebookStrategy = require("passport-facebook").Strategy;
const models = require("../models");
const ApiError = require("../utils/apiError");


const searchUser = async (facebookId, email) => {
    return await models.Neighbor.findOne({
        attributes: {
            exclude: ["password", "facebookId", "emailIsVerified"]
        },
        where: {
            facebookId: facebookId,
            email: email
        }
    });
};

const facebookAuth = (passport) => {
    passport.use(new FacebookStrategy({
        clientID: process.env.FACEBOOK_CLIENT_ID,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
        callbackURL: "/user/auth/facebook/callback",
        profileFields: ['id', 'emails', 'name']
    },
    async (accessToken, refreshToken, profile, cb) => {
        try {
            const userFromDB = await searchUser(profile.id, profile._json.email);
            if (!userFromDB) {
                // Esta función cb redirije a la callbackURL (/user/auth/facebook/callback) que es una ruta definida en userRouter y ejecuta el método preLoginWithSocialMedia del userController
                return cb(null, {profile});
            }

            // Esta función cb redirije a la callbackURL (/user/auth/facebook/callback) que es una ruta definida en userRouter y ejecuta el método preLoginWithSocialMedia del userController
            return cb(null, {profile, accessToken, userFromDB, role: "neighbor"});
        } catch (error) {
            cb(error);            
        }
    }));

    passport.serializeUser((user, done) => {
        done(null, user.profile);
    });

    passport.deserializeUser((user, done) => {
        done(null, {user});
    });
};

module.exports = facebookAuth;
const FacebookStrategy = require("passport-facebook").Strategy;

const facebookAuth = (passport) => {
    passport.use(new FacebookStrategy({
        clientID: process.env.FACEBOOK_CLIENT_ID,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
        callbackURL: "/user/auth/facebook/callback"
    },
    (accessToken, refreshToken, profile, done) => {
        // TODO: Acá debería buscar el usuario en la BD y si no existe, crearlo
        // User.findOrCreate({ facebookId: profile.id }, (err, user) => {
        //   return cb(err, user);
        // });

        done(null, {profile, accessToken, role: "neighbor"});
    }));

    passport.serializeUser((user, done) => {
        done(null, user.profile.id);
    });

    passport.deserializeUser((user, done) => {
        console.log("deserializeUser: ", user);
        done(null, {user});
    });
};

module.exports = facebookAuth;
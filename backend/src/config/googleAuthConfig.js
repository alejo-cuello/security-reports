const GoogleStrategy = require('passport-google-oauth20').Strategy;

const googleAuth = (passport) => {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        // TODO: Esta URL se configura en el Google Developer Console
        callbackURL: "/auth/google/callback"
      },
      (accessToken, refreshToken, profile, cb) => {
        // TODO: Acá debería buscar el usuario en la BD y si no existe, crearlo
        // User.findOrCreate({ googleId: profile.id }, (err, user) => {
        //   return cb(err, user);
        // });
      }
    ));

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => {
            done(err, user)
        });
    });
};


module.exports = googleAuth;
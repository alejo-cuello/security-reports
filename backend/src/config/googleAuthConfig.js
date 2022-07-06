const GoogleStrategy = require('passport-google-oauth20').Strategy;

module.exports = function(passport) {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        // TODO: Esta URL se configura en el Google Developer Console
        callbackURL: "/auth/google/callback"
      },

      // TODO: Habría que ver si acá hacemos una transacción a la BD para guardar el usuario
      async (accessToken, refreshToken, profile, cb) => {

        // TODO: Ahora mostramos un mensaje el profile, pero ver si hay que guardar en la BD
        console.log("PROFILE: ", profile);
        
        // User.findOrCreate({ googleId: profile.id }, (err, user) => {
        //   return cb(err, user);
        // });
      }
    ));

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser( (id, done) => {
        User.findById(id, (err, user) => {
            done(err, user)
        });
    });
};
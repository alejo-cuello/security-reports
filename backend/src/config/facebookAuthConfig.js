const FacebookStrategy = require("passport-facebook").Strategy;
const models = require("../models");
const ApiError = require("../utils/apiError");


const searchUser = async (facebookId) => {
    return await models.Neighbor.findOne({
        attributes: {
            exclude: ["password", "facebookId", "emailIsVerified"]
        },
        where: {
            facebookId: facebookId
        }
    });
};

const facebookAuth = (passport) => {
    passport.use(new FacebookStrategy({
        clientID: process.env.FACEBOOK_CLIENT_ID,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
        callbackURL: "/user/auth/facebook/callback"
    },
    async (accessToken, refreshToken, profile, cb) => {
        try {
            const userFromDB = await searchUser(profile.id);
            if (!userFromDB) {
                /* TODO:
                    * Habría q ver si redireccionamos a otra página para q cargue se registre con los datos que faltan (menos nombre, apellido, password).
                    * El email no lo podemos recuperar del profile, // ? Cómo hacemos?
                    * Tener en cuenta los términos y condiciones.
                    * El campo emailIsVerified lo deberíamos poner en true una vez q cargue los datos. No hace falta que confirme el email.
                    * Cambiar el mesaje de error.
                */ 
                throw new ApiError(500, "No encontrado");
            }
            cb(null, {profile, accessToken, userFromDB, role: "neighbor"});
        } catch (error) {
            cb(error);            
        }
    }));

    passport.serializeUser((user, done) => {
        console.log("serializeUser: ", user);
        done(null, user.profile);
    });

    passport.deserializeUser((user, done) => {
        console.log("deserializeUser: ", user);
        done(null, {user});
    });
};

module.exports = facebookAuth;
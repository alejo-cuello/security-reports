const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    tls: {
        rejectUnauthorized: false
    },
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    }
});


const sendEmail = async (emailTo, subject, emailTemplateHtml) => {
    try {
        // send mail with defined transport object
        await transporter.sendMail({
            from: `"Report&Alert" <${ process.env.EMAIL_USER }>`, // sender address
            to: emailTo, // list of receivers
            subject: subject, // Subject line
            html: emailTemplateHtml, // html body 
        });
    } catch (error) {
        throw error;
    }
};


const getEmailTemplateSignup = (firstName, token) => {
    return `
    <div id="email___content">
        <h1>Hola ${ firstName }, gracias por registrarse</h1>
        <br>
        <p>
            Para continuar es necesario que confirme su correo electrónico haciendo click <a href="https://proyecto-final.fly.dev/user/signup/confirmEmail/${ token }">aquí</a>.
        </p>
    </div>
    `
};


const getEmailTemplateChangePassword = (firstName, token) => {
    return `
    <div id="email___content">
        <h1>Hola ${ firstName }, has solicitado cambiar la contraseña</h1>
        <br>
        <p>
            Para continuar es necesario que confirme el cambio de contraseña haciendo click <a href="https://proyecto-final.fly.dev/user/changePassword/confirmEmail/${ token }">aquí</a>.
        </p>
        <p>
            Si no has solicitado este cambio, ignora este correo.
        </p>
    </div>
    `
};

module.exports = {
    sendEmail,
    getEmailTemplateSignup,
    getEmailTemplateChangePassword
}
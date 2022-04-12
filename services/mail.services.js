const sgMail = require('@sendgrid/mail');
var path = require('path');
require("dotenv").config({
    path: path.join(__dirname, `/configs/${process.env.APP_ENV?.trim()}.env`),
});


const mail={};

mail.sendEmailVerificationMail = async (email, token) => {
    sgMail.setApiKey('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');
    const msg = {
        to: email,
        from: 'bezaleelnwabia@gmail.com', // Use the email address or domain you verified above
        subject: 'Verify Your Email Address',
        // text: 'and easy to do anywhere, even with Node.js',
        html: `
        <div>
                  <p>Welcome,
                  Please verify your account by clicking <a href=${`${process.env.HOSTURL}/api/auth/verifyUser/?t=${token}`}>this</a> link
                  </p>
          </div>
          `,
    };
    try {
        await sgMail.send(msg);
    } catch (error) {
        console.error(error);
        if (error.response) {
            console.error(error.response.body)
        }
    }


};

module.exports = mail;
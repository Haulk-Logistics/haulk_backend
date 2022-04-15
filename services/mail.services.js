const sgMail = require('@sendgrid/mail');
var path = require('path');
require("dotenv").config({
    path: path.join(__dirname, `/configs/${process.env.APP_ENV?.trim()}.env`),
});


const mail = {};

mail.sendEmailVerificationMail = async (email, token) => {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const msg = {
        to: email,
        from: 'haulklogistics@gmail.com', // Use the email address or domain you verified above
        subject: 'Verify Your Email Address',
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



mail.sendPasswordResetEmail = async (email, token) => {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const msg = {
        to: email,
        from: 'haulklogistics@gmail.com',
        subject: 'RESET PASSWORD',
        html: `
        <div>
        <p>
        Reset your account password by clicking <a href=${`${process.env.FRONTEND_URL}/resetPassword/?t=${token}`}>this</a> link
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
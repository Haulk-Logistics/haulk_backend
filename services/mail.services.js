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
        from: `${process.env.EMAIL}`, // Use the email address or domain you verified above
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
        from: `${process.env.EMAIL}`,
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


mail.sendTruckDriverAcceptedEmail = async (email, driver_name) => {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const msg = {
        from: process.env.EMAIL,
        to: email,
        subject: 'ACCOUNT VERIFIED',
        text: `Hello ${driver_name},\n\n
        Congratulations, your account has been successfully verified and you can now accept orders.\n\n
        Please contact the haulk admins directly if you have any questions.\n\n
        Regards,\n\n
        The haulk admins`
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



mail.sendTruckDriverRejectedEmail = async (email, driver_name, reason) => {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const msg = {
        from: process.env.EMAIL,
        to: email,
        subject: 'ACCOUNT REJECTED',
        text: `Hello ${driver_name},\n\n
        Your account has been rejected.\n\n
        Reason: ${reason}\n\n
        Please contact the haulk admins directly if you have any questions.\n\n
        Regards,\n\n
        The haulk admins`
    };

    try {
        await sgMail.send(msg);
    } catch (error) {
        console.error(error);
        if (error.response) {
            console.error(error.response.body)
        }
    }


}



mail.sendOrderAcceptedByDriverEmail = async (email, driver_name, order_id, user_name) => {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const msg = {
        from: process.env.EMAIL,
        to: email,
        subject: 'ORDER ACCEPTED',
        text: `Hello ${user_name},\n\n
        Your order with Order ID: ${order_id} has been accepted by ${driver_name}.\n\n
        Check Your Dashboard to see latest info/status about your Order\n\n


        Please contact the haulk admins directly if you have any questions.\n\n
        Regards,\n\n
        The haulk admins`
    };

    try {
        await sgMail.send(msg);
    } catch (error) {
        console.error(error);
        if (error.response) {
            console.error(error.response.body)
        }
    }
}
module.exports = mail;



// let html = pug.renderFile( path.join(__dirname, '../views/email/verify_email.pug'), body.data );
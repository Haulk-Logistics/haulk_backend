// USERS CONTROLLER
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");


// Services
const mailService = require('../services/mail.services');

// Models
const User = require('../models/user.model');
const TruckDriver = require('../models/driver.model');
const CargoOwner = require('../models/cargo_owner.model');

const auth = {};

// Users should be able to create an account
auth.signup = async (req, res, next) => {
    try {
        // Confirm All Inputs are Valid
        if (!req.body.firstName) {
            return res.status(400).json({
                status: 'error',
                statusCode: 400,
                message: 'First name is required'
            });
        }
        if (!req.body.lastName) {
            return res.status(400).json({
                status: 'error',
                statusCode: 400,
                message: 'Last name is required'
            });
        }
        if (!req.body.email) {
            return res.status(400).json({
                status: 'error',
                statusCode: 400,
                message: 'Email is required'
            });
        }
        if (!req.body.phoneNumber) {
            return res.status(400).json({
                status: 'error',
                statusCode: 400,
                message: 'Phone number is required'
            });
        }
        if (!req.body.password) {
            return res.status(400).json({
                status: 'error',
                statusCode: 400,
                message: 'Password is required'
            });
        }
        if (!req.body.role) {
            return res.status(400).json({
                status: 'error',
                statusCode: 400,
                message: 'Role is required'
            });
        }
        if (req.body.role !== 'cargoowner' && req.body.role !== 'truckdriver') {
            return res.status(400).json({
                status: 'error',
                statusCode: 400,
                message: "Role must be 'cargoowner' or 'truckdriver'."
            });
        }


        // Check if user already exists in database
        const emailExist = await User.findOne({
            email: req.body.email
        });
        // If user exist, return error
        if (emailExist) {
            return res.status(409).json({
                status: 'error',
                statusCode: 409,
                message: `Sorry, this email is already registered. Please sign in`,
            });
        }

        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = new User({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            phoneNumber: req.body.phoneNumber,
            password: hashedPassword,
            role: req.body.role,
            verified: false,
        });
        // Save User to user collection
        const newUser = await user.save();

        // if new user is a truck driver save to truck driver collection
        if (newUser.role === 'truckdriver') {
            const truckDriver = new TruckDriver({
                userDetails: newUser._id,
            });
            try {
                await truckDriver.save();
            } catch (error) {
                console.log(error);
                return res.status(500).json({
                    status: 'error',
                    statusCode: 500,
                    message: "Internal server error, please try again, if error persists, contact 'support@haulk.com' ."
                });
            }
        }

        // if new user is a cargo owner save to cargo owner collection
        if (newUser.role === 'cargoowner') {
            const cargoowner = new CargoOwner({
                userDetails: newUser._id,
            });
            try {
                await cargoowner.save();
            } catch (error) {
                console.log(error);
                return res.status(500).json({
                    status: 'error',
                    statusCode: 500,
                    message: "Internal server error, please try again, if error persists, contact 'support@haulk.com' ."
                });
            }

        }

        // Generate JWT Token
        const token = jwt.sign({
                _id: newUser._id,
                email: newUser.email
            },
            process.env.TOKEN_SECRET, {
                expiresIn: "1h"
            });

        // send a verification email
        await mailService.sendEmailVerificationMail(newUser.email, token);
        return res.status(201).json({
            status: 'success',
            statusCode: 201,
            message: "User created successfully, Please check your mail box to verify your account",
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: 'error',
            statusCode: 500,
            message: "Internal server error, please try again, if error persists, contact 'support@haulk.com' ."
        });
    }
};




// Users should be able to log in with their email and password
auth.signin = (req, res, next) => {
//Only users with users.verified = true; should be able to log in
//If  users.verified = false; should not be able to log in, an error message should be displayed
// "unverified account , please verify your email"

};


// Users should be able to log out
auth.signout = (req, res, next) => {};

// Users should be able to reset their password
auth.resetPassword = (req, res, next) => {};




// Verify user email
auth.verifyUser = async (req, res, next) => {
    try {
        const token =await req.query.t;
        if (!token) {
            return res.status(400).json({
                status: 'error',
                statusCode: 400,
                message: 'Token not found'
            });
        }
        const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
        const user = await User.findOne({
            _id: decoded._id,
            email: decoded.email
        });
        if (!user) {
            return res.status(404).json({
                status: 'error',
                statusCode: 404,
                message: 'User not found'
            });
        }
        if (user.verified) {
            return res.status(409).json({
                status: 'error',
                statusCode: 409,
                message: 'User already verified'
            });
        }
        user.verified = true;
        await user.save();
        return res.status(200).json({
            status: 'success',
            statusCode: 200,
            message: 'User verified successfully'
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: 'error',
            statusCode: 500,
            message: "Internal server error, please try again, if error persists, contact 'support@haulk.com' "
        });
    }
};


// Resend Verification Mail
auth.resendVerificationEmail = async (req, res, next) => {
    try {
        const user = await User.findOne({
            email: req.body.email
        });
        if (!user) {
            return res.status(404).json({
                status: 'error',
                statusCode: 404,
                message: 'User not found'
            });
        }
        if (user.verified) {
            return res.status(409).json({
                status: 'error',
                statusCode: 409,
                message: 'User already verified'
            });
        }
        const token = jwt.sign({
                _id: user._id,
                email: user.email
            },
            process.env.TOKEN_SECRET, {
                expiresIn: "1h"
            });
        await mailService.sendEmailVerificationMail(user.email, token);
        return res.status(200).json({
            status: 'success',
            statusCode: 200,
            message: 'Verification email sent successfully'
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: 'error',
            statusCode: 500,
            message: "Internal server error, please try again, if error persists, contact 'support@haulk.com' "
        });
    }
};


module.exports = auth;
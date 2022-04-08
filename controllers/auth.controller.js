// USERS CONTROLLER
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const {
    body,
    validationResult
} = require('express-validator');


// Services
const mailService = require('../services/mail.services');

// Models
const User = require('../models/user.model');
const TruckDriver = require('../models/driver.model');
const CargoOwner = require('../models/cargo_owner.model');

const auth = {};

// Cargo Owner & Truck Driver should be able to create an account
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

        body('email').isEmail().withMessage('Email is required').toLowerCase();

        if (!req.body.phoneNumber) {
            return res.status(400).json({
                status: 'error',
                statusCode: 400,
                message: 'Phone number is required'
            });
        }
        body('phoneNumber').isMobilePhone('en-NG').withMessage('Phone number is invalid');


        if (!req.body.password) {
            return res.status(400).json({
                status: 'error',
                statusCode: 400,
                message: 'Password is required'
            });
        }
        body('password').isLength({
            min: 6
        }).withMessage('Password must be at least 6 characters long').toLowerCase();


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

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: 'error',
                statusCode: 400,
                message: errors.array()
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
        // SIGN UP FOR TRUCK DRIVER
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
        // SIGN UP FOR CARGO OWNER
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
        // If error, return SERVER error
        console.log(error);
        return res.status(500).json({
            status: 'error',
            statusCode: 500,
            message: "Internal server error, please try again, if error persists, contact 'support@haulk.com' ."
        });
    }
};

// Users should be able to log in with their email and password
auth.signin = async (req, res, next) => {
    try {
        if (!req.body.email) {
            return res.status(400).json({
                status: 'error',
                statusCode: 400,
                message: 'Email is required'
            });
        }
        body('email').isEmail().withMessage('Email is required').toLowerCase();

        if (!req.body.password) {
            return res.status(400).json({
                status: 'error',
                statusCode: 400,
                message: 'Password is required'
            });
        }
        body('password').toLowerCase();

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: 'error',
                statusCode: 400,
                message: errors.array()
            });
        }
        const email = req.body.email;
        const password = req.body.password;

        // Check for user
        const userDetails = await User.findOne({
            email: email
        });
        if (!userDetails) {
            return res.status(404).json({
                status: 'error',
                statusCode: 404,
                message: 'User not found'
            });
        }

        // Check if password is correct
        try {
            const verifyPassword = await bcrypt.compare(password, userDetails.password);
            if (!verifyPassword) {
                return res.status(401).json({
                    status: 'error',
                    statusCode: 401,
                    message: 'Invalid password'
                });
            }

        } catch (error) {
            console.log('bcrpt error', error);

            return res.status(500).json({
                status: 'error',
                statusCode: 500,
                message: "Internal server error, please try again, if error persists, contact 'support@haulk.com'"
            });
        }
        // check if user is verified
        if (userDetails.verified === false) {
            return res.status(401).json({
                status: 'error',
                statusCode: 401,
                message: 'unverified account , please verify your email'
            });
        }

        // Check if user is a truck driver then search for truck driver
        if (userDetails.role === 'truckdriver') {
            const truckDriver = await TruckDriver.findOne({
                userDetails: userDetails._id
            }).populate('userDetails');

            console.log(truckDriver);

            if (!truckDriver) {
                return res.status(404).json({
                    status: 'error',
                    statusCode: 404,
                    message: 'Truck Driver Account Not Found'
                });
            }

            return res.status(200).json({
                status: 'success',
                statusCode: 200,
                message: 'Truck Driver logged in successfully',
                token: jwt.sign({
                    _id: userDetails._id
                }, process.env.TOKEN_SECRET),
                user_details: {
                    user_id: truckDriver.userDetails._id,
                    role: truckDriver.userDetails.role,
                    firstName: truckDriver.userDetails.firstName,
                    lastName: truckDriver.userDetails.lastName,
                    email: truckDriver.userDetails.email,
                    phoneNumber: truckDriver.userDetails.phoneNumber,
                    verified: truckDriver.userDetails.verified,
                    wallet: 'Comming Soon...'
                }
            });
        }

        // Check if user is a cargo owner then search for cargo owner
        if (userDetails.role === 'cargoowner') {

            // Confirm user is a cargo owner
            const cargoOwner = await CargoOwner.findOne({
                userDetails: userDetails._id
            }).populate('userDetails');

            if (!cargoOwner) {
                return res.status(404).json({
                    status: 'error',
                    statusCode: 404,
                    message: 'Cargo Owner Account Not Found'
                });
            }

            return res.status(200).json({
                status: 'success',
                statusCode: 200,
                message: 'Cargo Owner logged in successfully',
                token: jwt.sign({
                    _id: userDetails._id
                }, process.env.TOKEN_SECRET),
                user_details: {
                    user_id: cargoOwner.userDetails._id,
                    role: cargoOwner.userDetails.role,
                    firstName: cargoOwner.userDetails.firstName,
                    lastName: cargoOwner.userDetails.lastName,
                    email: cargoOwner.userDetails.email,
                    phoneNumber: cargoOwner.userDetails.phoneNumber,
                    verified: cargoOwner.userDetails.verified,
                }
            });

        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: 'error',
            statusCode: 500,
            message: "Internal server error, please try again, if error persists, contact 'support@haulk.com' ."
        });

    }
};

// Verify user email
auth.verifyUser = async (req, res, next) => {
    try {
        const token = await req.query.t;
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

        if (!req.body.email) {
            return res.status(400).json({
                status: 'error',
                statusCode: 400,
                message: 'Email is required'
            });
        }
        body('email').isEmail().withMessage('Email is required').toLowerCase();

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: 'error',
                statusCode: 400,
                message: errors.array()
            });
        }

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


// Users should be able to log out
// auth.signout = (req, res, next) => {};

// Users should get a link to reset their password
auth.sendResetPasswordMail = async (req, res, next) => {
    try {
        if (!req.body.email) {
            return res.status(400).json({
                status: 'error',
                statusCode: 400,
                message: 'Email is required'
            });
        };
        body('email').isEmail().withMessage('Email is required').toLowerCase();

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: 'error',
                statusCode: 400,
                message: errors.array()
            });
        };

        // Confirm user exists
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

        // Generate token
        const token = jwt.sign({
                email: user.email
            },
            process.env.TOKEN_SECRET,
        );

        // Send reset password email
        await mailService.sendPasswordResetEmail(user.email, token);

        return res.status(200).json({
            status: 'success',
            statusCode: 200,
            message: `Reset Password email sent to '${user.email}' successfully`
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: 'error',
            statusCode: 500,
            message: "Internal server error, please try again"
        });
    }
};

auth.changePassword = async (req, res, next) => {
    try {
        // TODO: I WILL BE GETTING TOKEN FROM HEADER
        const token = await req.query.t;
        if (!token) {
            return res.status(400).json({
                status: 'error',
                statusCode: 400,
                message: 'Token not found'
            });
        }
        const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
        const user = await User.findOne({
            email: decoded.email
        });
        if (!user) {
            return res.status(404).json({
                status: 'error',
                statusCode: 404,
                message: 'User not found'
            });
        }
        if (user.verified === false) {
            user.verified = true;
        }

        const newPassword = req.body.newPassword;
        // confirm req.body.newPassword fields are not empty
        if (!newPassword) {
            return res.status(400).json({
                status: 'error',
                statusCode: 400,
                message: 'New Password field is empty'
            });
        }
        body('newPassword').isLength({
            min: 6
        }).withMessage('New Password must be at least 6 characters long');

        const confirmPassword = req.body.confirmPassword;
        // confirm req.body.confirmPassword fields are not empty
        if (!confirmPassword) {
            return res.status(400).json({
                status: 'error',
                statusCode: 400,
                message: 'Confirm Password field is empty'
            });
        }

        // Confirm new password and confirm password are same
        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                status: 'error',
                statusCode: 400,
                message: 'Passwords do not match'
            });
        }

        // if new password is same as old password return error
        if (newPassword === user.password) {
            return res.status(400).json({
                status: 'error',
                statusCode: 400,
                message: 'New password is same as old password'
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update user password
        user.password = hashedPassword;

        // Save Updated User
        await user.save();

        return res.status(200).json({
            status: 'success',
            statusCode: 200,
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: 'error',
            statusCode: 500,
            message: "Internal server error, please try again, if error persists, contact 'support@haulk.com'"
        });
    }
}









module.exports = auth;
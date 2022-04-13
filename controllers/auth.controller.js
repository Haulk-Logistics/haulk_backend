// USERS CONTROLLER
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const validatorer = require('express-validator');


//body validator
const body = validatorer.body;

// validationResult function
const validationResult = validatorer.validationResult;

const formidable = require("formidable");


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


        // If role is truckdriver, check if this other fields are there
        // if (req.body.role === 'truckdriver') {

        //     //  check if truck driver has an id and if its valid

        //     // check if driver license image  is uploaded 

        //     // check if truck type is uploaded 



        // }

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

        // Create New User
        const user = await new User({
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
        if (req.body.role === 'truckdriver') {
            const truckDriver = new TruckDriver({
                userDetails: newUser._id,
            });

            await truckDriver.save();
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
                message: "Truck Driver created successfully, Please check your mail box to verify your account",
            });
        }

        // if new user is a cargo owner save to cargo owner collection
        // SIGN UP FOR CARGO OWNER
        if (req.body.role === 'cargoowner') {
            const cargoowner = new CargoOwner({
                userDetails: newUser._id,
            });

            // Save cargo owner to cargo owner collection
            await cargoowner.save();

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

            // Account Created Successfully
            return res.status(201).json({
                status: 'success',
                statusCode: 201,
                message: "Cargo Owner Account created successfully, Please check your mail box to verify your account",
            });

        }

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
        if (!req.body.password) {
            return res.status(400).json({
                status: 'error',
                statusCode: 400,
                message: 'Password is required'
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
        const verifyPassword = await bcrypt.compare(password, userDetails.password);
        if (!verifyPassword) {
            return res.status(401).json({
                status: 'error',
                statusCode: 401,
                message: 'Invalid password'
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
            }).populate('userDetails').populate('truckDetails');

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
                    wallet: 'Comming Soon...',
                    truckDetails: truckDriver.truckDetails
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

        jwt.verify(token, process.env.TOKEN_SECRET, async (err, decoded) => {
            // if token has expired return error
            if (err) {
                return res.status(401).json({
                    status: 'error',
                    error: err,
                    statusCode: 401,
                    message: 'Token has expired'
                });
            }
            // return decoded;
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
        const token = await req.headers.authorization.split(' ')[1];
        // The token wil  be placed in the authorization header and will have the Bearer prefix, thats why we need to split it and get the token
        if (!token) {
            return res.status(400).json({
                status: 'error',
                statusCode: 400,
                message: 'Token not found'
            });
        }

        jwt.verify(token, process.env.TOKEN_SECRET, async (err, decoded) => {
            // if token has expired return error
            if (err) {
                return res.status(401).json({
                    status: 'error',
                    error: err,
                    statusCode: 401,
                    message: 'Token has expired'
                });
            }
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
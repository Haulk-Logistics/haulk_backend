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
const Truck = require('../models/truck.model');
const {
    upload_image
} = require('../services/cloudinary.services');

const auth = {};

// Cargo Owner Signup
auth.signupCargoOwner = async (req, res, next) => {

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

        if (req.body.password.length < 8) {
            return res.status(400).json({
                status: 'error',
                statusCode: 400,
                message: 'Password must be at least 8 characters long'
            });
        }

        if (!req.body.role) {
            return res.status(400).json({
                status: 'error',
                statusCode: 400,
                message: 'Role is required'
            });
        }

        if (req.body.role !== 'cargoowner') {
            return res.status(400).json({
                status: 'error',
                statusCode: 400,
                message: "Role must be 'cargoowner'."
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
                message: `Sorry, this email is already registered as a ${emailExist.role}. Please sign in`,
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


        const cargoowner = await new CargoOwner({
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

// Truck Driver Sign Up
auth.signupTruckDriver = async (req, res, next) => {


    try {
        const form = new formidable.IncomingForm();

        form.parse(req, async (err, fields, files) => {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    status: 'error',
                    statusCode: 500,
                    message: "error parsing form, please try again, if error persists, contact admin"
                });
            }

            const firstName = fields.firstName;
            const lastName = fields.lastName;
            const email = fields.email;
            const phoneNumber = fields.phoneNumber;
            const password = fields.password;
            const role = fields.role;
            const truckType = fields.truckType;
            const truckSize = fields.truckSize;
            const licencePlateNumber = fields.licencePlateNumber;

            // File Uploads
            const driverLicenseImage = files.driverLicenseImage;
            const vehicleLicenseImage = files.vehicleLicenseImage;
            const certificateOfInsuranceImage = files.certificateOfInsuranceImage;
            const certificateOfRoadWorthinessImage = files.certificateOfRoadWorthinessImage;
            const transitGoodsLicenseImage = files.transitGoodsLicenseImage;
            const portPassesImage = files.portPassesImage;
            const truckImage = files.truckImage;
            const driverImage = files.driverImage;


            // Confirm All Inputs are Valid
            if (!firstName) {
                return res.status(400).json({
                    status: 'error',
                    statusCode: 400,
                    message: 'First name is required'
                });
            }

            if (!lastName) {
                return res.status(400).json({
                    status: 'error',
                    statusCode: 400,
                    message: 'Last name is required'
                });
            }

            if (!email) {
                return res.status(400).json({
                    status: 'error',
                    statusCode: 400,
                    message: 'Email is required'
                });
            }

            if (!phoneNumber) {
                phoneNumber = '+234809000000';
                // return res.status(400).json({
                //     status: 'error',
                //     statusCode: 400,
                //     message: 'Phone number is required'
                // });
            }

            if (!password) {
                return res.status(400).json({
                    status: 'error',
                    statusCode: 400,
                    message: 'Password is required'
                });
            }

            //confirm password is more than 6 characters
            if (password.length < 8) {
                return res.status(400).json({
                    status: 'error',
                    statusCode: 400,
                    message: 'Password must be at least 8 characters long'
                });
            }

            if (!role) {
                return res.status(400).json({
                    status: 'error',
                    statusCode: 400,
                    message: 'Role is required'
                });

            }

            if (role !== 'truckdriver') {
                return res.status(400).json({
                    status: 'error',
                    statusCode: 400,
                    message: 'Role must be truckdriver'
                });
            }

            if (!truckType) {
                return res.status(400).json({
                    status: 'error',
                    statusCode: 400,
                    message: 'Truck Type is required'
                });
            }

            if (!truckSize) {
                return res.status(400).json({
                    status: 'error',
                    statusCode: 400,
                    message: 'Truck Size is required'
                });
            }

            if (!licencePlateNumber) {
                return res.status(400).json({
                    status: 'error',
                    statusCode: 400,
                    message: 'Licence Plate Number is required'
                });
            }

            // Confirm FIles are uploaded
            if (!driverLicenseImage) {
                return res.status(400).json({
                    status: 'error',
                    statusCode: 400,
                    message: 'Driver License Image is required'
                });
            }

            if (!vehicleLicenseImage) {
                return res.status(400).json({
                    status: 'error',
                    statusCode: 400,
                    message: 'Vehicle License Image is required'
                });
            }

            if (!certificateOfInsuranceImage) {
                return res.status(400).json({
                    status: 'error',
                    statusCode: 400,
                    message: 'Certificate Of Insurance Image is required'
                });
            }

            if (!certificateOfRoadWorthinessImage) {
                return res.status(400).json({
                    status: 'error',
                    statusCode: 400,
                    message: 'Certificate Of RoadWorthiness Image is required'
                });
            }

            if (!transitGoodsLicenseImage) {
                return res.status(400).json({
                    status: 'error',
                    statusCode: 400,
                    message: 'Transit Goods License Image is required'
                });
            }

            if (!portPassesImage) {
                return res.status(400).json({
                    status: 'error',
                    statusCode: 400,
                    message: 'Port Passes Image is required'
                });
            }

            if (!truckImage) {
                return res.status(400).json({
                    status: 'error',
                    statusCode: 400,
                    message: 'Truck Image is required'
                });
            }

            if (!driverImage) {
                return res.status(400).json({
                    status: 'error',
                    statusCode: 400,
                    message: 'Driver Image is required'
                });
            }

            // Confirm all files are in the correct format
            if (driverLicenseImage.mimetype !== 'image/jpeg' && driverLicenseImage.mimetype !== 'image/png') {
                return res.status(400).json({
                    status: 'error',
                    statusCode: 400,
                    message: 'Driver License Image must be a jpeg or png'
                });
            }

            if (vehicleLicenseImage.mimetype !== 'image/jpeg' && vehicleLicenseImage.mimetype !== 'image/png') {
                return res.status(400).json({
                    status: 'error',
                    statusCode: 400,
                    message: 'Vehicle License Image must be a jpeg or png'
                });
            }

            if (certificateOfInsuranceImage.mimetype !== 'image/jpeg' && certificateOfInsuranceImage.mimetype !== 'image/png') {
                return res.status(400).json({
                    status: 'error',
                    statusCode: 400,
                    message: 'Certificate Of Insurance Image must be a jpeg or png'
                });
            }

            if (certificateOfRoadWorthinessImage.mimetype !== 'image/jpeg' && certificateOfRoadWorthinessImage.mimetype !== 'image/png') {
                return res.status(400).json({
                    status: 'error',
                    statusCode: 400,
                    message: 'Certificate Of RoadWorthiness Image must be a jpeg or png'
                });
            }

            if (transitGoodsLicenseImage.mimetype !== 'image/jpeg' && transitGoodsLicenseImage.mimetype !== 'image/png') {
                return res.status(400).json({
                    status: 'error',
                    statusCode: 400,
                    message: 'Transit Goods License Image must be a jpeg or png'
                });
            }

            if (portPassesImage.mimetype !== 'image/jpeg' && portPassesImage.mimetype !== 'image/png') {
                return res.status(400).json({
                    status: 'error',
                    statusCode: 400,
                    message: 'Port Passes Image must be a jpeg or png'
                });
            }

            if (truckImage.mimetype !== 'image/jpeg' && truckImage.mimetype !== 'image/png') {
                return res.status(400).json({
                    status: 'error',
                    statusCode: 400,
                    message: 'Truck Image must be a jpeg or png'
                });
            }

            if (driverImage.mimetype !== 'image/jpeg' && driverImage.mimetype !== 'image/png') {
                return res.status(400).json({
                    status: 'error',
                    statusCode: 400,
                    message: 'Driver Image must be a jpeg or png'
                });
            }





            // Check if user already exists in database
            const emailExist = await User.findOne({
                email: email
            });
            // If user exist, return error
            if (emailExist) {
                return res.status(409).json({
                    status: 'error',
                    statusCode: 409,
                    message: `Sorry, this email is already registered as a ${emailExist.role}. Please sign in`,
                });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            // Create New User
            const user = await new User({
                firstName: firstName,
                lastName: lastName,
                email: email,
                phoneNumber: phoneNumber,
                password: hashedPassword,
                role: role,
                verified: false,
            });
             

            // Save User to user collection
            let newUser;
            try {
                newUser = await user.save();
            } catch (error) {
                console.log(error);
                return res.status(500).json({
                    status: 'error',
                    statusCode: 500,
                    message: 'Internal Server Error Saving User, Please try again later, if the problem persists, contact us',
                });
            }



            // Folder Name On Cloudinary
            const folderName = `${newUser._id}`;

            // Upload Driver License Image
            const driverLicenseImageResult = await upload_image(driverLicenseImage.filepath, folderName);
            const vehicleLicenseImageResult = await upload_image(vehicleLicenseImage.filepath, folderName);
            const certificateOfInsuranceImageResult = await upload_image(certificateOfInsuranceImage.filepath, folderName);
            const certificateOfRoadWorthinessImageResult = await upload_image(certificateOfRoadWorthinessImage.filepath, folderName);
            const transitGoodsLicenseImageResult = await upload_image(transitGoodsLicenseImage.filepath, folderName);
            const portPassesImageResult = await upload_image(portPassesImage.filepath, folderName);
            const truckImageResult = await upload_image(truckImage.filepath, folderName);
            const driverImageResult = await upload_image(driverImage.filepath, folderName);

            // create a new truck
            const truck = await new Truck({
                truck_driver: newUser._id,
                truck_type: truckType,
                truck_size: truckSize,
                licence_plate_number: licencePlateNumber,
                driver_license_image: driverLicenseImageResult.url,
                vehicle_license_image: vehicleLicenseImageResult.url,
                certificate_of_insurance_image: certificateOfInsuranceImageResult.url,
                certificate_of_road_worthiness_image: certificateOfRoadWorthinessImageResult.url,
                transit_goods_license_image: transitGoodsLicenseImageResult.url,
                port_passes_image: portPassesImageResult.url,
                truck_image: truckImageResult.url,
                driver_image: driverImageResult.url,
            });

            const newTruck = await truck.save();


            // if new user is a truck driver save to truck driver collection
            // SIGN UP FOR TRUCK DRIVER
            const truckDriver = await new TruckDriver({
                userDetails: newUser._id,
                truckDetails: newTruck._id,
            });

            const newTruckDriver = await truckDriver.save();


            // Generate JWT Token
            const token = jwt.sign({
                    _id: newUser._id,
                    email: newUser.email
                },
                process.env.TOKEN_SECRET, {
                    expiresIn: "6h"
                });

            // send a verification email
            await mailService.sendEmailVerificationMail(newUser.email, token);

            return res.status(201).json({
                status: 'success',
                statusCode: 201,
                message: "Truck Driver created successfully, Please check your mail box to verify your account",
            });



        });
    } catch (error) {

        // If error, return SERVER error
        console.log(error);
        return res.status(500).json({
            status: 'error',
            statusCode: 500,
            message: "Internal server error, please try again, if error persists, contact 'support@haulk.com'. "
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
            // return res.status(200).json({
            //     status: 'success',
            //     statusCode: 200,
            //     message: 'User verified successfully'
            // });

            return res.redirect(301, `${process.env.FRONTEND_URL}/verified`);

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

            const oldPassword = await user.password;

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

            const newPassword = await req.body.newPassword;
            // confirm req.body.newPassword fields are not empty
            if (!newPassword) {
                return res.status(400).json({
                    status: 'error',
                    statusCode: 400,
                    message: 'New Password field is empty'
                });
            }

            if (newPassword.length < 8) {
                return res.status(400).json({
                    status: 'error',
                    statusCode: 400,
                    message: 'Password must be at least 8 characters long'
                });
            }

            const confirmPassword = await req.body.confirmPassword;
            // confirm req.body.confirmPassword fields are not empty
            if (!confirmPassword) {
                return res.status(400).json({
                    status: 'error',
                    statusCode: 400,
                    message: 'Confirm Password field is empty'
                });
            }

            if (confirmPassword.length < 8) {
                return res.status(400).json({
                    status: 'error',
                    statusCode: 400,
                    message: 'Password must be at least 8 characters long'
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
            if (newPassword === oldPassword) {
                return res.status(400).json({
                    status: 'error',
                    statusCode: 400,
                    message: 'New password is same as old password'
                });
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);

            const updatedUser = await User.findOneAndUpdate({
                email: decoded.email
            }, {
                password: hashedPassword
            }, {
                new: true
            });

            return res.status(200).json({
                status: 'success',
                statusCode: 200,
                message: 'Password changed successfully'
            });

            // // Update user password
            // user.password = hashedPassword;

            // // Save Updated User
            // await user.save();

            // return res.status(200).json({
            //     status: 'success',
            //     statusCode: 200,
            //     message: 'Password changed successfully'
            // });
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

auth.getUserProfile = async (req,res) => {
    try {
       const user = await User.findOne({_id: req.user.id});
       res.status(200).json({
           statuscode: 200,
           status: "success",
           message: user
       })
    } catch (error) {
        return res.status(400).json({
            status: 'error',
            statusCode: 400,
            message: 'Error retrieving user details'
        });
    }
}









module.exports = auth;
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");

// Import Express Validator
const {
    body,
    validationResult
} = require('express-validator');


const Admin = require('../models/admin.model');
const admin = {};

// Create Admin
admin.signup = async (req, res) => {
    try {
        // Confirm That All Inputs Are Valid
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


        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: 'error',
                statusCode: 400,
                message: errors.array()
            });
        }


        // Check if email already exists
        const emailExist = await Admin.findOne({
            email: req.body.email
        });
        if (emailExist) {
            return res.status(400).json({
                status: 'error',
                statusCode: 400,
                message: 'Admin already exists, please login. "if you have forgotten your password, please contact the haulk admins directly, as this is a highlly secured account"'
            });
        };
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        // save admin
        const newAdmin = new Admin({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: hashedPassword
        });
        await newAdmin.save();
        return res.status(201).json({
            status: 'success',
            statusCode: 201,
            message: 'Admin created successfully, please login'
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: 'error',
            statusCode: 500,
            message: 'Internal Server Error',
        });
    }
};


// Sign in for admin
admin.signIn = async (req, res) => {
    try {
        // Confirm That All Inputs Are Valid
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

        // Check For Admin Asscoiated With Email

        const adminDetails = await Admin.findOne({
            email: email
        });

        if (!adminDetails) {
            return res.status(400).json({
                status: 'error',
                statusCode: 400,
                message: 'Admin does not exist, please contact the haulk admins directly, as this is a highly secured url'
            });
        }

        try {
            // Check Password is correct
            const isMatch = await bcrypt.compare(password, adminDetails.password);
            if (!isMatch) {
                return res.status(400).json({
                    status: 'error',
                    statusCode: 400,
                    message: `Invalid password for '${email}'. Please try again.`
                });
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({
                status: 'error',
                statusCode: 500,
                message: 'Internal Server Error',
            });
        }


        res.status(200).json({
            status: 'success',
            statusCode: 200,
            message: 'Admin logged in successfully',
            token: jwt.sign({
                _id: adminDetails._id,
            }, process.env.TOKEN_SECRET),
            admin_details: {
                admin_id: adminDetails._id,
                firstName: adminDetails.firstName,
                lastName: adminDetails.lastName,
                email: adminDetails.email,
            }
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: 'error',
            statusCode: 500,
            message: 'Internal Server Error',
        });
    }
};


// Get all admins
admin.getAllAdmins = async (req, res) => {
    try {
        const admins = await Admin.find();
        res.status(200).json({
            status: 'success',
            statusCode: 200,
            message: 'All admins retrieved successfully',
            admins: admins
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: 'error',
            statusCode: 500,
            message: 'Internal Server Error',
        });
    }
};

module.exports = admin;
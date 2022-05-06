const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");

// Import Express Validator
const {
    body,
    validationResult
} = require('express-validator');


const Admin = require('../models/admin.model');
const TruckDriver = require('../models/driver.model');
const mail = require('../services/mail.services');
const OrderModel = require('../models/order.model');
const CargoOwner = require('../models/cargo_owner.model');
const Wallet = require('../models/driver_wallet.model');
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

// Accept a truck driver
admin.acceptTruckDriver = async (req, res) => {
    try {
        const admin = await req.admin;
        const adminId = admin._id;
        const truckDriverId = req.params.driver_id;

        // Check if admin exist
        const adminDetails = await Admin.findById(adminId);
        if (!adminDetails) {
            return res.status(400).json({
                status: 'error',
                statusCode: 400,
                message: 'Admin does not exist'
            });
        }

        // Check if truck driver exist
        const truckDriverDetails = await TruckDriver.findById(truckDriverId);
        if (!truckDriverDetails) {
            return res.status(400).json({
                status: 'error',
                statusCode: 400,
                message: 'Truck driver does not exist'
            });
        }

        // Check if truck driver is already accepted
        const truckDriverAccepted = await TruckDriver.findOne({
            _id: truckDriverId,
            accepted: 'verified'
        });
        if (truckDriverAccepted) {
            return res.status(400).json({
                status: 'error',
                statusCode: 400,
                message: 'Truck driver is already accepted'
            });
        }

        // Accept truck driver
        truckDriverDetails.accepted = 'verified';
        const acceptedDriver = await truckDriverDetails.save();

        // Get Driver Email
        const driverDetails = await TruckDriver.findById(acceptedDriver._id).populate('userDetails');

        // console.log(driverDetails);
        const driverEmail = await driverDetails.userDetails.email;
        const driverName = await driverDetails.userDetails.firstName;

        // Send email to truck driver
        await mail.sendTruckDriverAcceptedEmail(driverEmail, driverName);


        res.status(200).json({
            status: 'success',
            statusCode: 200,
            message: 'Truck driver verified successfully'
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

// Reject a truck driver
admin.rejectTruckDriver = async (req, res) => {
    try {
        const admin = await req.admin;
        const adminId = admin._id;
        const truckDriverId = req.params.driver_id;
        const reason_for_rejection = req.body.reason_for_rejection;
        if (!reason_for_rejection) {
            return res.status(400).json({
                status: 'error',
                statusCode: 400,
                message: 'Reason for rejection is required'
            });
        }

        // Check if admin exist
        const adminDetails = await Admin.findById(adminId);
        if (!adminDetails) {
            return res.status(400).json({
                status: 'error',
                statusCode: 400,
                message: 'Admin does not exist'
            });
        }

        // Check if truck driver exist
        const truckDriverDetails = await TruckDriver.findById(truckDriverId);
        if (!truckDriverDetails) {
            return res.status(400).json({
                status: 'error',
                statusCode: 400,
                message: 'Truck driver does not exist'
            });

        }

        // Check if truck driver is already accepted
        const truckDriverAccepted = await TruckDriver.findOne({
            _id: truckDriverId,
            accepted: 'verified'
        });
        if (truckDriverAccepted) {
            return res.status(400).json({
                status: 'error',
                statusCode: 400,
                message: 'Truck driver is already verified'
            });

        }

        // Reject truck driver
        truckDriverDetails.accepted = 'rejected';
        const rejectedDriver = await truckDriverDetails.save();

        // Get Driver Email
        const driverDetails = await TruckDriver.findById(rejectedDriver._id).populate('userDetails');

        console.log(driverDetails);
        const driverEmail = await driverDetails.userDetails.email;
        const driverName = await driverDetails.userDetails.firstName;

        // Send email to truck driver
        await mail.sendTruckDriverRejectedEmail(driverEmail, driverName, reason_for_rejection);

        res.status(200).json({
            status: 'success',
            statusCode: 200,
            message: 'Truck driver rejected successfully'
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: 'error',
            statusCode: 500,
            message: 'Internal Server Error',
        });
    }

}


// Get all truck drivers
admin.getAllDrivers = async (req, res) => {
    try {
        const admin = await req.admin;
        const adminId = admin._id;

        // Check if admin exist
        const adminDetails = await Admin.findById(adminId);
        if (!adminDetails) {
            return res.status(400).json({
                status: 'error',
                statusCode: 400,
                message: 'Admin does not exist'
            });
        }

        // Get all truck drivers
        const truckDrivers = await TruckDriver.find().populate('truckDetails').populate('userDetails');
        if (truckDrivers.length === 0) {
            return res.status(200).json({
                status: 'success',
                statusCode: 200,
                message: 'No truck drivers found',
                truckDrivers: []
            });

        }
        res.status(200).json({
            status: 'success',
            statusCode: 200,
            message: 'Truck drivers retrieved successfully',
            truckDrivers: truckDrivers
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: 'error',
            statusCode: 500,
            message: 'Internal Server Error',
        });

    }
}

// Truck Drivers Awaiting Acceptance
admin.getUnverifiedDrivers = async (req, res) => {
    try {
        const admin = await req.admin;
        const adminId = admin._id;

        // Check if admin exist
        const adminDetails = await Admin.findById(adminId);
        if (!adminDetails) {
            return res.status(400).json({
                status: 'error',
                statusCode: 400,
                message: 'Admin does not exist'
            });
        }

        // Get all unverified truck drivers
        const truckDrivers = await TruckDriver.find({
            accepted: 'unverified'
        }).populate('truckDetails').populate('userDetails').populate('walletDetails');
        console.log(truckDrivers);
        if (truckDrivers.length === 0) {
            return res.status(200).json({
                status: 'success',
                statusCode: 200,
                message: 'No truck drivers are awaiting acceptance',
                truck_drivers: []
            });

        }
        res.status(200).json({
            status: 'success',
            statusCode: 200,
            message: 'Truck drivers awaiting approval retrieved successfully',
            truck_drivers: truckDrivers
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: 'error',
            statusCode: 500,
            message: 'Internal Server Error',
        });

    }
}

// Get driver by id
admin.getDriverById = async (req, res) => {
    const driver_id = await req.params.driver_id;
    try {
        const admin = await req.admin;
        const adminId = admin._id;
    
        const adminDetails = await Admin.findById(adminId);
        if (!adminDetails) {
            return res.status(400).json({
                status: 'error',
                statusCode: 400,
                message: 'Admin does not exist'
            });

        }

        // Get each truck driver
        const truckDriver = await TruckDriver.findById(driver_id).populate('truckDetails').populate('userDetails').populate('walletDetails');
        if (!truckDriver) {
            return res.status(400).json({
                status: 'error',
                statusCode: 400,
                message: 'Truck driver with that id does not exist'
            });

        }
        res.status(200).json({
            status: 'success',
            statusCode: 200,
            message: 'Truck driver retrieved successfully',
            truck_driver: truckDriver
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: 'error',
            statusCode: 500,
            message: 'Internal Server Error',
        });

    }

}

// Truck Drivers Verified
admin.getVerifiedDrivers = async (req, res) => {
    try {
        const admin = await req.admin;
        const adminId = admin._id;

        // Check if admin exist
        const adminDetails = await Admin.findById(adminId);
        if (!adminDetails) {
            return res.status(400).json({
                status: 'error',
                statusCode: 400,
                message: 'Admin does not exist'
            });

        }
        // Get all verified truck drivers
        const truckDrivers = await TruckDriver.find({
            accepted: 'verified'
        }).populate('truckDetails').populate('userDetails');
        if (truckDrivers.length === 0) {
            return res.status(200).json({
                status: 'success',
                statusCode: 200,
                message: 'No truck drivers are verified',
                truckDrivers: []
            });
        }
        res.status(200).json({
            status: 'success',
            statusCode: 200,
            message: 'Truck drivers verified retrieved successfully',
            truckDrivers: truckDrivers
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: 'error',
            statusCode: 500,
            message: 'Internal Server Error',
        });
    }
}

// Truck Drivers Rejected
admin.getRejectedDrivers = async (req, res) => {
    try {
        const admin = await req.admin;
        const adminId = admin._id;

        // Check if admin exist
        const adminDetails = await Admin.findById(adminId);
        if (!adminDetails) {
            return res.status(400).json({
                status: 'error',
                statusCode: 400,
                message: 'Admin does not exist'
            });
        }
        // Get all rejected truck drivers
        const truckDrivers = await TruckDriver.find({
            accepted: 'rejected'
        }).populate('truckDetails').populate('userDetails');
        if (truckDrivers.length === 0) {
            return res.status(200).json({
                status: 'success',
                statusCode: 200,
                message: 'No truck drivers are rejected',
                truckDrivers: []
            });
        }
        res.status(200).json({
            status: 'success',
            statusCode: 200,
            message: 'Truck drivers rejected retrieved successfully',
            truckDrivers: truckDrivers
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: 'error',
            statusCode: 500,
            message: 'Internal Server Error',
        });
    }
}


// Total Driver (Approved, Declined, Awaiting Approval)
admin.getTotalDrivers = async (req, res) => {
    try {
        const admin = await req.admin;
        const adminId = admin._id;

        // Check if admin exist

        const adminDetails = await Admin.findById(adminId);
        if (!adminDetails) {
            return res.status(400).json({
                status: 'error',
                statusCode: 400,
                message: 'Admin does not exist'
            });
        }

        // Get total truck drivers
        const totalDrivers = await TruckDriver.find();
        const totalDriversCount = await totalDrivers.length;

        // Get total verified truck drivers
        const totalVerifiedDrivers = await TruckDriver.find({
            accepted: 'verified'
        });
        const totalVerifiedDriversCount = await totalVerifiedDrivers.length;

        // Get total unverified truck drivers
        const totalUnverifiedDrivers = await TruckDriver.find({
            accepted: 'unverified'
        });
        const totalUnverifiedDriversCount = await totalUnverifiedDrivers.length;

        // Get total rejected truck drivers
        const totalRejectedDrivers = await TruckDriver.find({
            accepted: 'rejected'
        });
        const totalRejectedDriversCount = await totalRejectedDrivers.length;

        res.status(200).json({
            status: 'success',
            statusCode: 200,
            message: 'Total truck drivers retrieved successfully',
            data: {
                total_drivers: totalDriversCount,
                total_verified_drivers: totalVerifiedDriversCount,
                total_unverified_drivers: totalUnverifiedDriversCount,
                total_rejected_drivers: totalRejectedDriversCount
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
}


// View Haulk Total Completed Orders
admin.getTotalCompletedOrders = async (req, res) => {
    try {
        const admin = await req.admin;
        const adminId = admin._id;

        // Check if admin exist
        const adminDetails = await Admin.findById(adminId);
        if (!adminDetails) {
            return res.status(400).json({
                status: 'error',
                statusCode: 400,
                message: 'Admin does not exist'
            });
        }

        // Get total completed orders
        const totalCompletedOrders = await OrderModel.find({
            order_status: 'dropped_off'
        });
        const totalCompletedOrdersCount = await totalCompletedOrders.length;

        res.status(200).json({
            status: 'success',
            statusCode: 200,
            message: 'Total completed orders retrieved successfully',
            data: {
                total_completed_orders: totalCompletedOrdersCount
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
}

// View Haulk Total Cargo Owners Accounts
admin.getTotalCargoOwners = async (req, res) => {
    try {
        const admin = await req.admin;
        const adminId = admin._id;

        // Check if admin exist
        const adminDetails = await Admin.findById(adminId);
        if (!adminDetails) {
            return res.status(400).json({
                status: 'error',
                statusCode: 400,
                message: 'Admin does not exist'
            });
        }

        // Get total cargo owners
        const totalCargoOwners = await CargoOwner.find();
        const totalCargoOwnersCount = await totalCargoOwners.length;

        res.status(200).json({
            status: 'success',
            statusCode: 200,
            message: 'Total cargo owners retrieved successfully',
            data: {
                total_cargo_owners: totalCargoOwnersCount
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
}

// api that returns haulk revenue
admin.getHaulkRevenue = async (req, res) => {
    try {
        const admin = await req.admin;
        const adminId = admin._id;

        // Check if admin exist
        const adminDetails = await Admin.findById(adminId);
        if (!adminDetails) {
            return res.status(400).json({
                status: 'error',
                statusCode: 400,
                message: 'Admin does not exist'
            });
        }

        // Get total AMOUNT OF WALLET TOTAL EARNINGS
        const totalWalletEarnings = await Wallet.find();
        const totalWalletEarningsCount = await totalWalletEarnings.length;
        
        let totalWalletEarningsAmount = 0;
    
        for (let i = 0; i < totalWalletEarningsCount; i++) {
            totalWalletEarningsAmount += totalWalletEarnings[i].total_earnings;
        }


        res.status(200).json({
            status: 'success',
            statusCode: 200,
            message: 'Total wallet earnings retrieved successfully',
            total: totalWalletEarningsCount,
            data: {
                total_revenue: totalWalletEarningsAmount
            }
        });
        

        
        // const CompletedOrders = await OrderModel.find({
        //     order_status: 'dropped_off'
        // });
        // const orders = await CompletedOrders;
        // const amounts = orders.amount;
        // let sum = 0;

        // for (let i = 0; i < amounts.length; i++) {
        //     sum += array[i];
        // }
        // console.log(sum);

        // Get Total Amount Of Completed Orders

    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: 'error',
            statusCode: 500,
            message: 'Internal Server Error',
        });

    }
}





module.exports = admin;
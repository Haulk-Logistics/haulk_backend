const jwt = require('jsonwebtoken');
const User = require('../models/user.model');


module.exports.isAuthorized = async (req, res, next) => {
    try {
        // The token wil  be placed in the authorization header and will have the Bearer prefix, thats why we need to split it and get the token
        const token = req.headers.authorization.split(' ')[1];

        // Confitm, that the tokKEN IS IN THE HEADER
        if (token === undefined) {
            return res.status(404).json({
                status: 'error',
                statusCode: 404,
                message: 'Token not found in the header'
            });
        }

        console.log(token);

        const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);

        // cofirm that the token is valid
        if (!decodedToken) {
            return res.status(401).json({
                status: 'error',
                statusCode: 401,
                message: 'Token is not valid'
            });
        };

        const userId = decodedToken._id;

        // Check if user id exist in th User database
        const user = await User.findById(userId);
        console.log(user);
        if (!user) {
            return res.status(401).json({
                status: 'error',
                statusCode: 401,
                message: 'Unauthorized Request! Sign In Or SignUp!. If you are already signed in, please logout and login again. Else you are not allowed to make request this endpoint'
            });
        } else {
            next();
        }
    } catch {
        res.status(500).json({
            status: 'error',
            statusCode: 500,
            message: 'Internal Server Error'
        });
    }


}

// Confirm User is a truck driver
module.exports.isTruckDriver = async (req, res, next) => {
    try {
        // The token wil  be placed in the authorization header and will have the Bearer prefix, thats why we need to split it and get the token
        const token = req.headers.authorization.split(' ')[1];

        // Confitm, that the tokKEN IS IN THE HEADER
        if (token === undefined) {
            return res.status(404).json({
                status: 'error',
                statusCode: 404,
                message: 'Token not found in the header'
            });
        }

        console.log(token);

        const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);

        // cofirm that the token is valid
        if (!decodedToken) {
            return res.status(401).json({
                status: 'error',
                statusCode: 401,
                message: 'Token is not valid'
            });
        };

        const userId = decodedToken._id;

        // Check if user id exist in th User database
        const user = await User.findById(userId);
        console.log(user);
        if (!user) {
            return res.status(401).json({
                status: 'error',
                statusCode: 401,
                message: 'User with this token was not found'
            });
        } else {
            if (user.role === 'truckDriver') {
                next();
            } else {
                return res.status(401).json({
                    status: 'error',
                    statusCode: 401,
                    message: 'Unauthorized Access! You are not a truck driver.'
                });
            }
        }
    } catch {
        res.status(500).json({
            status: 'error',
            statusCode: 500,
            message: 'Internal Server Error'
        });
    }
}

// Confirm User is a cargo owner
module.exports.isCargoOwner = async (req, res, next) => {
    try {
        // The token wil  be placed in the authorization header and will have the Bearer prefix, thats why we need to split it and get the token
        const token = req.headers.authorization.split(' ')[1];

        // Confirm, that the tokEN IS IN THE HEADER
        if (token === undefined) {
            return res.status(404).json({
                status: 'error',
                statusCode: 404,
                message: 'Token not found in the header'
            });
        }

        console.log(token);

        const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);

        // cofirm that the token is valid
        if (!decodedToken) {
            return res.status(401).json({
                status: 'error',
                statusCode: 401,
                message: 'Token is not valid'
            });
        };

        const userId = decodedToken._id;

        // Check if user id exist in th User database
        const user = await User.findById(userId);
        console.log(user);
        if (!user) {
            return res.status(401).json({
                status: 'error',
                statusCode: 401,
                message: 'Unauthorized Request! Sign In Or SignUp!. If you are already signed in, please logout and login again. Else you are not allowed to make request to this endpoint'
            });
        } else {
            if (user.userType === 'cargoOwner') {
                next();
            } else {
                return res.status(401).json({
                    status: 'error',
                    statusCode: 401,
                    message: 'Unauthorized Request! You are not a cargo owner. If you are already signed in, please logout and login again. Else you are not allowed to make request this endpoint'
                });
            }
        }
    } catch {
        res.status(500).json({
            status: 'error',
            statusCode: 500,
            message: 'Internal Server Error'
        });
    }
}
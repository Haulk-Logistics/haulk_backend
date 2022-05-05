const Driver = require("../models/driver.model");
const Wallet = require("../models/driver_wallet.model");

const walletController = {};

// Driver See total amount of money earned
// walletController.totalEarnings = async (req, res) => {
//  try {
//     const user = req.user;
//     const driver = await Driver.findOne({ userDetails: user._id });
//     const wallet = await Wallet.findOne({ user: user._id });

//     if (!driver) {
//         return res.status(404).json({
//             status: "error",
//             message: "Driver not found"
//         });
//     }

//     if (!wallet) {
//         return res.status(404).json({
//             status: "error",
//             message: "Wallet not found"
//         });
//     }



//     return res.status(200).json({
//         status: "success",
//         statusCode: 200,
//         message: "Total Earnings",
//         data: {
//             total_earnings: totalEarnings
//         }
//     });
    
    
//  } catch (err) {
//     console.log(err.message);
//     return res.status(500).json({
//         status: "error",
//         statusCode: 500,
//         message: "Server error"
//     });
//  }
// };

// Driver See wallet Balance
// walletController.walletBalance = async (req, res) => {};

// Amount that can be withdrawn by the driver
walletController.withdrawableBalance = async (req, res) => {
    try {
        const user = req.user;
        const wallet = await Wallet.findOne({ user: user._id });
        if (!wallet) {
            return res.status(404).json({
                status: "error",
                message: "Wallet not found"

            });
        }
         // USER WITHDRAWABLE BALANCE
        const withdrawableBalance = wallet.withdrawableBalance;
        return res.status(200).json({
            status: "success",
            statusCode: 200,
            message: "Withdrawable Balance",
            data: {
                withdrawable_balance: withdrawableBalance
            }
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            status: "error",
            statusCode: 500,
            message: "Server error"
        });
    }
};

// Driver See Transaction History
// walletController.transactionHistory = async (req, res) => {};

// Driver Withdraw From Wallet
walletController.withdraw = async (req, res) => {};

module.exports = walletController;
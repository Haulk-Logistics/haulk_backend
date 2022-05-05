const express = require('express');
const walletController = require('../../controllers/wallet.controller');
const { isAuthorized, isTruckDriver } = require('../../middlewares/auth.middlewares');
const router = express.Router();

// Get truck driver total earnings
// router.get('/total_earnings', isAuthorized, isTruckDriver, walletController.totalEarnings);

// Get truck driver wallet balance
// router.get('/wallet_balance', isAuthorized, isTruckDriver, walletController.walletBalance);

// Get truck driver withdrawable balance
router.get('/withdrawable_balance', isAuthorized, isTruckDriver, walletController.withdrawableBalance);

// Get truck driver transaction history
// router.get('/transaction_history', isAuthorized, isTruckDriver, walletController.transactionHistory);

// Truck driver withdraws money from wallet (Thier earnings)
// router.put('/withdraw', isAuthorized, isTruckDriver, walletController.withdraw);

module.exports = router;

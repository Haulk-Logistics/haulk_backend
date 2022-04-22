const express = require('express');
const driverController = require('../../controllers/truck_driver_controller');
const { isAuthorized, isTruckDriver } = require('../../middlewares/auth.middlewares');
const router = express.Router();

router.get('/seeOpenOrders', isAuthorized, isTruckDriver, driverController.seeOpenOrders);

module.exports = router;
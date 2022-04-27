const express = require('express');
const driverController = require('../../controllers/truck_driver_controller');
const { isAuthorized, isTruckDriver } = require('../../middlewares/auth.middlewares');
const router = express.Router();

// drivers sees all open orders specific to truck type 
router.get('/seeopenorders', isAuthorized, isTruckDriver, driverController.seeOpenOrders);

// drivers accept a particular order
router.put('/acceptorder/:id', isAuthorized, isTruckDriver, driverController.acceptOrder);



module.exports = router;
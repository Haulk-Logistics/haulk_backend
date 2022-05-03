const express = require('express');
const driverController = require('../../controllers/truck_driver_controller');
const { isAuthorized, isTruckDriver } = require('../../middlewares/auth.middlewares');
const router = express.Router();

// drivers sees all open orders specific to truck type 
router.get('/seeopenorders', isAuthorized, isTruckDriver, driverController.seeOpenOrders);

// drivers accept a particular order
router.put('/acceptorder/:id', isAuthorized, isTruckDriver, driverController.acceptOrder);

// driver views his profile
router.get('/view_profile', isAuthorized, isTruckDriver, driverController.viewProfile);

// driver views activeOrder
router.get('/active_order', isAuthorized, isTruckDriver, driverController.activeOrder);

// driver views order_history
router.get('/order_history', isAuthorized, isTruckDriver, driverController.orderHistory);

// driver updates order status
router.put('/update_order_status/:id', isAuthorized, isTruckDriver, driverController.updateOrderStatus);



module.exports = router;
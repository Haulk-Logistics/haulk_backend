const router = require("express").Router();
const cargoOwnerController = require("../../controllers/cargoowner.controller");
const {
  isAuthorized,
  isCargoOwner,
} = require("../../middlewares/auth.middlewares");

router.get(
  "/order_history",
  isAuthorized,
  isCargoOwner,
  cargoOwnerController.getOrderHistory
);
router.get(
  "/active_orders",
  isAuthorized,
  isCargoOwner,
  cargoOwnerController.getActiveOrder
);
router.get(
  "/profile",
  isAuthorized,
  isCargoOwner,
  cargoOwnerController.getProfile
);

module.exports = router;

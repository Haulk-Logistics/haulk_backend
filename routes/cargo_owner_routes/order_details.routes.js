const router = require("express").Router();
const cargoOwnerController = require("../../controllers/cargoowner.controller");
const {
  isAuthorized,
  isCargoOwner,
} = require("../../middlewares/auth.middlewares");

// cargowner order histroy route
router.get(
  "/order_history",
  isAuthorized,
  isCargoOwner,
  cargoOwnerController.getOrderHistory
);

// cargoowner active order route
router.get(
  "/active_orders",
  isAuthorized,
  isCargoOwner,
  cargoOwnerController.getActiveOrder
);


// cargoowner all orders route
router.get(
  "/all_orders",
  isAuthorized,
  isCargoOwner,
  cargoOwnerController.getAllOrders
);

//  get specific cargoowner order
router.get(
  "/order/:id",
  isAuthorized,
  isCargoOwner,
  cargoOwnerController.getEachOrder
);


// cargowner view profile route
router.get(
  "/profile",
  isAuthorized,
  isCargoOwner,
  cargoOwnerController.getProfile
);



module.exports = router;

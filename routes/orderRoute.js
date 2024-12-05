const express = require("express");
const {
  createOrderController,
  verifyPaymentController,
  getUserOrdersController,
  getAllOrdersController,
  updateOrderStatusController,
} = require("../controllers/orderController");
const { requireSignIn } = require("../middlewares/authMiddlewares");

const router = express.Router();

router.post("/create-order", createOrderController)
router.post("/verify-payment", verifyPaymentController)
router.get("/get-single-user-order/:userId", getUserOrdersController)

router.get("/get-all-orders", getAllOrdersController)

router.put("/update-order-status/:id", updateOrderStatusController)



// router.post("/order-place", requireSignIn, orderPlaceController);

// router.post("/get-single-cid-order", getsingleCidOrder);

// router.post("/get-one-status-order", requireSignIn, getallOrderOnOneStatus);

// router.put("/change-order-status", requireSignIn, orderStatusChange);

// router.put("/cancel-status", requireSignIn, orderCancelStatusChange);

module.exports = router;
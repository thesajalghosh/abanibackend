const Razorpay = require('razorpay');
const crypto = require('crypto');
const Orders = require('../models/orderModel'); // Import the Order model

// This razorpayInstance will be used to access any resource from razorpay
const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY,  // Replace with your key_id
  key_secret: process.env.RAZORPAY_KEY_SECRET  // Replace with your key_secret
});

const createOrderController = async (req, res) => {
  try {


    // STEP 1:
    const { amount, currency, receipt, notes } = req.body;

    //  STEP 2:    
    razorpayInstance.orders.create({ amount, currency, receipt, notes },
      (err, order) => {
        // STEP 3 & 4: 
        if (!err) {


          return res.json(order);
        } else {
          return res.status(500).send(err);
        }
      }
    );

  } catch (error) {

    return res.status(500).send({
      success: false,
      error,
      message: "Error in order creation",
    });
  }
}
const verifyPaymentController = async (req, res) => {

  try {
    console.log("cal................")
    const { order_id, payment_id, signature, user, items, address, bookingDate, timeSlot, paymentMode } = req.body;

    console.log("req,body", items)
    console.log("user", user)


    // Generate the signature from the received data
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(order_id + "|" + payment_id)
      .digest('hex');

    // Compare the generated signature with the received signature

    console.log("generatedSignature", generatedSignature, signature)
    if (generatedSignature === signature) {
      // Signature is valid, save order to database

      // Calculate the total price from the items
      const totalPrice = items.reduce((total, item) => total + item.price * item.buyqun, 0);
      console.log("totalPrice", totalPrice)
      const newOrder = new Orders({
        user: user, // Assuming `user` contains user data
        items: items.map(item => ({
          product: item._id,
          quantity: item.buyqun,
          price: item.price,
        })),
        totalPrice: totalPrice,
        address: {
          addressLine1: address.address1,
          addressLine2: address.address2,
          addressLine3: address.address3,
          landmark: address.landmark,
          pincode: address.pincode,
        },
        bookingDate: bookingDate,
        timeSlot: timeSlot,
        paymentMode: paymentMode,
        paymentStatus: 'completed', // Payment is successful
      });
      console.log("newOrder", newOrder)
      //     const result =  await newOrder.save();
      // console.log("calll333333333333333333333", result)
      //       return res.status(200).json({ message: 'Payment verification and order saving successful', order: newOrder });
      try {
        const savedOrder = await newOrder.save();
        console.log("calll.......", savedOrder)
        return res.status(200).json({ 
          message: 'Payment verification and order saving successful',
           order: savedOrder ,
           items:items,
          });
      } catch (saveError) {
        console.error("Error saving order:", saveError); // Log the error
        return res.status(500).json({ message: 'Error saving order', error: saveError.message });
      }
    } else {
      // Signature is invalid, respond with error
      return res.status(400).json({ message: 'Payment verification failed' });
    }
  } catch (error) {
    console.log("callll 2222222222222")
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};
const getAllOrdersController = async (req, res) => {
  try {
    // Fetch all orders from the database
    const orders = await Orders.find({}).populate("user").populate("items.product");

    // Respond with the orders
    return res.status(200).json({
      success: true,
      message: "getting all orders successfully",
      orders,
    });
  } catch (error) {

    return res.status(500).json({
      success: false,
      message: 'Error in fetching orders',
      error,
    });
  }
};
const getUserOrdersController = async (req, res) => {
  try {
    const userId = req.params.userId; // Assuming user ID is passed as a URL parameter

    // Fetch orders specific to the user from the database
    const orders = await Orders.find({ user: userId }).populate('items.product');

    // Check if orders are found
    if (!orders.length) {
      return res.status(404).json({
        success: false,
        message: 'No orders found for this user',
      });
    }

    // Respond with the user's orders
    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {

    return res.status(500).json({
      success: false,
      message: 'Error in fetching user orders',
      error,
    });
  }
};

const updateOrderStatusController = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const update_status_data = await Orders.findByIdAndUpdate(
      id,
      { $set: { orderStatus: status } },
      { new: true }
    )


    return res.status(200).json({
      success: true,
      message: "in order status update successfully",
      update_status_data,
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: 'Error in update status orders',
      error,
    });
  }
}

const createOrderCashPaymentController = async (req, res) => {
  console.log("req.body", req.body)
  try {
    const { user, items, address, bookingDate, timeSlot, paymentMode } = req.body;

    console.log("user", user)


    // Calculate the total price from the items
    const totalPrice = items.reduce((total, item) => total + item.price * item.buyqun, 0);

    const newOrder = new Orders({
      user: user,
      items: items.map(item => ({
        product: item._id,
        quantity: item.buyqun,
        price: item.price,
      })),
      totalPrice: totalPrice,
      address: {
        addressLine1: address.address1,
        addressLine2: address.address2,
        addressLine3: address.address3,
        landmark: address.landmark,
        pincode: address.pincode,
      },
      bookingDate: bookingDate,
      timeSlot: timeSlot,
      paymentMode: paymentMode,
      paymentStatus: 'pending',
    });

    await newOrder.save();

    res.status(200).send({
      message: "successfully create cash order",
      success: true,
      order: { order: newOrder, items: items }
    })

  } catch (error) {
    console.log("error", error)
    res.status(400).send({
      message: "error in order controller",
      success: false,
      error
    })



  }

}



module.exports = {
  createOrderController,
  verifyPaymentController,
  getAllOrdersController,
  getUserOrdersController,
  updateOrderStatusController,
  createOrderCashPaymentController
}

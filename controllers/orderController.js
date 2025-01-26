const Razorpay = require('razorpay');
const crypto = require('crypto');
const Orders = require('../models/orderModel'); // Import the Order model

// This razorpayInstance will be used to access any resource from razorpay
const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY,  // Replace with your key_id
  key_secret: process.env.RAZORPAY_KEY_SECRET  // Replace with your key_secret
});

// const createOrderController = async (req, res) => {
//   try {


//     // STEP 1:
//     const { amount, currency, receipt, notes } = req.body;

//     //  STEP 2:    
//     razorpayInstance.orders.create({ amount, currency, receipt, notes },
//       (err, order) => {
//         // STEP 3 & 4: 
//         if (!err) {


//           return res.json(order);
//         } else {
//           return res.status(500).send(err);
//         }
//       }
//     );

//   } catch (error) {

//     return res.status(500).send({
//       success: false,
//       error,
//       message: "Error in order creation",
//     });
//   }
// }


const createOrderController = async (req, res) => {
  try {
    const { amount, currency, receipt,notes, user, items, address, bookingDate, timeSlot, paymentMode, address1, address2, address3, landmark, pincode, slot } = req.body;
console.log("req.body", req.body)
    console.log("items", items)
    // Create order in Razorpay
    let razorpay_id_for_send = null
    razorpayInstance.orders.create({ amount, currency, receipt, notes }, async (err, order) => {
      if (!err) {
        // Save order to database with payment status 'pending'
        razorpay_id_for_send= order.id
        const newOrder = new Orders({
          user: user, // Assuming `user` contains user data
          items: items.map(item => ({
            product: item._id,
            quantity: item.buyqun,
            price: item.price,
          })),
          totalPrice: amount / 100, // Assuming amount is in paise
          address: {
            addressLine1: address1,
            addressLine2: address2,
            addressLine3: address3,
            landmark: landmark,
            pincode: pincode,
          },
          bookingDate: bookingDate,
          timeSlot: slot,
          paymentMode: paymentMode,
          paymentStatus: 'pending', // Payment is pending
          razorpayOrderId: order.id, // Save Razorpay order ID for reference
        });

        try {
          const savedOrder = await newOrder.save();
          return res.status(200).json({
             message: 'Order created successfully', 
            order: newOrder, razorpay_id_for_send:razorpay_id_for_send 
          });
        } catch (saveError) {
          console.error("Error saving order:", saveError); // Log the error
          return res.status(500).json({ message: 'Error saving order', error: saveError.message });
        }
      } else {

        return res.status(500).send(err);
      }
    });
  } catch (error) {
    console.log("error", error)
    return res.status(500).send({
      success: false,
      error,
      message: "Error in order creation",
    });
  }
};


// const verifyPaymentController = async (req, res) => {

//   try {
  
//     const { order_id, payment_id, signature, user, items, address, bookingDate, timeSlot, paymentMode } = req.body;



//     // Generate the signature from the received data
//     const generatedSignature = crypto
//       .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
//       .update(order_id + "|" + payment_id)
//       .digest('hex');

//     // Compare the generated signature with the received signature

//     if (generatedSignature === signature) {
//       // Signature is valid, save order to database

//       // Calculate the total price from the items
//       const totalPrice = items.reduce((total, item) => total + item.price * item.buyqun, 0);
  
//       const newOrder = new Orders({
//         user: user, // Assuming `user` contains user data
//         items: items.map(item => ({
//           product: item._id,
//           quantity: item.buyqun,
//           price: item.price,
//         })),
//         totalPrice: totalPrice,
//         address: {
//           addressLine1: address.address1,
//           addressLine2: address.address2,
//           addressLine3: address.address3,
//           landmark: address.landmark,
//           pincode: address.pincode,
//         },
//         bookingDate: bookingDate,
//         timeSlot: timeSlot,
//         paymentMode: paymentMode,
//         paymentStatus: 'completed', // Payment is successful
//       });
   
//       //     const result =  await newOrder.save();
//       // console.log("calll333333333333333333333", result)
//       //       return res.status(200).json({ message: 'Payment verification and order saving successful', order: newOrder });
//       try {
//         const savedOrder = await newOrder.save();
       
//         return res.status(200).json({ 
//           message: 'Payment verification and order saving successful',
//            order: savedOrder ,
//            items:items,
//           });
//       } catch (saveError) {
//         console.error("Error saving order:", saveError); // Log the error
//         return res.status(500).json({ message: 'Error saving order', error: saveError.message });
//       }
//     } else {
//       // Signature is invalid, respond with error
//       return res.status(400).json({ message: 'Payment verification failed' });
//     }
//   } catch (error) {
 
//     return res.status(500).json({ message: 'Internal Server Error' });
//   }
// };

const verifyPaymentController = async (req, res) => {
  try {
    const { order_id, payment_id, signature, items, mongo_order_id } = req.body;

    // Generate the signature from the received data
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(order_id + "|" + payment_id)
      .digest('hex');
console.log("generatedSignature", generatedSignature, signature)
    // Compare the generated signature with the received signature
    if (generatedSignature === signature) {
      // Signature is valid, update payment status to 'completed'
      try {
        const updatedOrder = await Orders.findOneAndUpdate(
          { _id: mongo_order_id },
          { $set: { paymentStatus: 'completed' } },
          { new: true }
        );
console.log("updatedOrder", updatedOrder)
        if (!updatedOrder) {
          return res.status(404).json({ message: 'Order not found' });
        }

        return res.status(200).json({ 
          message: 'Payment verification and order update successful',
          order: updatedOrder,
          items: items,
        });
      } catch (saveError) {
        console.error("Error updating order:", saveError); // Log the error
        return res.status(500).json({ message: 'Error updating order', error: saveError.message });
      }
    } else {
      // Signature is invalid, respond with error
      console.log("calll 1111")
      return res.status(400).json({ message: 'Payment verification failed' });
    }
  } catch (error) {
    console.log("error", error)
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
    const orders = await Orders.find({ user: userId }).populate('items.product').sort({ createdAt: -1 });

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

  try {
    const { user, items, address, bookingDate, timeSlot, paymentMode } = req.body;


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

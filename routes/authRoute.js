const express = require("express");
const { registerController, loginController, checkUserExistController, createAccountController } = require("../controllers/authController");


const authRouter = express.Router();


authRouter.post("/register", registerController)

authRouter.post("/login", loginController)

authRouter.post("/check-user", checkUserExistController);
authRouter.post("/create-account", createAccountController);



module.exports = authRouter;
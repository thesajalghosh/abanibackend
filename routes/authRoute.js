const express = require("express");
const { registerController, checkUserExistController, createAccountController, adminLoginController } = require("../controllers/authController");


const authRouter = express.Router();


authRouter.post("/register", registerController)

authRouter.post("/admin-login", adminLoginController)

authRouter.post("/check-user", checkUserExistController);
authRouter.post("/create-account", createAccountController);



module.exports = authRouter;
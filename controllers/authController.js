const { hashPassword, comparePassword } = require("../helpers/authHelper")
const userModel = require("../models/userModel")
const jwt = require("jsonwebtoken")


const registerController = async (req, res) => {
    try {
        console.log(req.body);

        const existingUser = await userModel.findOne({ email: req.body.email });

        if (existingUser) {
            return res.status(200).send({
                success: true,
                message: "Account already exists",
            });
        }

        const hashedPassword = await hashPassword(req.body.password);

        const user = new userModel({ ...req.body, password: hashedPassword });
        await user.save();

        res.status(200).send({
            success: true,
            message: "Successfully registered",
            user,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error in registration",
        });
    }
};

module.exports = registerController;


const loginController = async (req, res) => {
    try {
        const { email, password, role } = req.body;
        console.log("Login request body:", req.body);

        if (!email || !password) {
            return res.status(400).send({
                success: false,
                message: "Email and password are required",
            });
        }

        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).send({
                success: false,
                message: "Email is not registered",
            });
        }

        // Check password
        const match = await comparePassword(password, user.password);
        if (!match) {
            return res.status(401).send({
                success: false,
                message: "Incorrect password",
            });
        }

        // If role is provided, check role
        if (role && user.role !== Number(role)) {
            return res.status(403).send({
                success: false,
                message: "Role does not match",
            });
        }

        console.log(process.env.JWT_SECRET)
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });

        res.status(200).send({
            success: true,
            message: "Successfully logged in",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role, // Include role in the response
            },
            token,
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).send({
            success: false,
            message: "Error in login",
            error: error.message,
        });
    }
};



 module.exports = {
     registerController,
     loginController
 }
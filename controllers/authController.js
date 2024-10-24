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
        // console.log("Login request body:", req.body);

        // Validate email and password
        if (!email || !password) {
            throw new Error("Email and password are required");
        }

        // Find user by email
        const user = await userModel.findOne({ email });
        if (!user) {
            throw new Error("Email is not registered");
        }

        // Check password
        const match = await comparePassword(password, user.password);
        if (!match) {
            throw new Error("Incorrect password");
        }

        // Check role if provided
        if (role && user.role !== Number(role)) {
            throw new Error("Role does not match");
        }

        // Generate JWT token
        console.log(process.env.JWT_SECRET);
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });

        // Return success response
        return res.status(200).send({
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
        // Handle all errors here
        console.error("Login Error:", error);
        return res.status(500).send({
            success: false,
            message: error.message || "Error in login",
            error: error.message,
        });
    }
};




 module.exports = {
     registerController,
     loginController
 }
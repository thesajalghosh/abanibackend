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


const adminLoginController = async (req, res) => {
    try {
        const { name, phone, role } = req.body;


        if (!name || !phone || !role) {
            throw new Error("name and phone and role are required");
        }

        // Find user by phone
        const user = await userModel.findOne({ phone });
        if (!user) {
            throw new Error("phone is not registered");
        }

       if(user.name !== name){
        throw new Error("name does not match");
       }

        // Check role if provided
        if (role && user.role !== Number(role)) {
            throw new Error("Role does not match");
        }

        // Generate JWT token
        console.log(process.env.JWT_SECRET);
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "90d",
        });

        // Return success response
        return res.status(200).send({
            success: true,
            message: "Successfully logged in",
            user: {
                id: user._id,
                name: user.name,
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


const checkUserExistController = async(req,res)=>{
    try {
        const {phone} = req.body
        const user = await userModel.findOne({phone})
        console.log("user", user)
        let token="";
        if(user){
            token = jwt.sign({ _id: phone }, process.env.JWT_SECRET, {
                expiresIn: "7d",
            });
        }
        if(!user){
            return res.status(200).send({
                success: true,
                message: "user not found",
                userExist:false
               
            });
        }else {
            return res.status(200).send({
                success: true,
                message: "user found",
                userExist:true,
                user,
                token
               
            });
        }
        
    } catch (error) {
       
        return res.status(500).send({
            success: false,
            message: error.message || "Error in user find",
            error: error.message,
        });
    }
}

const createAccountController = async(req, res)=>{
try {
    const {phone, name} = req.body
    token = jwt.sign({ _id: phone}, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });
    const newUser = new userModel({phone, name})

    await newUser.save()

    return res.status(200).send({
        success: true,
        message: "Account created successfully",
       user: newUser,
       token
    });
    
} catch (error) {
    return res.status(500).send({
        success: false,
        message: error.message || "Error in user find",
        error: error.message,
    });
}
}




 module.exports = {
     registerController,
     adminLoginController,
     checkUserExistController,
     createAccountController
 }
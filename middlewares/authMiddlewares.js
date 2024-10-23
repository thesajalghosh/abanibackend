const userModel = require("../models/userModel")

const jwt = require("jsonwebtoken")


const requireSignIn = async (req, res, next)=>{
    try {
        const decode = jwt.verify(req.headers.authorization.split("")[1], process.env.JWT_SECRET)

        req.user = decode;
        next();
        
    } catch (error) {
        console.log(error)
    }
}

const isAdmin = async()=>{
    try {
        const user = await userModel.findById(req.user._id)
        if(user.role === 0)
        {
            return res.status(401).send({
                success:false,
                message: "Unauthorized Access",

            })
        }else{
            next();
        }
    } catch (error) {
        return res.status(401).send({
            success:false,
            message:"Error in Admin middleware",
            error
        })
        
    }
}

module.exports = {requireSignIn, isAdmin}
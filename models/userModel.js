const mongoose = require("mongoose")

const userSchema = new mongoose.Schema(
    {
        name: {type:String},
        email: {type:String},
        password: {type:String},
        phone:{type:String},
        role:{type:Number,
        default:0}

    },
    {timestamps:true}
)

module.exports = mongoose.model("users", userSchema)
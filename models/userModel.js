const mongoose = require("mongoose")

const userSchema = new mongoose.Schema(
    {
        name: {
            type:String,
            required:true
        },
        phone:{
            type:Number,
            required:true,
        },
        role:{
            type:Number,
        default:0}

    },
    {timestamps:true}
)

module.exports = mongoose.model("users", userSchema)
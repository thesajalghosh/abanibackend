const mongoose = require("mongoose")

const popularProductSchema = new mongoose.Schema(
    {
        product:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        }
    },
    {timestamps: true}
)

module.exports = mongoose.model("PopularProduct", popularProductSchema)
const mongoose = require("mongoose")

const connectDB = async()=>{
    try {
        const connect = await mongoose.connect("mongodb+srv://thesajalghoshlive:theabani@cluster0.mwdlrrm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")

        console.log("database is connected")
        
    } catch (error) {
        console.log(error)
      
        
    }
}

module.exports = {connectDB};
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { connectDB } = require("./config/db");
const authRoute = require("./routes/authRoute");
const categoryroute = require("./routes/categoryRoute")
const productRoute = require("./routes/productRoute");
const orderRoute = require("./routes/orderRoute")

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to database
connectDB();

// Routes
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/category", categoryroute);
app.use("/api/v1/product", productRoute);
app.use("/api/v1/order", orderRoute)


app.get("/", (req, res) => {
    res.send("<h1>Welcome to the hair service app</h1>");
});
console.log("sajal",process.env.PORT)
// Define the port
const PORT = process.env.PORT || 4000;

// Start the server with error handling
const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

server.on('error', (error) => {
    console.error('Server error:', error);
});

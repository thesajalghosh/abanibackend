const express = require("express");
const { requireSignIn, isAdmin } = require("../middlewares/authMiddlewares");
const {createCategoryController, categoryController} = require("../controllers/categoryController")
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '..', 'uploads');
    console.log(uploadPath)
    cb(null, uploadPath); // Specify the upload directory
  },
  filename: function (req, file, cb) {
    console.log("file.originalname", file.originalname)
    cb(null, file.originalname); // Use the original filename
  },
});

const upload = multer({ storage: storage });

const router = express.Router();

//routes

//create category
router.post(
  "/create-category",
  upload.single("photo"),
  createCategoryController
);
router.get("/get-all-category", categoryController)




module.exports = router;

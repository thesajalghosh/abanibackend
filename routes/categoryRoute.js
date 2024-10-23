const express = require("express");
const { requireSignIn, isAdmin } = require("../middlewares/authMiddlewares");
const {
  createCategoryController,
  updateCategoryController,
  categoryController,
  singleCategoryController,
  categoryDeleteController,
  getCategoryPhotoController,
} = require("../controllers/CategoryController");
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

//update category
router.put(
  "/update-category/:id",
  requireSignIn,
  isAdmin,
  updateCategoryController
);

//get category photo
router.get("/get-category-photo/:cid", getCategoryPhotoController);

//get all category
router.get("/get-all-category", categoryController);

//get single category
router.get("/single-category/:slug", singleCategoryController);

//deleting category
router.delete(
  "/delete-category/:id",
  requireSignIn,
  isAdmin,
  categoryDeleteController
);

module.exports = router;

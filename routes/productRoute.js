const express = require("express");
const { requireSignIn, isAdmin } = require("../middlewares/authMiddlewares");
const {
  createProductController,
  getProductController,
  getSingleProductController,
  getPhotoController,
  deleteProductController,
  updateProductController,
  productFilterController,
  productCountController,
  productListController,
  searchProductController,
  reletedProduct,
  categoryProduct,
  addPopularProductController,
  getAllPopularProductController,
  deletePopulerProductController,
} = require("../controllers/productController");
const multer = require("multer");

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Specify the upload directory
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Use the original filename
  },
});

const upload = multer({ storage: storage });

//routes
router.post(
  "/create-product",
//   requireSignIn,
//   isAdmin,
  upload.single("photo"),
  createProductController
);
//update product routes
router.put(
  "/update-product/:pid",
  requireSignIn,
  isAdmin,
  upload.single("photo"),
  updateProductController
);

//get products
router.get("/get-product", getProductController);

//single product
router.get("/get-product/:pid", getSingleProductController);

//delete product
router.delete("/delete-product/:pid", deleteProductController);

//filter Product
router.post("/product-filter", productFilterController);

//count prosuct
router.get("/product-count", productCountController);

//product per page
router.get("/product-list/:page", productListController);

//Search Product
router.get("/search/:keyword", searchProductController);

//similar product
router.get("/related-product/:pid/:cid", reletedProduct);

//category product
router.get("/category-product/:cid", categoryProduct);

// category wise product
router.get("/product-catagory/:id");

// this route for making some product popular

router.post("/mark-popular-product", addPopularProductController)

router.get("/all-popular-product", getAllPopularProductController)

router.delete("/delete-mark-element/:id", deletePopulerProductController)

module.exports = router;
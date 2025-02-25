const slugify = require("slugify");
const productModel = require("../models/productModel");
const fs = require("fs");
const categoryModel = require("../models/categoryModel");
const { uploadingImage } = require("../helpers/uploadingImage");
const popularProductModel = require("../models/popularProductModel");
const mongoose = require("mongoose");

const createProductController = async (req, res) => {
  try {
    const { name, description, price, category, quantity } = req.body;
    const photo = req.file;

    const result = await uploadingImage(photo.path);
    //validation
    console.log(result.secure_url);
    switch (true) {
      case !name:
        return res.status(500).send({ error: "Name is Required" });
      case !description:
        return res.status(500).send({ error: "description is Required" });
      case !price:
        return res.status(500).send({ error: "price is Required" });
      case !category:
        return res.status(500).send({ error: "category is Required" });
      case !quantity:
        return res.status(500).send({ error: "quantity is Required" });
    }
    const products = new productModel({ ...req.body, url: result.secure_url });

    await products.save();
    res.status(201).send({
      success: true,
      message: "product Create Successfully",
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in creating product",
    });
  }
};

// update product controller
const updateProductController = async (req, res) => {
  try {
    // console.log(req.fields,"fields");
    const { name, description, price, category, quantity } = req.fields;
    console.log(name, description, price, category, quantity, "field");
    const { photo } = req.files;
    console.log(photo, "files");

    //validation
    switch (true) {
      case !name:
        return res.status(500).send({ error: "Name is Required" });
      case !description:
        return res.status(500).send({ error: "description is Required" });
      case !price:
        return res.status(500).send({ error: "price is Required" });
      case !category:
        return res.status(500).send({ error: "category is Required" });
      case !quantity:
        return res.status(500).send({ error: "quantity is Required" });

      // case !shipping:
      //   return res.status(500).send({ error: "shipping is Required" });
      case photo & (photo.size > 100000):
        return res
          .status(500)
          .send({ error: "photo is Required should be 1 MB" });
    }
    const products = await productModel.findByIdAndUpdate(
      req.params.pid,
      {
        ...req.fields,
        slug: slugify(name),
      },
      { new: true }
    );
    if (photo) {
      products.photo.data = fs.readFileSync(photo.path);
      products.photo.contentType = photo.type;
    }
    await products.save();
    res.status(201).send({
      success: true,
      message: "product updateSuccessfully",
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in update product api",
    });
  }
};

const getProductController = async (req, res) => {
  try {
    const products = await productModel
      .find({})
      .populate("category")
      .select("-photo")
      .limit(12)
      .sort({ createdAt: -1 });

    res.status(200).send({
      success: true,
      totalCount: products.length,
      message: "All Products",
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in get product controller",
    });
  }
};

//get single product
const getSingleProductController = async (req, res) => {
  try {
    const product = await productModel
      .find({ _id: req.params.pid })
      .select("-photo")
      .populate("category");
    res.status(200).send({
      success: true,
      message: "single product fetched",
      product,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: true,
      message: "error in get single product api",
      error,
    });
  }
};

//get photo
const getPhotoController = async (req, res) => {
  try {
    const product = await productModel.findById(req.params.pid).select("photo");
    if (product.photo.data) {
      res.set("content-type", product.photo.contentType);
      return res.status(200).send(product.photo.data);
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "error in get photo controller",
      error,
    });
  }
};

//delete product

const deleteProductController = async (req, res) => {
  try {
    await productModel.findByIdAndDelete(req.params.pid).select("-photo");
    res.status(200).send({
      success: true,
      message: "product deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "error in delete api",
      error,
    });
  }
};

const productFilterController = async (req, res) => {
  try {
    const { checked, radio } = req.body;
    console.log(checked, radio);

    let args = {};
    if (checked.length > 0) args.category = checked;
    if (radio.length > 0) args.price = { $gte: radio[0], $lte: radio[1] };

    const products = await productModel.find(args);
    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error while filtering product",
      error,
    });
  }
};
// product count
const productCountController = async (req, res) => {
  try {
    const total = await productModel.find({}).estimatedDocumentCount();
    res.status(200).send({
      success: true,
      total,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      message: "Error in product count",
      error,
      success: false,
    });
  }
};

//product list base on page
const productListController = async (req, res) => {
  try {
    const perPage = 2;
    const page = req.params.page ? req.params.page : 1;
    const products = await productModel
      .find({})
      .select("-photo")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: -1 });

    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      error,
    });
  }
};

const searchProductController = async (req, res) => {
  try {
    const { keyword } = req.params;
    console.log(keyword);
    const query = {
      $or: [{ name: "keyword" }, { description: "keyword" }],
    };
    const results = await productModel.find({
      $or: [
        { name: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
      ],
    });
    // const results = await productModel.find(query);
    res.json(results);
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error in Search Product API",
      error,
    });
  }
};

const reletedProduct = async (req, res) => {
  try {
    const { pid, cid } = req.params;
    const products = await productModel
      .find({
        category: cid,
        _id: { $ne: pid },
      })
      .select("-photo")
      .limit(3)
      .populate("category");
    res.status(200).send({
      success: true,
      message: "similar product get successfully",
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "error while getting releted product",
      error,
    });
  }
};

// same category product
const categoryProduct = async (req, res) => {
  try {
    const cid = req.params.cid;
    console.log(cid);
    const products = await productModel
      .find({
        category: cid,
      })
      .populate("category");

    res.status(200).send({
      success: true,
      message: "category product is getting successfully",
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "error in category container",
      error,
    });
  }
};

// category wise product
const CategoryWiseProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await categoryModel.findOne({ _id: id });
    const products = await productModel.find(category).populate("category");

    res.status(200).send({
      success: false,
      message: "successfully getting category wise product",
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "error in category wise product",
      error,
    });
  }
};

const addPopularProductController = async (req, res) => {

  try {
    const { productIds } = req.body

    // const add_popular_product = await popularProductModel

    const popularProducts = productIds.map((id) => ({
      product: new mongoose.Types.ObjectId(id),
    }));

    const update_popular_product = await popularProductModel.insertMany(popularProducts)

    console.log(update_popular_product)

    return res.status(200).send({
      success: false,
      message: "succefully mark products is popular",

    })

  } catch (error) {

    return res.status(400).send({
      success: false,
      message: "error in popular product controller",
      error,
    })
  }

}

const getAllPopularProductController = async (req, res) => {
  try {
    const all_popular_product = await popularProductModel.find({}).populate("product")

    res.status(200).send({
      success: true,
      message: "successfully get all popular product",
      all_popular_product
    })

  } catch (error) {
    return res.status(400).send({
      success: false,
      message: "error in get all popular product controller",
      error,
    })
  }


}

const deletePopulerProductController = async (req, res) => {
  try {
    const { id } = req.params
    if (mongoose.Types.ObjectId.isValid(id)) {
      await popularProductModel.findByIdAndDelete(id)
    }

    return res.status(200).send({
     success: true,
     message: "successfully delete" 
    })

  } catch (error) {
    return res.status(400).send({
      success: false,
      message: "error in get all popular product controller",
      error,
    })
  }

}

module.exports = {
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
  CategoryWiseProduct,
  categoryProduct,
  addPopularProductController,
  getAllPopularProductController,
  deletePopulerProductController,
};
import ProductModel from "../models/product.model.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.cloudinary_Config_Cloud_Name,
  api_key: process.env.cloudinary_Config_api_key,
  api_secret: process.env.cloudinary_Config_api_secret,
  secure: true,
});

export async function uploadProductImages(request, response) {
  try {
    const productId = request.params.id;
    const files = request.files;

    if (!files || files.length === 0) {
      return response.status(400).json({
        message: "No files uploaded",
        error: true,
        success: false,
      });
    }

    // Find the product
    const product = await ProductModel.findById(productId);

    if (!product) {
      return response.status(404).json({
        message: "Product not found",
        error: true,
        success: false,
      });
    }

    const imagesArr = [];

    // Upload images to Cloudinary
    for (const file of files) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "product_images",
      });

      imagesArr.push(result.secure_url);

      // Delete from local 'upload' folder after Cloudinary upload
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    }

    // Add new images to existing images
    product.images = [...product.images, ...imagesArr];
    await product.save();

    return response.status(200).json({
      message: "Images uploaded successfully",
      product: product,
      uploadedImages: imagesArr,
      success: true,
      error: false,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

export async function createProduct(request, response) {
  try {
    const productData = request.body;

    const newProduct = new ProductModel(productData);
    await newProduct.save();
    if (!newProduct) {
      return response.status(400).json({
        message: "Failed to create product",
        error: true,
        success: false,
      });
    }
    if (
      !productData.name ||
      !productData.price ||
      !productData.description ||
      !productData.category
    ) {
      return response.status(400).json({
        message: "Name, Price, Description, and Category are required fields",
      });
    }
    return response.status(201).json({
      message: "Product created successfully",
      product: newProduct,
      success: true,
      error: false,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

export async function getProduct(request, response) {
  try {
    const productId = request.params.id;
    console.log("Looking for product with ID:", productId);

    const product = await ProductModel.findById(productId);

    if (!product) {
      return response.status(404).json({
        message: "Product not found",
        error: true,
        success: false,
      });
    }

    return response.status(200).json({
      message: "Product found",
      product: product,
      success: true,
      error: false,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

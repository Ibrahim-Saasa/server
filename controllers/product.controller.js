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
    await product.save({ validateBeforeSave: false });

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

export async function getAllProducts(request, response) {
  try {
    let { page, limit, search } = request.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    const skip = (page - 1) * limit;
    const products = await ProductModel.find()
      .populate("category")
      .skip((page - 1) * limit)
      .limit(limit);

    if (page && limit) {
      const paginatedProducts = products.slice(skip, skip + limit);
      return response.status(200).json({
        message: "Products found",
        products: paginatedProducts,
        totalProducts: products.length,
        currentPage: page,
        totalPages: Math.ceil(products.length / limit),
        success: true,
        error: false,
      });
    }
    if (page || limit) {
      return response.status(400).json({
        message: "Both page and limit parameters are required for pagination",
        error: true,
        success: false,
      });
    }
    if (page > Math.ceil(products.length / limit)) {
      return response.status(400).json({
        message: "Page number exceeds total pages available",
        error: true,
        success: false,
      });
    }
    if (products.length === 0) {
      return response.status(404).json({
        message: "No products found",
        error: true,
        success: false,
      });
    }
    return response.status(200).json({
      message: "Products found",
      products: products,
      success: true,
      error: false,
      page: page,
      limit: limit,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

export async function getAllProductsByCategory(request, response) {
  try {
    const categoryId = request.params.id;
    let { page, limit } = request.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    const skip = (page - 1) * limit;

    const products = await ProductModel.find({ category: categoryId })
      .populate("category")
      .skip(skip)
      .limit(limit);

    if (page && limit) {
      const paginatedProducts = products.slice(skip, skip + limit);
      return response.status(200).json({
        message: "Products found",
        products: paginatedProducts,
        totalProducts: products.length,
        currentPage: page,
        totalPages: Math.ceil(products.length / limit),
        success: true,
        error: false,
      });
    }
    if (page || limit) {
      return response.status(400).json({
        message: "Both page and limit parameters are required for pagination",
        error: true,
        success: false,
      });
    }
    if (page > Math.ceil(products.length / limit)) {
      return response.status(400).json({
        message: "Page number exceeds total pages available",
        error: true,
        success: false,
      });
    }
    if (products.length === 0) {
      return response.status(404).json({
        message: "No products found",
        error: true,
        success: false,
      });
    }
    return response.status(200).json({
      message: "Products found",
      products: products,
      success: true,
      error: false,
      page: page,
      limit: limit,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

export async function getAllProductsByName(request, response) {
  try {
    const searchTerm = request.params.name;
    let { page, limit } = request.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    const skip = (page - 1) * limit;

    // Search across multiple fields using case-insensitive regex
    const searchQuery = {
      $or: [
        { name: { $regex: searchTerm, $options: "i" } }, // Product name
        { categoryName: { $regex: searchTerm, $options: "i" } }, // Category name
        { subCategory: { $regex: searchTerm, $options: "i" } }, // Subcategory name
        { thirdCategory: { $regex: searchTerm, $options: "i" } }, // Third category name
        { brand: { $regex: searchTerm, $options: "i" } }, // Brand (bonus)
      ],
    };

    // Get total count for pagination
    const totalProducts = await ProductModel.countDocuments(searchQuery);

    // Get paginated products
    const products = await ProductModel.find(searchQuery)
      .populate("category")
      .skip(skip)
      .limit(limit);

    if (products.length === 0) {
      return response.status(404).json({
        message: `No products found matching "${searchTerm}"`,
        error: true,
        success: false,
      });
    }

    return response.status(200).json({
      message: "Products found",
      products: products,
      totalProducts: totalProducts,
      currentPage: page,
      totalPages: Math.ceil(totalProducts / limit),
      searchTerm: searchTerm,
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

export async function getAllProductsByPrice(request, response) {
  try {
    const {
      minPrice,
      maxPrice,
      categoryId,
      categoryName,
      subCategory,
      subCategoryId,
    } = request.query;
    let { page, limit } = request.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    const skip = (page - 1) * limit;

    // Build the query object
    const query = {};

    // Add price filters
    if (minPrice !== undefined && maxPrice !== undefined) {
      query.price = {
        $gte: parseFloat(minPrice),
        $lte: parseFloat(maxPrice),
      };
    } else if (minPrice !== undefined) {
      query.price = { $gte: parseFloat(minPrice) };
    } else if (maxPrice !== undefined) {
      query.price = { $lte: parseFloat(maxPrice) };
    }

    // Add category filters
    if (categoryId) {
      query.category = categoryId;
    }

    if (categoryName) {
      query.categoryName = { $regex: categoryName, $options: "i" };
    }
    if (subCategoryId) {
      query.subCategoryId = subCategoryId;
    }
    if (subCategory) {
      query.subCategory = { $regex: subCategory, $options: "i" };
    }

    // Get total count
    const totalProducts = await ProductModel.countDocuments(query);

    // Get paginated products
    const products = await ProductModel.find(query)
      .populate("category")
      .skip(skip)
      .limit(limit);

    if (products.length === 0) {
      return response.status(404).json({
        message: "No products found matching the specified filters",
        error: true,
        success: false,
      });
    }

    return response.status(200).json({
      message: "Products found",
      products: products,
      totalProducts: totalProducts,
      currentPage: page,
      totalPages: Math.ceil(totalProducts / limit),
      filters: {
        minPrice: minPrice || null,
        maxPrice: maxPrice || null,
        categoryId: categoryId || null,
        categoryName: categoryName || null,
      },
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

export async function deleteProduct(request, response) {
  try {
    const { id } = request.params;
    const product = await ProductModel.findByIdAndDelete(id);
    if (!product) {
      return response.status(404).json({
        message: "Product not found",
        error: true,
        success: false,
      });
    }
    return response.status(200).json({
      message: "Product deleted successfully",
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

export async function getAllProductsByRating(request, response) {
  try {
    const { minRating, maxRating, categoryId, categoryName } = request.query;
    let { page, limit } = request.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    const skip = (page - 1) * limit;

    // Build the query object
    const query = {};

    // Add rating filters
    if (minRating !== undefined && maxRating !== undefined) {
      query.rating = {
        $gte: parseFloat(minRating),
        $lte: parseFloat(maxRating),
      };
    } else if (minRating !== undefined) {
      query.rating = { $gte: parseFloat(minRating) };
    } else if (maxRating !== undefined) {
      query.rating = { $lte: parseFloat(maxRating) };
    }

    // Add category filters
    if (categoryId) {
      query.category = categoryId;
    }

    if (categoryName) {
      query.categoryName = { $regex: categoryName, $options: "i" };
    }

    // Get total count
    const totalProducts = await ProductModel.countDocuments(query);

    // Get paginated products
    const products = await ProductModel.find(query)
      .populate("category")
      .skip(skip)
      .limit(limit);

    if (products.length === 0) {
      return response.status(404).json({
        message: "No products found matching the specified filters",
        error: true,
        success: false,
      });
    }

    return response.status(200).json({
      message: "Products found",
      products: products,
      totalProducts: totalProducts,
      currentPage: page,
      totalPages: Math.ceil(totalProducts / limit),
      filters: {
        minRating: minRating || null,
        maxRating: maxRating || null,
        categoryId: categoryId || null,
        categoryName: categoryName || null,
      },
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

export async function countProducts(request, response) {
  try {
    const { minPrice, maxPrice, categoryId, categoryName, subCategory } =
      request.query;
    let { page, limit } = request.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    const skip = (page - 1) * limit;

    // Build the query object
    const query = {};

    // Add price filters
    if (minPrice !== undefined && maxPrice !== undefined) {
      query.price = {
        $gte: parseFloat(minPrice),
        $lte: parseFloat(maxPrice),
      };
    } else if (minPrice !== undefined) {
      query.price = { $gte: parseFloat(minPrice) };
    } else if (maxPrice !== undefined) {
      query.price = { $lte: parseFloat(maxPrice) };
    }

    // Add category filters
    if (categoryId) {
      query.category = categoryId;
    }

    if (categoryName) {
      query.categoryName = { $regex: categoryName, $options: "i" };
    }

    if (subCategory) {
      query.subCategory = { $regex: subCategory, $options: "i" };
    }

    // Get total count
    const totalProducts = await ProductModel.countDocuments(query);

    return response.status(200).json({
      message: "Product count retrieved successfully",
      totalProducts: totalProducts,
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

export async function deleteImage(request, response) {
  try {
    const productId = request.params.id;

    const product = await ProductModel.findById(productId);

    if (!product) {
      return response.status(404).json({
        message: "Product not found",
        error: true,
        success: false,
      });
    }

    product.images = [];
    await product.save({ validateBeforeSave: false });

    return response.status(200).json({
      message: "All images removed successfully",
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

export async function updateProduct(request, response) {
  try {
    const productId = request.params.id;
    const updateData = request.body;
    const product = await ProductModel.findByIdAndUpdate(
      productId,
      updateData,
      { new: true }
    );
    if (!product) {
      return response.status(404).json({
        message: "Product not found",
        error: true,
        success: false,
      });
    }
    return response.status(200).json({
      message: "Product updated successfully",
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

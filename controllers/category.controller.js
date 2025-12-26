import CategoryModel from "../models/category.model.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.cloudinary_Config_Cloud_Name,
  api_key: process.env.cloudinary_Config_api_key,
  api_secret: process.env.cloudinary_Config_api_secret,
  secure: true,
});

export async function uploadCategory(request, response) {
  try {
    const { name, parentCategory, parentCategoryId } = request.body;

    // Check if name is provided
    if (!name) {
      return response.status(400).json({
        message: "Category name is required",
        error: true,
        success: false,
      });
    }

    // Create new category without images
    const category = new CategoryModel({
      name: name,
      images: [], // Start with empty images array
      parentCategory: parentCategory || null,
      parentCategoryId: parentCategoryId || null,
    });

    // Save category to database
    const savedCategory = await category.save();

    return response.status(201).json({
      message: "Category created successfully",
      category: savedCategory,
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

export async function uploadCategoryImages(request, response) {
  try {
    const categoryId = request.params.id;
    const files = request.files;

    if (!files || files.length === 0) {
      return response.status(400).json({
        message: "No files uploaded",
        error: true,
        success: false,
      });
    }

    // Find the category
    const category = await CategoryModel.findById(categoryId);

    if (!category) {
      return response.status(404).json({
        message: "Category not found",
        error: true,
        success: false,
      });
    }

    const imagesArr = [];

    // Upload images to Cloudinary
    for (const file of files) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "category_images",
      });

      imagesArr.push(result.secure_url);

      // Delete from local 'upload' folder after Cloudinary upload
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    }

    // Add new images to existing images
    category.images = [...category.images, ...imagesArr];
    await category.save();

    return response.status(200).json({
      message: "Images uploaded successfully",
      category: category,
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

export async function getCategories(request, response) {
  try {
    const categories = await CategoryModel.find().sort({ createdAt: -1 });
    const categoryMap = {};
    categories.forEach((category) => {
      categoryMap[category._id] = category;
    });

    const rootCategories = [];
    categories.forEach((category) => {
      if (category.parentCategoryId) {
        const parent = categoryMap[category.parentCategoryId];
      } else {
        rootCategories.push(categoryMap[category._id]);
      }
    });
    return response.status(200).json({
      message: "Categories fetched successfully",
      categories: categoryMap,
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

export async function getCategoryCount(request, response) {
  try {
    const categoryCount = await CategoryModel.countDocuments({
      parentCategoryId: null,
    });
    if (categoryCount === 0) {
      return response.status(404).json({
        message: "No categories found",
        count: 0,
        success: false,
        error: true,
      });
    } else {
      response.send({ count: categoryCount });
    }
    return response.status(200).json({
      message: "Category count fetched successfully",
      count: categoryCount,
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

export async function getSubCategoryCount(request, response) {
  try {
    // Fetch all categories (not just count)
    const categories = await CategoryModel.find();

    if (categories.length === 0) {
      return response.status(404).json({
        message: "No categories found",
        count: 0,
        success: false,
        error: true,
      });
    }

    // Filter subcategories (those with parentCategoryId)
    const subCatArr = categories.filter(
      (category) => category.parentCategoryId !== null
    );

    return response.status(200).json({
      message: "Subcategory count fetched successfully",
      count: subCatArr.length,
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

export async function getCategory(request, response) {
  try {
    const categoryId = await CategoryModel.findById(request.params.id);
    if (!categoryId) {
      return response.status(404).json({
        message: "Category not found",
        error: true,
        success: false,
      });
    }
    return response.status(200).json({
      message: "Category fetched successfully",
      category: categoryId,
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

export async function removeImage(request, response) {
  try {
    const userId = request.userId; // ADD THIS LINE
    const imageUrl = request.query.img;

    if (!imageUrl || typeof imageUrl !== "string") {
      return response.status(400).json({
        message: "Valid image URL is required in query params",
        success: false,
      });
    }

    const user = await CategoryModel.findOne({ _id: userId });

    if (!user) {
      return response.status(404).json({
        message: "User not found",
        success: false,
        error: true,
      });
    }

    const urlParts = imageUrl.split("/");
    const fileNameWithExtension = urlParts[urlParts.length - 1];
    const folderName = urlParts[urlParts.length - 2];
    const publicId = `${folderName}/${fileNameWithExtension.split(".")[0]}`;

    console.log("Attempting to delete Public ID:", publicId);

    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === "ok") {
      // Clear the avatar in the database
      user.avatar = "";
      await user.save();

      return response.status(200).json({
        message: "Image removed successfully from Cloudinary",
        success: true,
      });
    } else {
      return response.status(400).json({
        message: "Cloudinary could not find the image",
        result: result.result,
      });
    }
  } catch (error) {
    console.error("Delete Error:", error);
    return response.status(500).json({
      message: error.message || "Internal Server Error",
      error: true,
      success: false,
    });
  }
}

export async function deleteCategory(request, response) {
  try {
    const categoryId = request.params.id;

    // First, find the category (don't delete yet)
    const category = await CategoryModel.findById(categoryId);

    if (!category) {
      return response.status(404).json({
        message: "Category not found",
        error: true,
        success: false,
      });
    }

    // Find all subcategories before deleting anything
    const subcategories = await CategoryModel.find({
      parentCategoryId: categoryId,
    });

    // Delete subcategory images from Cloudinary
    for (const subcategory of subcategories) {
      for (const imageUrl of subcategory.images) {
        const urlParts = imageUrl.split("/");
        const fileNameWithExtension = urlParts[urlParts.length - 1];
        const folderName = urlParts[urlParts.length - 2];
        const publicId = `${folderName}/${fileNameWithExtension.split(".")[0]}`;
        await cloudinary.uploader.destroy(publicId);
      }
      // Delete the subcategory
      await CategoryModel.findByIdAndDelete(subcategory._id);
    }

    // Delete main category images from Cloudinary
    for (const imageUrl of category.images) {
      const urlParts = imageUrl.split("/");
      const fileNameWithExtension = urlParts[urlParts.length - 1];
      const folderName = urlParts[urlParts.length - 2];
      const publicId = `${folderName}/${fileNameWithExtension.split(".")[0]}`;
      await cloudinary.uploader.destroy(publicId);
    }

    // Finally, delete the main category
    await CategoryModel.findByIdAndDelete(categoryId);

    return response.status(200).json({
      message: "Category and associated subcategories deleted successfully",
      deletedSubcategoriesCount: subcategories.length,
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

export async function updateCategory(request, response) {
  try {
    const categoryId = request.params.id;
    const { name, parentCategory, parentCategoryId } = request.body;

    const category = await CategoryModel.findById(categoryId);
    if (!category) {
      return response.status(404).json({
        message: "Category not found",
        error: true,
        success: false,
      });
    }

    // Update text fields only
    if (name) category.name = name;
    if (parentCategory !== undefined) category.parentCategory = parentCategory;
    if (parentCategoryId !== undefined)
      category.parentCategoryId = parentCategoryId;

    await category.save();

    return response.status(200).json({
      message: "Category updated successfully",
      success: true,
      error: false,
      data: category,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

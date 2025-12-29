import CartProductModel from "../models/cart.model.js";
import UserModel from "../models/user.model.js";
import ProductModel from "../models/product.model.js";
import MyListModel from "../models/myList.model.js";
import { response } from "express";
import mongoose from "mongoose";

export async function addToMyList(request, response) {
  try {
    const userId = request.userId;
    const {
      productId,
      productTitle,
      image,
      rating,
      price,
      oldPrice,
      discount,
      brand,
    } = request.body;

    const item = await MyListModel.findOne({
      userId: userId,
      productId: productId,
    });

    if (item) {
      return response.status(400).json({
        message: "Item already in My List",
      });
    }
    const myList = new MyListModel({
      productId,
      userId,
      productTitle,
      image,
      rating,
      price,
      oldPrice,
      discount,
      brand,
    });
    const save = await myList.save();

    return response.status(200).json({
      error: false,
      success: true,
      messege: "added to My List",
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || "Internal server error",
      error: true,
      success: false,
    });
  }
}

export async function deleteFromMyList(request, response) {
  try {
    const myListItem = await MyListModel.findById(request.params.id);

    const itemId = request.params.id;

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return response.status(400).json({
        message: "Invalid item ID format",
        error: true,
        success: false,
      });
    }

    if (!myListItem) {
      response.status(400).json({
        error: true,
        success: false,
        messege: "Item not found!",
      });
    }

    const deletedItem = await MyListModel.findByIdAndDelete(request.params.id);

    if (!deletedItem) {
      return response.status(400).json({
        error: true,
        success: false,
        messege: "Item could not be deleted!",
      });
    }

    return response.status(200).json({
      error: false,
      success: true,
      message: "Item deleted successfully!",
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || "Internal server error",
      error: true,
      success: false,
    });
  }
}

export async function getFromMyList(request, response) {
  try {
    const userId = request.userId;
    const myListItems = await MyListModel.find({
      userId: userId,
    });
    return response.status(200).json({
      data: myListItems,
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || "Internal server error",
      error: true,
      success: false,
    });
  }
}

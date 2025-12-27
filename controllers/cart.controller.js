import CartProductModel from "../models/cart.model.js";
import UserModel from "../models/user.model.js";
import ProductModel from "../models/product.model.js";

export async function addToCart(request, response) {
  try {
    const { productId, quantity } = request.body;
    const userId = request.userId; // ✅ Fixed: Use request.userId from auth middleware

    // Validate input
    if (!productId) {
      return response.status(400).json({
        message: "Product ID is required",
        error: true,
        success: false,
      });
    }

    if (!quantity || quantity <= 0) {
      return response.status(400).json({
        message: "Quantity must be greater than zero",
        error: true,
        success: false,
      });
    }

    // Check if user exists
    const user = await UserModel.findById(userId);
    if (!user) {
      return response.status(404).json({
        message: "User not found",
        error: true,
        success: false,
      });
    }

    // Check if product exists
    const product = await ProductModel.findById(productId);
    if (!product) {
      return response.status(404).json({
        message: "Product not found",
        error: true,
        success: false,
      });
    }

    // Check if product already in cart
    const checkExisting = await CartProductModel.findOne({
      productId: productId,
      UserId: userId,
    });

    if (checkExisting) {
      return response.status(400).json({
        message: "Product already in cart. Use update to change quantity.",
        error: true,
        success: false,
      });
    }

    // Create cart item
    const cartItem = new CartProductModel({
      productId: productId,
      quantity: quantity,
      UserId: userId,
    });

    await cartItem.save();

    // Update user's shopping_cart array
    await UserModel.updateOne(
      { _id: userId },
      { $push: { shopping_cart: cartItem._id } }
    );

    // ✅ Send response ONCE at the end
    return response.status(201).json({
      message: "Product added to cart successfully",
      cartItem: cartItem,
      success: true,
      error: false,
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    return response.status(500).json({
      message: error.message || "Internal server error",
      error: true,
      success: false,
    });
  }
}

export async function getCartItems(request, response) {
  try {
    const userId = request.userId;

    const cartItems = await CartProductModel.find({ UserId: userId }).populate(
      "productId"
    );

    if (!cartItems || cartItems.length === 0) {
      return response.status(200).json({
        message: "Cart is empty",
        data: [],
        error: false,
        success: true,
      });
    }

    return response.status(200).json({
      message: "Cart items retrieved successfully",
      data: cartItems,
      totalItems: cartItems.length,
      error: false,
      success: true,
    });
  } catch (error) {
    console.error("Get cart items error:", error);
    return response.status(500).json({
      message: error.message || "Internal server error",
      error: true,
      success: false,
    });
  }
}

export async function removeFromCart(request, response) {
  try {
    const { productId } = request.params;
    const userId = request.userId;
    const cartItem = await CartProductModel.findOneAndDelete({
      productId: productId,
      UserId: userId,
    });
    if (!cartItem) {
      return response.status(404).json({
        message: "Cart item not found",
      });
    }

    const user = await UserModel.findOne({
      _id: userId,
    });

    const cartItems = user?.shopping_cart;

    const updatedUserCart = [
      ...cartItems.slice(0, cartItems.indexOf(productId)),
      ...cartItems.slice(cartItems.indexOf(productId) + 1),
    ];

    user.shopping_cart = updatedUserCart;

    await user.save();

    response.status(200).json({
      message: "Product removed from cart",
    });
  } catch (error) {
    response.status(500).json({ message: "Internal server error", error });
  }
}

export async function clearCart(request, response) {
  try {
    const userId = request.user._id;
    await CartProductModel.deleteMany({ UserId: userId });
    response.status(200).json({ message: "Cart cleared successfully" });
  } catch (error) {
    response.status(500).json({ message: "Internal server error", error });
  }
}

export async function updateCartItem(request, response) {
  try {
    const { cartItemId } = request.params;
    const { quantity } = request.body;
    const userId = request.userId;
    const cartItem = await CartProductModel.findOneAndUpdate(
      { _id: cartItemId, UserId: userId },
      { quantity },
      { new: true }
    );
    if (!cartItem) {
      return response.status(404).json({
        message: "Cart item not found",
      });
    }
    response.status(200).json({
      message: "Cart item updated",
      cartItem,
    });
  } catch (error) {
    response.status(500).json({
      message: "Internal server error",
      error,
    });
  }
}

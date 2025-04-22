// src/controllers/menuController.js
const Menu = require('../models/menu');
const { getUserById } = require('../utils/userServiceClient');
const mongoose = require('mongoose');

// Error handler utility
const handleError = (res, error) => {
  console.error('Error:', error);
  return res.status(500).json({ 
    success: false, 
    message: 'An error occurred', 
    error: error.message 
  });
};

exports.createMenu = async (req, res) => {
  try {
    const { restaurantId } = req.body;
    
   // Verify the restaurant exists by calling the user-service API
   const restaurant = await getUserById(restaurantId);
   if (!restaurant) {
     return res.status(404).json({
       success: false,
       message: 'Restaurant not found',
     });
   }
    
    // Check if a menu already exists for this restaurant
    const existingMenu = await Menu.findOne({ restaurantId });
    if (existingMenu) {
      return res.status(400).json({
        success: false,
        message: 'A menu already exists for this restaurant'
      });
    }
    
    const menu = new Menu(req.body);
    const savedMenu = await menu.save();
    
    res.status(201).json({
      success: true,
      message: 'Menu created successfully',
      data: savedMenu
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    return handleError(res, error);
  }
};

exports.getMenuByRestaurantId = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    
    const menu = await Menu.findOne({ restaurantId, isActive: true });
    
    if (!menu) {
      return res.status(404).json({
        success: false,
        message: 'No active menu found for this restaurant'
      });
    }
    
    res.status(200).json({
      success: true,
      data: menu
    });
  } catch (error) {
    return handleError(res, error);
  }
};

exports.updateMenu = async (req, res) => {
  try {
    const menu = await Menu.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!menu) {
      return res.status(404).json({
        success: false,
        message: 'Menu not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Menu updated successfully',
      data: menu
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    return handleError(res, error);
  }
};

exports.addMenuCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const categoryData = req.body;
    
    const menu = await Menu.findById(id);
    if (!menu) {
      return res.status(404).json({
        success: false,
        message: 'Menu not found'
      });
    }
    
    menu.categories.push(categoryData);
    await menu.save();
    
    res.status(201).json({
      success: true,
      message: 'Category added successfully',
      data: menu
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    return handleError(res, error);
  }
};

exports.updateMenuCategory = async (req, res) => {
  try {
    const { menuId, categoryId } = req.params;
    const updateData = req.body;
    
    const menu = await Menu.findById(menuId);
    if (!menu) {
      return res.status(404).json({
        success: false,
        message: 'Menu not found'
      });
    }
    
    const categoryIndex = menu.categories.findIndex(
      category => category._id.toString() === categoryId
    );
    
    if (categoryIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    // Update only the fields provided in the request
    Object.keys(updateData).forEach(key => {
      menu.categories[categoryIndex][key] = updateData[key];
    });
    
    await menu.save();
    
    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: menu.categories[categoryIndex]
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    return handleError(res, error);
  }
};

exports.deleteMenuCategory = async (req, res) => {
  try {
    const { menuId, categoryId } = req.params;
    
    const menu = await Menu.findById(menuId);
    if (!menu) {
      return res.status(404).json({
        success: false,
        message: 'Menu not found'
      });
    }
    
    const categoryIndex = menu.categories.findIndex(
      category => category._id.toString() === categoryId
    );
    
    if (categoryIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    menu.categories.splice(categoryIndex, 1);
    await menu.save();
    
    res.status(200).json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    return handleError(res, error);
  }
};

exports.addMenuItem = async (req, res) => {
  try {
    const { menuId, categoryId } = req.params;
    const itemData = req.body;
    
    const menu = await Menu.findById(menuId);
    if (!menu) {
      return res.status(404).json({
        success: false,
        message: 'Menu not found'
      });
    }
    
    const category = menu.categories.id(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    category.items.push(itemData);
    await menu.save();
    
    res.status(201).json({
      success: true,
      message: 'Menu item added successfully',
      data: category.items[category.items.length - 1]
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    return handleError(res, error);
  }
};

exports.updateMenuItem = async (req, res) => {
  try {
    const { menuId, categoryId, itemId } = req.params;
    const updateData = req.body;
    
    const menu = await Menu.findById(menuId);
    if (!menu) {
      return res.status(404).json({
        success: false,
        message: 'Menu not found'
      });
    }
    
    const category = menu.categories.id(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    const item = category.items.id(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }
    
    // Update only the fields provided in the request
    Object.keys(updateData).forEach(key => {
      item[key] = updateData[key];
    });
    
    await menu.save();
    
    res.status(200).json({
      success: true,
      message: 'Menu item updated successfully',
      data: item
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    return handleError(res, error);
  }
};

exports.deleteMenuItem = async (req, res) => {
  try {
    const { menuId, categoryId, itemId } = req.params;
    
    const menu = await Menu.findById(menuId);
    if (!menu) {
      return res.status(404).json({
        success: false,
        message: 'Menu not found'
      });
    }
    
    const category = menu.categories.id(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    const itemIndex = category.items.findIndex(
      item => item._id.toString() === itemId
    );
    
    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }
    
    category.items.splice(itemIndex, 1);
    await menu.save();
    
    res.status(200).json({
      success: true,
      message: 'Menu item deleted successfully'
    });
  } catch (error) {
    return handleError(res, error);
  }
};

exports.toggleItemAvailability = async (req, res) => {
  try {
    const { menuId, categoryId, itemId } = req.params;
    const { isAvailable } = req.body;
    
    if (typeof isAvailable !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isAvailable must be a boolean value'
      });
    }
    
    const menu = await Menu.findById(menuId);
    if (!menu) {
      return res.status(404).json({
        success: false,
        message: 'Menu not found'
      });
    }
    
    const category = menu.categories.id(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    const item = category.items.id(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }
    
    item.isAvailable = isAvailable;
    await menu.save();
    
    res.status(200).json({
      success: true,
      message: `Menu item ${isAvailable ? 'activated' : 'deactivated'} successfully`,
      data: item
    });
  } catch (error) {
    return handleError(res, error);
  }
};
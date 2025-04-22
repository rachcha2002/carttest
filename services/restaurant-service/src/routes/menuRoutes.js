// src/routes/menuRoutes.js
const express = require('express');
const menuController = require('../controllers/menuController');
const router = express.Router();

/*
router.get('/restaurant/:restaurantId', menuController.getMenuByRestaurantId);


router.post('/restaurant/:restaurantId', menuController.createOrUpdateMenu);


router.get('/:menuId', menuController.getMenuById);


router.post('/:menuId/categories', menuController.addMenuCategory);


router.put('/:menuId/categories/:categoryId', menuController.updateMenuCategory);


router.delete('/:menuId/categories/:categoryId', menuController.deleteMenuCategory);


router.post('/:menuId/categories/:categoryId/items', menuController.addMenuItem);


router.put('/:menuId/categories/:categoryId/items/:itemId', menuController.updateMenuItem);


router.delete('/:menuId/categories/:categoryId/items/:itemId', menuController.deleteMenuItem);


router.put('/:menuId/categories/:categoryId/items/:itemId/availability', menuController.toggleItemAvailability);


router.put('/:menuId/categories/:categoryId/availability', menuController.toggleCategoryAvailability);
*/
module.exports = router;
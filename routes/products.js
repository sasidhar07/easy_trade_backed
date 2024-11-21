const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const authMiddleware = require('../authMiddleWare');

router.get('/', async (req, res) => {
  try {
    const searchQuery = req.query.q || ''; 
    const regex = new RegExp(searchQuery, 'i'); 

    const products = await Product.find({ name: { $regex: regex } });

    return res.status(200).json(products);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});


router.post('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;

    const { name, farmer, price, unit, image, image_public_id, quality } = req.body;

    if (!name || !farmer || !price || !unit || !image || !image_public_id || !quality) {
      return res.status(400).json({ error: 'All fields are required.' });
    }
    
    const newProduct = new Product({
      user_id: userId, 
      name,
      farmer,
      price,
      unit,
      image,
      image_public_id,
      quality,  
    });

    await newProduct.save();

    res.status(201).json({
      message: 'Product added successfully!',
      product: newProduct,
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;


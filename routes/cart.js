const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const User = require('../models/User');
const Product = require('../models/Product');
const authMiddleware = require('../authMiddleWare');

router.post('/', authMiddleware, async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.userId;
  


  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = new Cart({
        user: userId,
        items: [{ productId, quantity }],
      });
    } else {
      const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += quantity; // Update quantity
      } else {
        cart.items.push({ productId, quantity }); // Add new item
      }
    }

    await cart.save();
    return res.status(200).json({ message: 'Cart updated successfully', cart });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.get('/', authMiddleware, async (req, res) => {

  const userId = req.userId;

  try {
    const cart = await Cart.findOne({ user: userId })
      .populate('items.productId');

    if (!cart) {
      return res.status(200).json({ message: 'Cart not found' });
    }
    const enrichedItems = cart.items.map(item => ({
      productId: item.productId._id,
      name: item.productId.name,
      farmer: item.productId.farmer,
      price: item.productId.price,
      image: item.productId.image,
      quantity: item.quantity,
      totalPrice: item.productId.price * item.quantity,
      unit: item.productId.unit,
    }));

    const response = {
      _id: cart._id,
      user: cart.user,
      items: enrichedItems,
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.put('/update', authMiddleware, async (req, res) => {
  const { productId, quantity } = req.body;

  // Validate productId and quantity
  if (!productId || quantity < 1) {
    return res.status(400).json({ message: 'Invalid product ID or quantity' });
  }

  try {
    const cart = await Cart.findOne({ user: req.userId });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    

    const itemIndex = cart.items.findIndex(item => item.productId.toString() == productId);
    
    

    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Cart item not found' });
    }


    cart.items[itemIndex].quantity = quantity;

    await cart.save();

    return res.status(200).json({
      message: 'Cart item updated successfully',
      cart: {
        _id: cart._id,
        user: cart.user,
        items: cart.items,
      },
    });
  } catch (error) {
    console.error('Error updating cart item:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});


router.delete('/:productId', authMiddleware, async (req, res) => {
  const { productId } = req.params;
console.log(productId)
  if (!productId) {
    return res.status(400).json({ message: 'Product ID is required' });
  }

  try {
    const cart = await Cart.findOne({ user: req.userId });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(item => item.productId.toString() == productId);

    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    cart.items.splice(itemIndex, 1);
    await cart.save();

    return res.status(200).json({ message: 'Item removed from cart', cart });
  } catch (error) {
    console.error('Error removing cart item:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    user_id:{ type: String, required: true},
    name: { type: String, required: true },
    farmer: { type: String, required: true },
    price: { type: String, required: true },
    unit: { type: String, required: true },
    image: { type: String, required: true },
    quality: { type: String, required: true },  
    image_public_id: { type: String, required: true }
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;

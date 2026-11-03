const { ObjectId } = require('mongodb');
const db = require('../config/connection');
const collection = require('../config/collections');

const carts = () => db.get().collection(collection.CART_COLLECTION)

module.exports = {
    addToCart: async (userId, productId) => {
        const user = new ObjectId(userId), item = new ObjectId(productId);
        const result = await carts().updateOne({ user, 'products.item': item }, { $inc: { 'products.$.quantity': 1 } });
        if (result.matchedCount === 0) {
            // product not in the cart yet (creates the cart if the user has none)
            await carts().updateOne({ user }, { $push: { products: { item, quantity: 1 } } }, { upsert: true });
        }
    },
    changeQuantity: async (userId, productId, change) => {
        const user = new ObjectId(userId), item = new ObjectId(productId);
        await carts().updateOne({ user, 'products.item': item }, { $inc: { 'products.$.quantity': change } });
        await carts().updateOne({ user }, { $pull: { products: { quantity: { $lte: 0 } } } });
    },
    removeFromCart: (userId, productId) => {
        return carts().updateOne({ user: new ObjectId(userId) }, { $pull: { products: { item: new ObjectId(productId) } } });
    },
    getCart: async (userId) => {
        const items = await carts().aggregate([
            { $match: { user: new ObjectId(userId) } },
            { $unwind: '$products' },
            { $lookup: { from: collection.PRODUCT_COLLECTION, localField: 'products.item', foreignField: '_id', as: 'product' } },
            { $unwind: '$product' },
            { $project: { _id: 0, item: '$products.item', quantity: '$products.quantity', product: 1 } }
        ]).toArray();

        let total = 0;
        for (const item of items) {
            item.subtotal = (Number(item.product.Price) || 0) * item.quantity;
            total += item.subtotal;
        }
        return { items, total };
    },
    getCartCount: async (userId) => {
        const cart = await carts().findOne({ user: new ObjectId(userId) });
        return cart ? cart.products.reduce((count, p) => count + p.quantity, 0) : 0;
    },
    clearCart: (userId) => {
        return carts().deleteOne({ user: new ObjectId(userId) });
    }
};

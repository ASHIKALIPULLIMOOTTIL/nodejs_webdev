const { ObjectId } = require('mongodb');
const db = require('../config/connection');
const collection = require('../config/collections');

const orders = () => db.get().collection(collection.ORDER_COLLECTION)

const STATUSES = ['placed', 'shipped', 'delivered', 'cancelled'];

module.exports = {
    STATUSES,
    placeOrder: async (userId, delivery, cart) => {
        const order = {
            userId: new ObjectId(userId),
            delivery,
            paymentMethod: 'COD',
            // copy name and price so later product edits don't change past orders
            products: cart.items.map((i) => ({
                item: i.item,
                name: i.product.Name,
                price: Number(i.product.Price) || 0,
                quantity: i.quantity,
                subtotal: i.subtotal
            })),
            totalAmount: cart.total,
            status: 'placed',
            date: new Date()
        };
        const result = await orders().insertOne(order);
        return result.insertedId;
    },
    getUserOrders: (userId) => {
        return orders().find({ userId: new ObjectId(userId) }).sort({ date: -1 }).toArray();
    },
    getUserOrder: (userId, orderId) => {
        return orders().findOne({ _id: new ObjectId(orderId), userId: new ObjectId(userId) });
    },
    cancelOrder: (userId, orderId) => {
        // only orders that haven't shipped yet can be cancelled
        return orders().updateOne(
            { _id: new ObjectId(orderId), userId: new ObjectId(userId), status: 'placed' },
            { $set: { status: 'cancelled' } }
        );
    },
    getAllOrders: () => {
        return orders().aggregate([
            { $sort: { date: -1 } },
            { $lookup: { from: collection.USER_COLLECTION, localField: 'userId', foreignField: '_id', as: 'user' } },
            { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
            { $project: { 'user.password': 0 } }
        ]).toArray();
    },
    updateStatus: (orderId, status) => {
        if (!STATUSES.includes(status)) throw new Error('Invalid order status');
        return orders().updateOne({ _id: new ObjectId(orderId) }, { $set: { status } });
    }
};

const { ObjectId } = require('mongodb');
var db = require('../config/connection');
var collection=require('../config/collections')

const products = () => db.get().collection(collection.PRODUCT_COLLECTION)

module.exports = {
  addProduct: async (product) => {
    const result = await products().insertOne(product)
    return result.insertedId
  },
  getAllProducts: () => {
    return products().find().toArray()
  },
  getProduct: (productId) => {
    return products().findOne({ _id: new ObjectId(productId) })
  },
  updateProduct: (productId, details) => {
    return products().updateOne({ _id: new ObjectId(productId) }, { $set: details })
  },
  deleteProduct: async (productId) => {
    const id = new ObjectId(productId)
    await products().deleteOne({ _id: id })
    // remove the deleted product from every cart
    await db.get().collection(collection.CART_COLLECTION).updateMany({}, { $pull: { products: { item: id } } })
  }
};

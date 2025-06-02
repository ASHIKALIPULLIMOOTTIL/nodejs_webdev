var db = require('../config/connection');

module.exports = {
  addProduct: (product, callback) => {
    console.log(product);
    db.get().collection('product').insertOne(product)
      .then((data) => {
        callback(data.insertedId);  // ✅ Use insertedId instead of data.ops[0]._id
      })
      .catch((err) => {
        console.error("Error inserting product:", err);
        callback(null);  // You may want to handle errors in your route
      });
  }
};

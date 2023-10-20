const mongoose = require("mongoose");
const { Schema } = mongoose;
// Define the order schema
const OrderSchema = new Schema(
  {
    products: [ProductSchema],
    orderId: {
      type: String,
      required: true,
      description: "The order identifier",
    },
    shippingAddress: {
      type: String,
      description: "Address to ship to",
    },
    customerPublicKey: {
      type: String,
      required: true,
      description: "The public key of the customer",
    },
    invoiceId: {
      type: String,
      required: true,
      description: "The invoice identifier",
    },
  })

module.exports = {
  OrderSchema: OrderSchema,
  OrderModel: mongoose.model("Order", OrderSchema),
};

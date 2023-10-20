const mongoose = require("mongoose");
const { Schema } = mongoose;
const { ProductSchema } = require('./product.model');
// Define the order schema
const OrderSchema = new Schema(
  {
    products: [{
      quantity: {
        type: Number,
        required: true,
        description: "Quantity of the product",
      }, 
      product: ProductSchema
    }],
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
    customerUserName: {
      type: String,
      description: "Username of the customer",
    },
    merchantId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Merchant",
      description: "Id of the merchant that the order belongs to",
    },
    currency: {
      type: String,
      description: "The currency of the order",
      default: "SAT",
    },
    price: {
      type: Number,
      required: true,
      description: "The total price of the order",
    },
    invoiceId: {
      type: String,
      description: "The invoice identifier",
    },
    paid: {
      type: Boolean,
      required: true,
      description: "Whether the order has been paid",
      default: false
    },
    shipped: {
      type: Boolean,
      required: true,
      description: "Whether the order has been paid",
      default: false
    },
    delivered: {
      type: Boolean,
      required: true,
      description: "Whether the order has been delivered",
      default: false
    },
    message: {
      type: String,
      description: "Message provided by the buyer during checkout"
    }
  }, { timestamps: true })

module.exports = {
  OrderSchema: OrderSchema,
  OrderModel: mongoose.model("Order", OrderSchema),
};

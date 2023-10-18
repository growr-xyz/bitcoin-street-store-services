const mongoose = require("mongoose");
const { Schema } = mongoose;
const { ProductSchema } = require("./product.model");
const { ShippingZoneSchema } = require("./shipping-zone.model");

// Define the Stall schema
const StallSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      description: "The name of the stall",
    },
    description: {
      type: String,
      description: "The description of the stall",
    },
    currency: {
      type: String,
      default: "SATS",
      description: "The currency used by the stall",
    },
    shipping: [
      {
        type: ShippingZoneSchema,
      },
    ],
    products: [
      {
        type: ProductSchema,
      },
    ],
    regions: [
      {
        type: String,
      },
    ],
    status: {
      type: String,
      enum: ["Draft", "Review", "Active", "Deactivated"],
      default: "Draft",
      description: "Status of the stall",
    },
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      description: "Id of the NOSTR event",
    },
    createdBy: {
      type: String,
      required: true,
      description: "Unique identifier of the agent who created the merchant",
    },
    merchantId: {
      type: Schema.Types.ObjectId, // should be pubkey
      required: true,
      ref: "Merchant",
      description: "Id of the merchant that the product belongs to",
    },
  },
  { timestamps: true }
);

module.exports = {
  StallSchema: StallSchema,
  StallModel: mongoose.model("Stall", StallSchema),
};

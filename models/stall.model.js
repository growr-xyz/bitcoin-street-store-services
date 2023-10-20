const mongoose = require("mongoose");
const { Schema } = mongoose;
const { ProductSchema } = require("./product.model");
const { ShippingZoneSchema, defaultShippingZone } = require("./shipping-zone.model");

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
      default: "sat",
      description: "The currency used by the stall",
    },
    shipping: [
      {
        type: ShippingZoneSchema,
      },
    ],
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      description: "Id of the NOSTR event",
    },
    merchantId: {
      type: Schema.Types.ObjectId,
      ref: "Merchant",
      description: "Id of the NOSTR event",
    },

  },
  { timestamps: true }
);

const defaultStall = {
  name: "Default Stall",
  description: "Default Stall",
  currency: "sat",
  shipping: defaultShippingZone
}

module.exports = {
  StallSchema: StallSchema,
  defaultStall,
  StallModel: mongoose.model("Stall", StallSchema),
};

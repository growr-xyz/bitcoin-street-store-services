const mongoose = require("mongoose");
const { Schema } = mongoose;

const ShippingZoneSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      description: "The name of the shipping zone",
    },
    cost: {
      type: Number,
      default: 0,
      description: "The base cost for shipping to this zone",
    },
    regions: [
      {
        type: String,
        default: "Worldwide - Online",
      },
    ],
    status: {
      type: String,
      enum: ["Draft", "Review", "Active", "Deactivated"],
      default: "Draft",
      description: "Status of the zone",
    },
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      description: "Id of the NOSTR event",
    },
    createdBy: {
      type: String,
      required: true,
      default: "AGENT NOSTR PUBKEY IMPLEMENT WITH NIP 98",
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
  ShippingZoneSchema: ShippingZoneSchema,
  ShippingZoneModel: mongoose.model("ShippingZone", ShippingZoneSchema),
};

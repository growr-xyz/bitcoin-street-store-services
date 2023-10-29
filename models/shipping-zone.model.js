const mongoose = require("mongoose");
const { Schema } = mongoose;

const ShippingZoneSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      default: "Worldwide - Online",
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
    ]
  }, { _id: false }
);

const defaultShippingZone = {
  name: "Worldwide - Online",
  cost: 0,
  regions: ["Worldwide - Online"],
}

module.exports = {
  ShippingZoneSchema: ShippingZoneSchema,
  defaultShippingZone,
  // ShippingZoneModel: mongoose.model("ShippingZone", ShippingZoneSchema),
};

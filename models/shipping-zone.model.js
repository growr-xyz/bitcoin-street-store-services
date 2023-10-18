const mongoose = require('mongoose');
const { Schema } = mongoose;

const ShippingZoneSchema = new Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    description: 'The unique identifier of the shipping zone'
  },
  name: {
    type: String,
    required: true,
    description: 'The name of the shipping zone'
  },
  cost: {
    type: Number,
    description: 'The base cost for shipping to this zone'
  },
  regions: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['Draft', 'Review', 'Active', 'Dectactived'],
    default: 'Draft',
    description: 'Status of the stall'
  },
  eventId: {
    type: Schema.Types.ObjectId,
    ref: 'Event',
    description: 'Id of the NOSTR event'
  },
  createdBy: {
    type: String,
    required: true,
    description: 'Unique identifier of the agent who created the merchant',
  }
}, { timestamps: true });


module.exports = {
  ShippingZoneSchema: ShippingZoneSchema,
  ShippingZoneModel: mongoose.model('ShippingZone', ShippingZoneSchema),
};

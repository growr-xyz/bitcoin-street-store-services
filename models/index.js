const mongoose = require('mongoose');
const { Schema } = mongoose;
const { MerchantSchema } = require('./merchant.model');


// Define the ShippingZone schema

const AgentSchema = new Schema({
  npub: { type: String, description: 'public key of the agent' },
  merchants: [MerchantSchema]
}, { timestamps: true });

// Define the Identifier schema
const IdentifierSchema = new Schema({
  provider: { type: String },
  value: { type: String },
  privateKey: { type: String },
  walletAddress: { type: String, required: false },
  credentials: [{
    type: { type: String },
    value: { type: String }
  }],
}, { timestamps: true });

// Define the Identity schema
const IdentitySchema = new Schema({
  _id: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'Merchant', required: true }, // Reference to User schema
  session: { type: String, required: true },
  identifier: IdentifierSchema
});

// module.exports = mongoose.model('Identity', IdentitySchema);

module.exports = {
  MerchantModel: require('./merchant.model').MerchantModel,
  StallModel: require('./stall.model').StallModel,
  ShippingZoneModel: require('./shipping-zone.model').ShippingZoneModel,
  ProductModel: require('./product.model').ProductModel,
  EventModel: require('./nostr-market-events.model').EventModel,
  // AgentModel: mongoose.model('Agent', AgentSchema),
  // IdentityModel: mongoose.model('Identity', IdentitySchema)
};

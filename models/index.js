const mongoose = require('mongoose');
const { Schema } = mongoose;
const { MerchantSchema } = require('./merchant.model');


// Define the ShippingZone schema

const AgentSchema = new Schema({
  npub: { type: String, description: 'public key of the agent' },
  merchants: [MerchantSchema]
}, { timestamps: true });



// module.exports = mongoose.model('Identity', IdentitySchema);

module.exports = {
  MerchantModel: require('./merchant.model').MerchantModel,
  StallModel: require('./stall.model').StallModel,
  ShippingZoneModel: require('./shipping-zone.model').ShippingZoneModel,
  ProductModel: require('./product.model').ProductModel,
  EventModel: require('./nostr-market-events.model').EventModel,
  // AgentModel: mongoose.model('Agent', AgentSchema),
  IdentityModel: require('./identity.model').IdentityModel,
};

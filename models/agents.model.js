const mongoose = require('mongoose');
const { Schema } = mongoose;
const { MerchantSchema } = require('./merchant.model');


// Define the ShippingZone schema

const AgentSchema = new Schema({
  npub: { type: String, description: 'public key of the agent' },
  merchants: [MerchantSchema]
}, { timestamps: true });


module.exports = {
  AgentSchema: AgentSchema,
  AgentModel: mongoose.model('Agent', AgentSchema)
}

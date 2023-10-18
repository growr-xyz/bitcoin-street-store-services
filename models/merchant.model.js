const mongoose = require('mongoose');
const { Schema } = mongoose;
const { StallSchema } = require('./stall.model');
// Define the Merchant schema
const MerchantSchema = new Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    description: 'Unique identifier of the merchant'
  },
  mobileNumber: {
    type: String,
    required: true,
    description: 'Mobile phone of the merchant'
  },
  username: {
    type: String,
    required: true,
    description: 'TBD'
  },
  walletAddress: {
    type: String,
    required: true,
    description: 'Address of the LN wallet address of the merchant'
  },
  name: {
    type: String,
    description: 'Name of the merchant'
  },
  about: {
    type: String,
    description: 'Short intro of the merchant'
  },
  picture: {
    type: String,
    description: 'URL to merchant\'s picture'
  },
  banner: {
    type: String,
    description: 'URL to merchant\'s banner'
  },
  website: {
    type: String,
    description: 'Website of the merchant or agent'
  },
  stalls:  [{
    type: StallSchema
  }],
  status: {
    type: String,
    enum : ['Invited', 'Confirmed', 'Active', 'Deactivated'],
    default: 'Invited',
    description: 'Status of the merchant'
  },
  createdBy: {
    type: String,
    required: true,
    description: 'Unique identifier of the agent who created the merchant',
 },
 eventId: {
  type : Schema.Types.ObjectId, 
  ref : 'Event', 
  description : 'Id of the NOSTR event'
}, 
}, { timestamps: true });


module.exports = {
  MerchantSchema: MerchantSchema,
  MerchantModel: mongoose.model('Merchant', MerchantSchema)
};

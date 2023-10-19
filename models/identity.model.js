const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the Identifier schema
const IdentifierSchema = new Schema({
  provider: { type: String },
  privateKey: { type: String }, // TODO Salt with PIN
  properties: [{
    key: { type: String },
    value: { type: String },
  }],
  wallets: [{
    provider: { type: String },
    wallet: mongoose.Schema.Types.Mixed,  
  }]
}, { timestamps: true });

// Define the Identity schema
const IdentitySchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'Merchant', required: true }, // Reference to User schema
  session: { type: String },
  identifiers: [IdentifierSchema]
}, { timestamps: true });

module.exports = {
  IdentitySchema: IdentitySchema,
  IdentityModel: mongoose.model('Identity', IdentitySchema)
};

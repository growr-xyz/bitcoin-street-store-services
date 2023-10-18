const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the Product schema
const ProductSchema = new Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    description: 'The unique identifier of the product'
  },
  stallId: {
    type : Schema.Types.ObjectId, 
    ref : 'Stall', 
    description : 'Id of the stall (merchant) that the product belongs to'
  },
  name: {
    type: String,
    required: true,
    description: 'The name of the product'
  },
  description: {
    type: String,
    description: 'The description of the product'
  },
  images: [{
    type: String
  }],
  currency: {
    type: String,
    description: 'The currency used by the product'
  },
  price: {
    type: Number,
    description: 'The cost of the product'
  },
  quantity: {
    type: Number,
    description: 'The available items of the product'
  },
  specs: [{
    type: [String]
  }],
  shipping: [{
    id: {
      type: String,
      required: true,
      description: 'The unique identifier of the shipping zone'
    },
    cost: {
      type: Number,
      description: 'The extra cost for shipping to this zone. The currency is defined at the stall level'
    }
  }],
  isDraft: {
    type: Boolean,
    default: true,
    description: 'Whether the product is a draft or not'
  }
}, { timestamps: true });


// Define the ShippingZone schema
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
  }]
});

// Define the Stall schema
const StallSchema = new Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    description: 'The unique identifier of the stall'
  },
  name: {
    type: String,
    required: true,
    description: 'The name of the stall'
  },
  description: {
    type: String,
    description: 'The description of the stall'
  },
  currency: {
    type: String,
    default: 'sats',
    description: 'The currency used by the stall'
  },
  shipping: [{
    type: ShippingZoneSchema
  }],
  products: [{
    type: ProductSchema
  }],
  regions: [{
    type: String
  }],
  isDraft: {
    type: Boolean,
    default: true,
    description: 'Whether the product is a draft or not'
  }
}, { timestamps: true });


// Define the Merchant schema
const MerchantSchema = new Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    description: 'Unique identifier of the merchant'
  },
  name: {
    type: String,
    required: true,
    description: 'Name of the merchant'
  },
  mobileNumber: {
    type: String,
    description: 'Mobile phone of the merchant'
  },
  userName: {
    type: String,
    description: 'TBD'
  },
  walletAddress: {
    type: String,
    description: 'Address of the LN wallet address of the merchant'
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
  status: {
    type: String,
    enum : ['Draft','Confirmed'],
    default: 'Draft',
    description: 'Status of the merchant'
  },
  stalls:  [{
    type: StallSchema
  }],

  isDraft: {
    type: Boolean,
    default: true,
    description: 'Whether the product is a draft or not'
  }
}, { timestamps: true });

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
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Define the Identity schema
const IdentitySchema = new Schema({
  _id: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'Merchant', required: true }, // Reference to User schema
  session: { type: String, required: true },
  identifier: IdentifierSchema
});

module.exports = mongoose.model('Identity', IdentitySchema);

module.exports = {
  MerchantModel: mongoose.model('Merchant', MerchantSchema),
  StallModel: mongoose.model('Stall', StallSchema),
  ShippingZoneModel: mongoose.model('ShippingZone', ShippingZoneSchema),
  ProductModel: mongoose.model('Product', ProductSchema),
  AgentModel: mongoose.model('Agent', AgentSchema),
  IdentityModel: mongoose.model('Identity', IdentitySchema)
};

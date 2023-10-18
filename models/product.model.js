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
  status: {
    type: String,
    enum : ['Draft', 'Review', 'Active', 'Dectactived'],
    default: 'Draft',
    description: 'Status of the merchant'
  },
  eventId: {
    type : Schema.Types.ObjectId, 
    ref : 'Event', 
    description : 'Id of the NOSTR event'
  },
  createdBy: {
    type: String,
    required: true,
    description: 'Unique identifier of the agent who created the merchant',
 }



}, { timestamps: true });



module.exports = {
  ProductSchema: ProductSchema,
  ProductModel: mongoose.model('Product', ProductSchema)
};

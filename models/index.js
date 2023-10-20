module.exports = {
  MerchantModel: require('./merchant.model').MerchantModel,
  StallModel: require('./stall.model').StallModel,
  // ShippingZoneModel: require('./shipping-zone.model').ShippingZoneModel,
  ProductModel: require('./product.model').ProductModel,
  EventModel: require('./nostr-market-events.model').EventModel,
  AgentModel: require('./agents.model').AgentModel,
  IdentityModel: require('./identity.model').IdentityModel,
  OrderModel: require('./orders.model').OrderModel,
};

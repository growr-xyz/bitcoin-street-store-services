'use strict';

const { ServiceBroker } = require('moleculer');

module.exports.init = async function (services) {

  if (!services || services.length == 0) {
    throw new Error('Init error: at least one service must be registered!');
  }

  // initiate a broker
  const broker = new ServiceBroker({
    cacher: 'Memory',
    logger: false,
    validator: true,
    hotReload: true
  });

  await services.forEach(service => {
    try {
      const servicePath = `../services/${service}.service`
      const serviceSchema = require(servicePath);
      if (service == 'api') {
        //assign random port between 61000 and 62000
        serviceSchema.settings.port = Math.floor(
          Math.random() * (62000 - 61000) + 61000
        );
      }
      if (service == 'ussd') {
        //mock sendSMS function
        serviceSchema.actions.sendSMS = jest.fn();
      }
      broker.createService(serviceSchema);
    } catch (e) {
      throw new Error(`Init error: Invalid service - ${service}
      error:: ${e}
      `);
    }
  });

  return broker;

};

module.exports.loadService = async function (broker, service) {

  if (!broker || !broker.services || Array(broker.services).length == 0) {
    throw new Error('LoadService error: invalid broker!');
  }

  // check whether the service is already loaded
  const found = broker.services.find(s => s.name === service);
  if (found) {
    return broker; // do nothing as the service is already added
  }

  try {
    const serviceSchema = await require(`../services/${service}.service`);
    broker.createService(serviceSchema);
  } catch (e) {
    throw new Error(`Init error: Invalid service - ${service}`);
  }

  return broker;

}
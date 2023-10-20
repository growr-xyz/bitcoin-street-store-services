'use strict'
/* eslint-disable no-undef */

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

const DbService = require('../mixins/db.mixin')
const { OrderModel } = require('../models')

module.exports = {
  name: 'orders',

  /**
  * Settings
  */
  settings: {

  },
  mixins: [
    DbService('order', OrderModel),
  ],

  model: OrderModel,

  /**
  * Dependencies
  */
  dependencies: [],

  /**
  * Actions
  */
  actions: {
    /**
     * Register Lender
     */
    find: {
      async handler(ctx) {
        const entities = await this.adapter.find(ctx.params)
        return entities
      }
    },

    addOrder: {
      async handler(ctx) {
        const order = ctx.params
        //calculate total price (note: assumption is the currency is the same for all products)
        let price = 0;
        for (const product of order.products) {
          price += product.product.price * product.quantity
        }
        const entity = await this.actions.create({
          ...order,
          price,
          createdBy: ctx.params.createdBy || 'AGENT NOSTR PUBKEY IMPLEMENT WITH NIP 98'
        });
        return entity;
      }
    },

    list: {
      params: {
        merchantId: { type: 'string', required: true }
      },
      async handler(ctx) {
        const entities = await this.adapter.find({ query: { merchantId: ctx.params.merchantId } })
        return await Promise.all(entities.map(entity => this.transformDocuments(ctx, {}, entity)))
      }
    },

    listPending: {
      params: {
        merchantId: { type: 'string', required: true }
      },
      async handler(ctx) {
        const entities = await this.adapter.find(
          { query: { 
            merchantId: ctx.params.merchantId,
            delivered: false
          }
        });
        return await Promise.all(entities.map(entity => this.transformDocuments(ctx, {}, entity)))
      }
    },

    shipOrder: {
      params: {
        order: 'object'
      },
      async handler(ctx) {
        const { order } = Object.assign({}, ctx.params)
        const upd = await this.adapter.updateById(order._id, {
          $set: { shipped: true }
        })
        return upd._doc
      },
    },

    deliverOrder: {
      params: {
        order: 'object'
      },
      async handler(ctx) {
        const { order } = Object.assign({}, ctx.params)
        const upd = await this.adapter.updateById(order._id, {
          $set: { delivered: true }
        })
        return upd._doc
      },
    },

  },
  hooks: {
    before: {

    },

    after: {

    },
  },


  /**
  * Events
  */

  events: {
  },

  // /**
  //  * Methods
  //  */

  methods: {
  },

  // /**
  //  * Service created lifecycle event handler
  //  */
  // created() {

  // },

  // /**
  //  * Service started lifecycle event handler
  //  */
  async started() { },

  // /**
  //  * Service stopped lifecycle event handler
  //  */
  // async stopped() {

  // }
}

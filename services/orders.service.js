'use strict'
/* eslint-disable no-undef */

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

const DbService = require('../mixins/db.mixin')
const { OrderModel } = require('../models')
const moleculerNostrService = require('../nostr/moleculer-nostr-service')

module.exports = {
  name: 'orders',

  /**
  * Settings
  */
  settings: {

  },
  mixins: [
    DbService('order', OrderModel),
    moleculerNostrService
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
          {
            query: {
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

    readOrders: {
      params: {
        filter: 'object|optional',
      },
      async handler(ctx) {
        const { filter } = Object.assign({}, ctx.params)

        const latestOrder = await this.adapter.findOne({ query: { merchantId: ctx.meta.user._id } })
        
        if (latestOrder) {
          filter.since = Date(latestOrder.updatedAt).valueOf()
        }

        const identity = await ctx.call('nostr.getIdentity')
        const orders = await this.service.getDMs({ sk: identity.privateKey, filter })



        // const entities = await this.adapter.find(filter)
        // return await Promise.all(entities.map(entity => this.transformDocuments(ctx, {}, entity)))
      }
    }

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
    // TODO NOT FINISHED
    async processDM({ event, ndsAdapter }) {
      const decryptedEvents = await this.decryptDM({ event, ndsAdapter })
      try {
        const eventJson = JSON.parse(decryptedEvents)
        // event is order
        if (eventJson.content?.type && [0, 1, 2].includes(eventJson.content.type)) {
          return eventJson
        }
      } catch (e) {
        console.log(e)
      }
    },


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

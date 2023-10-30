'use strict'
const { nip19 } = require('nostr-tools')
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
        const checkOrder = await this.adapter.find({ query: { orderId: order.orderId } })
        if (checkOrder && checkOrder.length > 0) {
          return true
        }
        //calculate total price (note: assumption is the currency is the same for all products)
        let price = 0;
        for (const product of order.products) {
          price += product.product.price * product.quantity
        }
        const entity = await this.actions.create({
          ...order,
          price
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

    checkDmMessages: {
      async handler(ctx) {
        let createdAt
        let filter = {}
        const latestOrder = await this.adapter.findOne()
        if (latestOrder) {
          createdAt = new Date(latestOrder.createdAt).valueOf()
        }
        if (createdAt) {
          filter.since = Math.floor(createdAt / 1000)
        }
        const npubs = await ctx.call('identity.getAllNostrPubKeys')
        const npubsToCheck = []
        const dms = await this.actions.getAllDMsForPubKeys({ npubs, filters: filter })
        if (dms && dms.length > 0) {
          dms.forEach(dm => {
            let dmNpub
            dm.tags.forEach(tag => {
              if (tag[0] = 'p') dmNpub = nip19.npubEncode(tag[1])
            })
            npubsToCheck.push(dmNpub)
          })
        }
          if (npubsToCheck && npubsToCheck.length > 0) {
          return npubsToCheck
        }
        return []
      }
    },

    readOrdersForNpubs: {
      params: {
        npubs: 'array',
      },
      async handler(ctx) {
        const { npubs } =   Object.assign({}, ctx.params)
        for (let npub of npubs) {

          const identity = await ctx.call('identity.getIdentityByNostrPubkey', { npub })
          let adminKey = identity.identifiers
            .find(id => id.provider === 'lnbits').properties
            .find(prop => prop.key === 'admin').value
          console.log('adminKey: ', adminKey)
          const rawOrders = await ctx.call('lnbits.getOrders', { adminKey })
          rawOrders.sort((a, b) =>{
            new Date(a.event_created_at).valueOf() > new Date(b.event_created_at).valueOf()
          })
          const ordersToStore = []
          for (let order of rawOrders) {
            let orderToStore = {}
            const products = []
            for await (let item of order.items) {
              const product = await ctx.call('products.get', { id: item.product_id })
              products.push({ product, quantity: item.quantity })
            }
            orderToStore.products = products
            orderToStore.orderId = order.id
            orderToStore.shippingAddress = order.address
            orderToStore.customerPublicKey = order.public_key
            orderToStore.customerUserName = order.contact.email || 'Anon'
            orderToStore.merchantId = (await ctx.call('users.find', { query: { npub: order.merchant_public_key } }))[0]._id
            orderToStore.currency = order.extra.currency
            orderToStore.paid = order.paid
            orderToStore.shipped = order.shipped
            ordersToStore.push(orderToStore)
          }

          for await (let order of ordersToStore) {
            await ctx.call('orders.addOrder', order)
            // TODO EMIT FOR SMS TO MERCHANT
          }
          return true
        }
      }
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
        // This is directly from relay to merchant. We need from LNBits
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

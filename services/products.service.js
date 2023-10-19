'use strict'
/* eslint-disable no-undef */

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

const DbService = require('../mixins/db.mixin')
const ENUMS = require('../config/enums')
const { ProductModel } = require('../models')

const locale = process.env.LOCALE || 'en'

module.exports = {
  name: 'products',

  /**
  * Settings
  */
  settings: {

  },
  mixins: [
    DbService('product', ProductModel),
    // ConfigLoader(["site.**", "mail.**", "accounts.**"])
  ],

  model: ProductModel,

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
        //return await Promise.all(entities.map(entity => this.transformDocuments(ctx, {}, entity)))
        return entities
      }
    },

    addProduct: {
      async handler(ctx) {
        const stall = await ctx.call('stalls.find', { merchantId: ctx.params.merchantId });
        const entity = await this.actions.create({
          ...ctx.params,
          createdBy: 'AGENT NOSTR PUBKEY IMPLEMENT WITH NIP 98',
          stallId: stall[0]._id,
        });
        // return await this.transformDocuments(ctx, {}, entity);
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
        // return entities
      }
    },

    updateQuantity: {
      params: {
        product: 'object',
        quantity: 'number'
      },
      async handler(ctx) {
        const { product, quantity } = Object.assign({}, ctx.params)
        const upd = await this.adapter.updateById(product._id, {
          $set: { quantity: quantity }
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

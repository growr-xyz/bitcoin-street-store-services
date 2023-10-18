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
    // find: {
    //   async handler(ctx) {
    //     const entities = await this.adapter.find(ctx.params);
    //     return await Promise.all(entities.map(entity => this.transformDocuments(ctx, {}, entity.populate('stalls'))));
    //   }
    // },

    addProduct: {
      async handler(ctx) {
        const entity = await this.actions.create(ctx.params);
        return await this.transformDocuments(ctx, {}, entity.populate('stall'));
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
  },

  // /**
  //  * Service created lifecycle event handler
  //  */
  // created() {

  // },

  // /**
  //  * Service started lifecycle event handler
  //  */
   async started() {},

  // /**
  //  * Service stopped lifecycle event handler
  //  */
  // async stopped() {

  // }
}

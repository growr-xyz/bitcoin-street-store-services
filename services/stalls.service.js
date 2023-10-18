'use strict'
/* eslint-disable no-undef */

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

const DbService = require('../mixins/db.mixin')
const ENUMS = require('../config/enums')
const { StallModel } = require('../models')

const locale = process.env.LOCALE || 'en'

module.exports = {
  name: 'stalls',

  /**
  * Settings
  */
  settings: {

  },
  mixins: [
    DbService('stall', StallModel),
        // ConfigLoader(["site.**", "mail.**", "accounts.**"])
  ],

  model: StallModel,

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
    //     return entities
    //     // return await Promise.all(entities.map(entity => this.transformDocuments(ctx, {}, entity.populate('stalls'))));
    //   }
    // },


    addStall: {
      async handler(ctx) {
        const entity = await this.actions.create(ctx.params);
        return entity
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

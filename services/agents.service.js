'use strict'
/* eslint-disable no-undef */

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

const DbService = require('../mixins/db.mixin')
const ENUMS = require('../config/enums')
const { AgentModel } = require('../models')

const locale = process.env.LOCALE || 'en'

module.exports = {
  name: 'agents',

  /**
  * Settings
  */
  settings: {

  },
  mixins: [
    DbService('agent', AgentModel),
        // ConfigLoader(["site.**", "mail.**", "accounts.**"])
  ],

  model: AgentModel,

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
    resolveUser: {
      params: {
        npub: 'string'
      },
      async handler(ctx) {
          const agent = (await this.actions.find({ query: {pubkey: ctx.params.pubkey} }))[0]
          if (!agent) {
            return null
          }
          ctx.emit('agent.logged', {
            agentId: agent._id,
            pubkey: agent.pubkey
          })
          return agent
      }
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
   async started() {},

  // /**
  //  * Service stopped lifecycle event handler
  //  */
  // async stopped() {

  // }
}

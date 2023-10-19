'use strict'
/* eslint-disable no-undef */

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */
const nostr = require('nostr-tools')

const {
  Kind,
} = nostr

const DbService = require('../mixins/db.mixin')
const { EventModel } = require('../models')
const locale = process.env.LOCALE || 'en'

module.exports = {
  name: 'nostr-events',

  /**
  * Settings
  */
  settings: {

  },
  mixins: [
    DbService('events', EventModel),
    // ConfigLoader(["site.**", "mail.**", "accounts.**"])
  ],

  model: EventModel,

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

    'nostr-events.user.created': {
      async handler({ event, userId, nprofile }) {
        const createdEvent = await this.storeEvent(event);
        await this.broker.emit('users.updateProfile', {
          userId,
          nprofile,
          eventId: createdEvent._id
        })
      }
    },
  },

  // /**
  //  * Methods
  //  */

  methods: {
    async storeEvent(event) {
      return await this.actions.create({
        eventId: event.id,
        kind: Kind.Metadata,
        rawJson: JSON.stringify(event),
      })
    }
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

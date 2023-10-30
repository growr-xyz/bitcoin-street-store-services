/* eslint-disable no-undef */
'use strict'
const cron = require("node-cron");

module.exports = {
  name: 'cron-job',

  mixins: [],

  actions: {
    getOrders: {
      handler: async (ctx) => {
        const npubs = await ctx.call('orders.checkDmMessages')
        await ctx.call('orders.readOrdersForNpubs', { npubs })
        return true
      }
    },
    started() {
      if (process.env.NOSTR_FETCH_ORDERS_PATTERN) {
        cron.schedule(process.env.NOSTR_FETCH_ORDERS_PATTERN, () => {
          this.actions.getOrders()
        });
      }

    }
  }
}

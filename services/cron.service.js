/* eslint-disable no-undef */
'use strict'
const cron = require("node-cron");

module.exports = {
  name: 'cron-job',

  mixins: [],

  actions: {
    // getNostrInvestments: {
    //   handler: async (ctx) => {
    //     const allProjectKeys = await ctx.call('nds.keys')
    //     for (const projectKey of allProjectKeys) {
    //       // const project = await ctx.call('nds.get', projectKey)
    //       await ctx.call('nostr.getInvestments', { projectKey })
    //     }
    //     return
    //   }
    // },
    started() {
      // if (process.env.NOSTR_FETCH_ZAPS_CRON_PATTERN) {
        // cron.schedule(process.env.NOSTR_FETCH_ZAPS_CRON_PATTERN, () => {
        //   this.actions.getNostrInvestments()
        // });
      // }

    }
  }
}


'use strict'

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

const { GrowrAgent } = require('growr-agent-sdk')
const DbService = require('../mixins/db.mixin')
const { MoleculerClientError } = require('moleculer').Errors
const utils = require('../middlewares/misc-util');
const ENUMS = require('../config/enums');
const NOSTRService = require('../nostr/moleculer-nostr-service')
const identityMixin = require('../mixins/identity');
const nostrService = require('./nostr.-service');
const { IdentityModel } = require('../models');
const getName = require('goofy-names');

module.exports = {
  name: 'identity',

  /**
   * Settings
   */


  mixins: [
    DbService('identity', IdentityModel),
    NOSTRService,
    identityMixin,

  ],
  model: IdentityModel,
  settings: {
  },


  /**
   * Dependencies
   */
  dependencies: [
  ],

  /**
   * Actions
   */
  actions: {
    /**
     * Request Verification 
     */

  },


  /**
   * Events
   */
  events: {
    // async 'user.updated'(ctx) {
    //   const { userId, keys, value } = ctx.params

    // }
  },

  // /**
  //  * Methods
  //  */
  methods: {
    async createIdentity(identityOptions) {
      const { params, props } = identityOptions
      const { userId } = params
      const {
        nprofile,
        npub,
        nsec,
        profileEvent
      } = await this.createProfile(props)

      const nostrPproperties = [{
        key: 'npub',
        value: npub,
      }, {
        key: 'nprofile',
        value: nprofile,
      }]

      const nostrIdentifier = {
        provider: process.env.IDENTITY_PROVIDER,
        privateKey: nsec,
        properties: nostrPproperties
      }

      const { username, nip05 } = props
      const lnBitsUser = await this.broker.call('lnbits.createUser', {
        username,
        walletName: `${username}-merchant-wallet`,
        email: nip05,
        password: nsec
      })

      const walletProperties = [{
        key: 'name',
        value: lnBitsUser.name
      }, {
        key: 'email',
        value: lnBitsUser.email
      }, {
        key: 'admin',
        value: lnBitsUser.admin
      }, {
        key: 'password',
        value: lnBitsUser.password
      }]

      const walletIdentifier = {
        provider: process.env.WALLET_PROVIDER,
        privateKey: lnBitsUser.id,
        properties: walletProperties,
        wallets: lnBitsUser.wallets
      }

      await this.broker.emit('nostr-events.user.created', {
        event: profileEvent,
        userId,
        nprofile
      })


      return {
        userId,
        identifiers: [
          nostrIdentifier,
          walletIdentifier
        ],
      }
    },

    async createProfile(props) {

      const {
        username,
        fullName,
        about,
        picture,
        nip05,
        lud16,
        banner,
        website
      } = props

      const { profileEvent, nprofile, npub, nsec } = await this.actions.createProfile({
        website: website || `www.${process.env.NODE_DOMAIN}`,
        picture: picture ? picture : '',
        banner: banner ? banner : '',
        display_name: username,
        name: fullName,
        about,
        nip05,
        lud16
      })

      return {
        profileEvent,
        nprofile,
        npub,
        nsec
      }
    },
  },

  hooks: {
    // after: { // TODO encrypt QR with API key
    //   async registerUser(ctx, _id) {
    //     const user = await this.adapter.findOne({ _id })
    //     await this.adapter.updateById(_id, { $set: { qr: _id } })
    //     return _id
    //   }
    // }
  }

}
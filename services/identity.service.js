
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
const { IdentityModel } = require('../models');
const getName = require('goofy-names');
const { nip19 } = require('nostr-tools')

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
    getLnBitsData: {
      async handler(ctx) {
        const user = ctx.meta.user
        const identity = (await this.actions.find({ query: { userId: { $eq: user._id } } }))[0]
        if (user.session !== identity.session) {
          throw new MoleculerClientError(401, 'Invalid session')
        }
        const lnBitsCredentials = identity.identifiers.find(identifier => identifier.provider === process.env.WALLET_PROVIDER)
        const wallet = lnBitsCredentials.wallets[0]
        const stallId = lnBitsCredentials.properties.find(property => property.key === 'stallId').value
        const merchantId = lnBitsCredentials.properties.find(property => property.key === 'merchantId').value

        return { wallet, stallId, merchantId }
      }
    },

    getNostrIdentity: async (ctx) => {
      const user = ctx.meta.user
      const identity = (await this.actions.find({ query: { userId: { $eq: user._id } } }))[0]
      if (user.session !== identity.session) {
        throw new MoleculerClientError(401, 'Invalid session')
      }
      const nostrIdentifier = identity.identifiers.find(identifier => identifier.provider === process.env.IDENTITY_PROVIDER)
      return {
        privateKey: nostrIdentifier.privateKey,
        nprofile: nostrIdentifier.properties.find(property => property.key === 'nprofile').value,
        npub: nostrIdentifier.properties.find(property => property.key === 'npub').value
      }
    },

    getAllNostrPubKeys: async () => {
      const aggregated = await IdentityModel.aggregate([
        { $unwind: "$identifiers" },
        { $match: { "identifiers.provider": "nostr" } },
        { $unwind: "$identifiers.properties" },
        { $match: { "identifiers.properties.key": "npub" } },
        {
          $group: {
            _id: null,
            npubValues: { $push: "$identifiers.properties.value" }
          }
        }
      ])
      return aggregated[0].npubValues
    }
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

      await this.broker.emit('nostr-events.user.created', {
        event: profileEvent,
        userId,
        nprofile,
        npub
      })

      await this.broker.call('lnbits.activateExtension', {
        extensionName: 'nostrclient',
        userId: lnBitsUser.id,
        active: true
      })


      await this.broker.call('lnbits.activateExtension', {
        extensionName: 'nostrmarket',
        userId: lnBitsUser.id,
        active: true
      })

      const merchant = await this.broker.call('lnbits.createMerchant', {
        privateKey: nip19.decode(nsec).data,
        publicKey: nip19.decode(npub).data,
        adminKey: lnBitsUser.wallets[0].adminkey
      })

      const stall = (await this.broker.call('stalls.find', { query: { merchantId: userId } }))[0]
      const shippingZone = await this.broker.call('lnbits.getShippingZone', { adminKey: lnBitsUser.wallets[0].adminkey })

      const stallToPublish = {
        wallet: lnBitsUser.wallets[0].id,
        name: stall.name,
        currency: stall.currency,
        shipping_zones: [
          {
            id: shippingZone[0].id,
            name: shippingZone[0].name,
            currency: stall.currency,
            cost: shippingZone[0].cost,
            countries: shippingZone[0].countries
          }
        ],
        config: {
          image_url: null,
          description: stall.description,
        },
        pending: false
      }

      const publishedStall = await this.broker.call('lnbits.createStall', {
        stall: stallToPublish,
        adminKey: lnBitsUser.wallets[0].adminkey
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
      }, {
        key: 'merchantId',
        value: `${merchant.id}`
      }, {
        key: 'stallId',
        value: `${publishedStall.id}`
      }]

      const walletIdentifier = {
        provider: process.env.WALLET_PROVIDER,
        privateKey: lnBitsUser.id,
        properties: walletProperties,
        wallets: lnBitsUser.wallets
      }

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
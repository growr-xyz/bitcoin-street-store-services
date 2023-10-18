
'use strict'

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

// const { GrowrAgent } = require('growr-agent-sdk')
// const DbService = require('../mixins/db.mixin')
const { MoleculerClientError } = require('moleculer').Errors
// const utils = require('../../middlewares/misc-util');
// const ENUMS = require('../config/enums');

module.exports = {
  name: '',
  metadata: {
    $category: 'identity',
    $description: 'Moleculer GROWR Identity Service',
    $official: false,
    $package: {
      name: 'moleculer-growr-identity-service',
      version: '0.0.1',
      repo: null
    }
  },

  mixins: [
    // DbService('identity'),
  ],
  settings: {
    fields: {
      _id: 'string',
      userId: 'string',
      session: 'string', //  [BSS] user & ussd service to rename ussdSession to session
      identifier: {
        type: 'object',
        hidden: false,
        properties: {
          provider: 'string', // TODO [BSS] make enums for providers
          value: 'string', // public key, did, etc
          privateKey: 'string', // reference to private key in key store?
          walletAddress: 'string|optional', // wallet address
        },

        credentials: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              type: 'string'
            },
            value: {
              type: 'string'
            }
          }
        },
        createdAt: { type: 'number', onCreate: () => Date.now() },
        updatedAt: { type: 'number', onUpdate: () => Date.now() }
      },
    },
  },

  dependencies: [],

  actions: {
    createIdentity: {
      params: {
        props: {
          type: 'object|optional',
        }
      },
      async handler(ctx) {
        const { user } = Object.assign({}, ctx.meta)
        const identity = await this.findOne({ userId: user._id })
        if (identity) {
          throw new MoleculerClientError('User already has an identity')
        }
        const newIdentity = {
          userId: user._id,
          fullName: user.fullName || null,
          identifier: {
            provider: process.env.IDENTITY_PROVIDER,
          },
          createdAt: Date.now(),
          updatedAt: Date.now()
        }
        const identityToStore = this.createIdentity({ params: newIdentity, props: ctx.params.props, ctx })
        if (props && Object.keys(props).length > 0) {
          if (props.createWalletAddress) {
            identityToStore.identifier.walletAddress = await this.createWalletAddress()
          }
        }
      }
    },

    findUserByIdentifier: {
      params: {
        provider: { type: 'string', required: true },
        identifier: { type: 'string', required: true }
      },
      async handler(ctx) {
        const { provider, identifier } = Object.assign({}, ctx.params)
        let identity = await this.findOne({
          'identifier.provider': provider,
          'identifier.value': identifier
        })
        if (!identity || !identity.userId) {
          throw new MoleculerClientError('This DID is not into custody')
        }
        identity = await ctx.call('users.get', { id: identity.userId })
        return identity
      }
    },

    setSession: {
      async handler(ctx) {
        const { user } = Object.assign({}, ctx.meta)
        const identity = await this.findOne({ userId: user._id })
        if (!identity) {
          throw new MoleculerClientError('User does not exist')
        }
        identity.session = user.session
        await ctx.call('identity.update', { id: identity._id, ...identity })
        return true
      }
    },




  },
  events: {},

  methods: {

    async findOne(params) {
      return this.adapter.findOne(params)
    },

    async createIdentity(params) {
      this.logger.info('method createIdentity is Not implemented in current identity service')
      return {}
    },

    async createWalletAddress(params) {
      this.logger.info('method createWalletAddress is Not implemented in current identity servcice')
      return {}
    }

    // entityToRes(entity, fields) {

    //   return Object.fromEntries(
    //     Object.entries(entity).filter(
    //       ([k, v]) => fields.includes(k) ? [k, v] : []
    //     )
    //   )
    // },


  },

  hooks: {
  }

}
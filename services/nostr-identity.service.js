
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
const nostrService = require('./nostr.service');

module.exports = {
  name: 'identity',

  /**
   * Settings
   */


  mixins: [
    DbService('identity'),
    NOSTRService,
    identityMixin,

  ],
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

    createUserProfile: {
      params: {
        username: 'string|required',
        fullName: 'string|optional',
        about: 'string|optional',
        picture: 'string|url|optional',
        nip05: 'string|optional',
        lud16: 'string|optional',
        banner: 'string|url|optional',
        website: 'string|optional'
      },
      async handler(ctx) {
        const {
          id,
          picture,
          banner
        } = ctx.params
        const { profileEvent, nprofile, npub, nsec } = await this.actions.createIdentity({
          website: website || `www.${process.env.NODE_DOMAIN}`,
          picture: picture ? picture : '',
          banner: banner ? banner : ''
        })

        // TODO Consider to add it to identity?
        await ctx.call('nds.set', {
          key: id, value: {
            nsec,
            npub,
            profile: nprofile
          }
        })

        return { profileEvent, nprofile, npub }

      }
    },
    

/*
    createWallet: {
      // params: {
      //   userId: { type: 'string', required: true },
      // },
      async handler(ctx) {
        //const { userId } = Object.assign({}, ctx.params)
        if (!ctx.meta.user || !ctx.meta.user._id) {
          throw new MoleculerClientError('Invalid user')
        }
        const userId = ctx.meta.user._id;
        const identity = await this.adapter.findOne({ userId })
        if (identity) {
          return identity.identity.did
        }
        // TODO add config to mainnet
        const wallet = await GrowrAgent.createWallet(
          ENUMS.networkConfigs[process.env.BLOCKCHAIN].network[process.env.BC_NETWORK]
        )
        // TODO private key should be distributed as Shamir Secret Sharing Algorithm on later stage
        // TODO [now] check mnenonic empty
        const { privateKey, mnemonic, address } = wallet
        // TODO add config for mainnet or testnet
        const did = (await GrowrAgent.getDid({
          didConfig: {
            privateKey: privateKey.substring(2),
            networkName: ENUMS.networkConfigs[process.env.BLOCKCHAIN].provider[process.env.BC_NETWORK].name,
          }
        })).did.toLowerCase().trim()
        const entity = { userId }
        entity.identity = { privateKey, mnemonic, address, did }
        entity.vcs = []
        await ctx.call('identity.create', entity)
        return did
      }
    },

    findUserByDid: {
      params: {
        did: { type: 'string', required: true },
      },
      async handler(ctx) {
        const { did } = ctx.params
        let user = await this.adapter.findOne({
          'identity.did': did
        })
        if (!user || !user.userId) {
          throw new MoleculerClientError('This DID is not into custody')
        }
        user = await ctx.call('users.get', { id: user.userId })
        return user
      }
    },


    // **
    // * Standartize mixin and add verifications per implementation
    // **    
    setSession: {
      async handler(ctx) {
        const { user } = Object.assign({}, ctx.meta)
        const identity = await this.adapter.findOne({ userId: user._id })
        if (!identity) {
          throw new MoleculerClientError('User does not exist')
        }
        identity.ussdSession = user.ussdSession
        await ctx.call('identity.update', { id: identity._id, ...identity })
        // await this.actions.update(identity)
        return true
      }
    },

    getVC: {
      params: {
        //userId: { type: 'string', required: true },
        type: { type: 'string', required: true }
        //session: { type: 'string', required: true }
      },
      async handler(ctx) {
        const {
          //userId,
          userData,
          type
          //session
        } = Object.assign({}, ctx.params)
        const userId = ctx.meta.user._id;
        const session = ctx.meta.user.ussdSession;
        const identity = await this.adapter.findOne({ userId })
        if (!identity) {
          throw new MoleculerClientError('User does not exist')
        }
        // **
        // * Standartize mixin and add verifications per implementation
        // **
        if (identity.ussdSession !== session) {
          throw new MoleculerClientError('Session does not match')
        }
        // **

        const vc = await ctx.call('issuer.issueVC', {
          userData,
          did: identity.identity.did,
          type
        })
        const t = utils.capitalizeFirstLetter(type)
        const vcMap = new Map()
        identity.vcs.map(vc => vcMap.set(vc.type, vc))
        vcMap.set(t, { type: t, vc })
        const vcs = Array.from(vcMap.values(), (value => value))
        identity.vcs = vcs
        await ctx.call('identity.update', { id: identity._id, ...identity })
        // return this.actions.update(identity)
      }
    },

    getCredentialTypes: {
      params: {
        // userId: { type: 'string', required: true },
        // session: { type: 'string', required: true }
      },
      async handler(ctx) {
        // const {
        //   userId,
        //   session
        // } = Object.assign({}, ctx.params)
        const userId = ctx.meta.user._id;
        const session = ctx.meta.user.ussdSession;
        const identity = await this.adapter.findOne({ userId })
        if (!identity) {
          throw new MoleculerClientError('User does not exist')
        }
        if (identity.ussdSession !== session) {
          throw new MoleculerClientError('Session does not match')
        }
        // **
        // * Standartize mixin and add verifications per implementation (USSD Session, etc)
        // ** 
        return identity.vcs.map(vc => vc.type)
      }
    },

    createPresentation: {
      params: {
        // userId: { type: 'string', required: true },
        // session: { type: 'string', required: true },
        vcTypes: {
          type: 'array',
          elements: { type: 'string' }
        }
      },
      async handler(ctx) {
        const {
          // userId,
          // session,
          vcTypes
        } = Object.assign({}, ctx.params)
        const userId = ctx.meta.user._id;
        const session = ctx.meta.user.ussdSession;
        const identity = await this.adapter.findOne({ userId })
        if (!identity) {
          throw new MoleculerClientError('User does not exist')
        }
        if (identity.ussdSession !== session) {
          throw new MoleculerClientError('Session does not match')
        }
        const agent = await this.getAgent(identity)
        const vp = await this.createPresentation(identity, agent, vcTypes)
        return vp

      }
    },

    applyForLoan: {
      params: {
        projectId: 'string',
        vcTypes: 'array',
        //session: 'string',
        loan: 'object'
      },
      async handler(ctx) {
        const {
          projectId,
          vcTypes,
          //session,
          loan
        } = Object.assign({}, ctx.params)
        const { user } = ctx.meta
        const identity = await this.adapter.findOne({
          userId: user._id
        })
        if (!identity) {
          throw new MoleculerClientError('User does not exist')
        }
        if (identity.ussdSession !== user.ussdSession) {
          throw new MoleculerClientError('Session does not match')
        }
        const agent = await this.getAgent(identity)
        const vp = await this.createPresentation(identity, agent, vcTypes)
        const loanUpdated = {
          ...loan,
          ...{
            userDid: identity.identity.did,
            // disbursmentFee: 'string', // input
            projectId
          }
        }

        // TODO select verifier
        try {
          const loanId = await ctx.call('loan-book.approveLoan', {
            userDid: identity.identity.did, vp, projectId, loan: loanUpdated
          })
          return loanId
        } catch (e) {
          // TODO capture error to log
          throw new MoleculerClientError(e.message)
        }
      }
    },

    signLoanApproval: {
      params: {
        loanDraftId: 'string'
        //session: 'string'
      },
      async handler(ctx) {
        //const { loanDraftId, session } = Object.assign({}, ctx.params)
        const { loanDraftId } = Object.assign({}, ctx.params)
        const { user } = ctx.meta
        const identity = await this.adapter.findOne({
          userId: user._id
        })
        if (!identity) {
          throw new MoleculerClientError('User does not exist')
        }
        if (identity.ussdSession !== user.ussdSession) {
          throw new MoleculerClientError('Session does not match')
        }
        const agent = await this.getAgent(identity)
        const signedKey = await agent.identity.signJWT({ nonce: loanDraftId })
        const loanId = await ctx.call('loan-book.signLoan', {
          signedKey, did: identity.identity.did
        })
        return loanId
      }
    },
    getLoansForDid: {
      async handler(ctx) {
        const userId = ctx.meta.user._id;
        const session = ctx.meta.user.ussdSession;
        const identity = await this.adapter.findOne({ userId })
        if (!identity) {
          throw new MoleculerClientError('User does not exist')
        }
        if (identity.ussdSession !== session) {
          throw new MoleculerClientError('Session does not match')
        }
        const loans = await ctx.call('loan-book.getLoansForDid', { userDid: identity.identity.did })
        return loans
      }
    }*/

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
    // decodeMessage(otp, message) { // TODO move to middleware ?
    //   return bytes = CryptoJS.AES.decrypt(message, otp).toString(CryptoJS.enc.Utf8);
    // },


    async getAgent(identity) {
      const { privateKey } = identity.identity
      const agent = await GrowrAgent.getAgent({
        didConfig: {
          privateKey: privateKey.substring(2),
          networkName: ENUMS.networkConfigs[process.env.BLOCKCHAIN].provider[process.env.BC_NETWORK].name
        },
        providerConfig: {
          networks: [ENUMS.networkConfigs[process.env.BLOCKCHAIN].provider[process.env.BC_NETWORK]]
        },
        networkConfig: ENUMS.networkConfigs[process.env.BLOCKCHAIN].network[process.env.BC_NETWORK]
      })
      return agent
    },

    // entityToRes(entity, fields) {

    //   return Object.fromEntries(
    //     Object.entries(entity).filter(
    //       ([k, v]) => fields.includes(k) ? [k, v] : []
    //     )
    //   )
    // },

    async createPresentation(identity, agent, types) {
      const vcs = identity.vcs.filter(vc => types.includes(vc.type))
      const jwts = vcs.map(vc => vc.vc)
      const vp = await agent.VC.createPresentation(jwts)
      return vp
    },

    // async getBestOffer(agent, invoice, vcs) {
    //   const { amount } = invoice
    //   const duration = 6 // TODO how to determine duration? // TODO [now] set it as env
    //   const bestOffer = await agent.getBestOffer(amount, duration, vcs)
    //   return bestOffer
    // },

    // async getVcs(agent, types) {
    //   const user = await ctx.call('identity-resolver.find', {
    //     query: { did: agent.did, valid: true } })
    //   return user.vcs
    // },

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
'use strict'
/* eslint-disable no-undef */

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

const DbService = require('../mixins/db.mixin')
const ENUMS = require('../config/enums')
const bcrypt = require('bcrypt')
const otpGenerator = require('otp-generator')
const { MoleculerRetryableError, MoleculerClientError } = require('moleculer').Errors
const moment = require('moment')
// const { ObjectId } = require('mongodb') // or ObjectID 
// const HASH_SALT_ROUND = 10
// const TOKEN_EXPIRATION = 60 * 60 * 1000 // 1 hour

let messages
const locale = process.env.LOCALE || 'en'

module.exports = {
  name: 'users',

  /**
  * Settings
  */
  settings: {
    fields: {
      _id: 'string',
      role: {
        type: 'enum',
        values: Object.values(ENUMS.userRoles)
      },
      /* TODO [BSS] Create new model based on 
      
      1. nostr user profile:

      params: {
        username: 'string|required',
        about: 'string|optional',
        picture: 'string|url|optional',
        nip05: 'string|optional',
        lud16: 'string|optional',
        banner: 'string|url|optional',
        website: 'string|optional'
      },

      2. LN Bits user:

      {
        id: '6c120fa5debcf20ab0b44407af85c5e3',
        name: 'madGrowr',
        admin: 'bc297e571854bbd84f44f813aef85004',
        email: 'mad@growr.xyz',
        password: '!Gr3w',
        wallets: [
          {
            id: '829c490cc5e1883a3a3465a25f26754a',
            admin: 'bc297e571854bbd84f44f813aef85004',
            name: 'nostr-merch-wallet',
            user: '6c120fa5debcf20ab0b44407af85c5e3',
            adminkey: '51837ea61b6592e99a34dc12e4901c8e',
            inkey: '81c3e32c397891baa2a4b5be1ac3cbf6'
          }
        ]
      }

      3. USSD Controls - phone + session + otp + pin

      4. Agent props

      5. Role

      */

      password: { type: 'string', nullable: true, optional: true },
      email: { type: 'string', required: true },
      username: { type: 'string', required: true },
      avatar: { type: 'string', nullable: true, optional: true },
      fullName: { type: 'string', nullable: true, optional: true },
      phone: { type: 'string', nullable: true },
      otp: { type: 'string', nullable: true },
      pin: { type: 'string', nullable: true },
      state: {
        type: 'enum',
        values: Object.values(ENUMS.userStates)
      },
      ussdState: {
        type: 'enum',
        values: Object.values(ENUMS.ussdStates)
      },
      ussdSession: { type: 'sring', nullable: true, optional: true },
    }
  },
  mixins: [
    DbService('users'),
    // ConfigLoader(["site.**", "mail.**", "accounts.**"])
  ],


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


    // TODO [BSS] Change to agent
    registerLenderConsultant: {
      params: {
        phone: { type: 'string', required: true },
        fullName: { type: 'string', required: true },
        recordId: { type: 'string', optional: true },
        organizationId: { type: 'string', required: true },
      },
      async handler(ctx) {
        const { phone, fullName, recordId, organizationId } = Object.assign({}, ctx.params)
        try {
          await ctx.call('organizations.get', {
            id: organizationId
          });
        } catch (e) {
          throw new MoleculerClientError('No such organization')
        }
        const user = {
          phone,
          fullName,
          recordId,
          organizationId,
          role: ENUMS.userRoles['LENDER_CONSULTANT'],
          invitation: { state: ENUMS.invitationState.PENDING }
        }

        return this.actions.create(user)
      }
    },



    setPin: {
      params: {
        user: 'object',
        pin: 'string'
      },
      async handler(ctx) {
        const { user, pin } = Object.assign({}, ctx.params)
        const pinString = await bcrypt.hash(pin, 10)
        const upd = await this.adapter.updateById(user._id, {
          $set: { pin: pinString }
        })
        return upd
      },
    },

    checkPin: {
      params: {
        user: { type: 'object', required: true },
        pin: { type: 'string', required: true }
      },
      async handler(ctx) {
        const { user, pin } = Object.assign({}, ctx.params)
        if (await bcrypt.compare(pin, user.pin)) {
          return true
        }
        return false
      }
    },


    // TODO [BSS] User NOSTR pubkey to resolve user

    resolveUser: {
      params: {
        pubkey: 'string'
      },
      async handler(ctx) {
        try {
          const user = await this.actions.get({ pubkey: ctx.params.pubkey })
          // if (!user) {
          //   throw new Error('No such user')
          // }
          ctx.emit('user.logged', {
            userId: user._id
          })
          return user
        } catch (e) {
          throw new MoleculerClientError('User not found')
        }
      }
    },

    getByUserId: {
      params: {
        userId: 'string'
      },
      async handler(ctx) {
        try {
          const user = await this.actions.get({ id: ctx.params.userId })
          return user
        } catch (e) {
          return null // no such user
        }
      }
    },

    // TODO [BSS] Modify to new interface
    addMerchant: {
      params: {
        fullName: { type: 'string', optional: true },
        phone: { type: 'string', required: true },
      },
      async handler(ctx) {
        const {
          fullName,
          phone,
        } = Object.assign({}, ctx.params)

        let user = await this.adapter.findOne({ phone })

        if (!user) {


          user = await this.actions.create({
            phone,
            fullName: fullName || '',
          })
          return user
        } else {
          throw new MoleculerClientError('User with this phone number exists')
        }
      }
    },

        // TODO [BSS] Modify to new interface
    updateMerchant: {
      params: {
        phone: { type: 'string', required: true },
        fullName: { type: 'string', optional: true },
      },
      async handler(ctx) {
        const {
          phone,
          data
        } = Object.assign({}, ctx.params)
        const updatedUserData = ctx.params
        delete updatedUserData.data
        let user = await this.adapter.findOne({ phone })
        if (!user) {
          throw new MoleculerClientError('User does not exist')
        } else {
          // merge the user:
          user = {
            ...user,
            ...updatedUserData
          }
          await ctx.call('users.update', { id: user._id, ...user })
        }
        // TODO find better way to clean up the response of sensitive data
        !!user.otp && delete user.otp
        !!user.pin && delete user.pin
        !!user.ussdSession && delete user.ussdSession
        return user
      }
    },

    getMerchantOtp: {
      params: {
        id: { type: 'string', required: true },
        phone: { type: 'string', required: true }
      },
      async handler(ctx) {
        const { id, phone } = Object.assign({}, ctx.params)
        const otp = await this.generateOTP(id)
        this.logger.info('user OTP::', otp) // TEMP
        
        await ctx.call('ussd.sendSMS', {
          to: phone,
          message: menu.con(messages[locale]['members.invite'](otp))
        })
        return true
      }
    },

    getOtp: {
      params: {
        email: { type: 'email', required: true },
        role: {
          type: 'enum',
          required: true,
          values: [
            ENUMS.userRoles.INVESTOR,
            ENUMS.userRoles.LENDER,
            ENUMS.userRoles.ADMIN
          ]
        },
        organizationId: { type: 'string', optional: true }
      },
      async handler(ctx) {
        const { email, role, organizationId } = ctx.params
        let user = await this.adapter.findOne({ email })
        if (!user && role === ENUMS.userRoles.ADMIN) {
          user = await this.actions.create({ email, role, organizationId })
        }
        const otp = await this.generateOTP(user._id)
        console.log('User OTP:', otp) // TEMP
        ctx.emit('user.email.otp', { user, role, otp })
        return true
      }
    },

    validateOtp: {
      params: {
        user: 'object',
        otp: 'string'
      },
      async handler(ctx) {
        const { user, otp } = Object.assign({}, ctx.params)
        if ((await this.validateOtp(user, otp))) {
          user.otp.validated = true
          // try {
          await ctx.call('users.update', { id: user._id, ...user })
          // } catch (e) {
          //   console.log('Error539:', e.message);
          //   console.log('Error540:', e.stack);
          // }

        }
        return user
      }
    },


    // TODO [BSS] Do we need it? Modify to new interface
    addUser: {
      params: {
        $$strict: true,
        fullName: { type: 'string', required: true },
        phone: { type: 'string', nullable: true, optional: true },
        invitation: {
          type: 'object',
          optional: true,
          properties: {
            state: {
              type: 'enum',
              required: true,
              values: Object.values(ENUMS.invitationState)
            }
          }
        },
        role: {
          type: 'enum',
          required: true,
          values: Object.values(ENUMS.userRoles)
        }
      },
      async handler(ctx) {
        const {
          fullName,
          phone,
          role,
          invitation = {}
        } = Object.assign({}, ctx.params)

        // check for unique phone number
        let user = await this.adapter.findOne({ phone });
        if (user && user.phone) {
          throw new MoleculerClientError('User with this phone number exists');
        }

        // create the user
        user = await this.actions.create({
          fullName, phone, email, position, role, organizationId, registered: false, invitation
        });
        return user;
      }
    },


  },
  hooks: {
    before: {
      '*': ctx => {
        if (ctx.params.email) {
          ctx.params.email = ctx.params.email.toLowerCase()
          return ctx
        }
      }
    },

    after: {
      // async addUser(ctx, user) {
      //   try {
      //     const organization = await ctx.call('organizations.get', {
      //       id: user.organizationId
      //     });
      //     ctx.emit('user.email.invite', { user, organization }) // TODO Emit
      //   } catch (e) {
      //     // do nothing - no organization
      //   }
      //   return user
      // },

      async update(ctx, user) {
        if (ctx.caller === 'ussd' &&
          ctx.meta.user.state !== user.state
        ) {
          await ctx.emit('ussd.update.state.cb', { user })
        }
      },
      // after: {
      //   async inviteUserToProject(ctx, _id) {
      //     const otp = await this.generateOTP(_id)
      //     ctx.broadcast('user.otp', otp)
      //     return _id
      //   }
      // }
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
    // async getToken(user) {
    //   const fullName = user.fullName ? user.fullName : user.email
    //   const { email, role, _id, organizationId } = user
    //   return await this.generateJWT({
    //     fullName,
    //     email,
    //     role,
    //     _id,
    //     organizationId
    //   })
    // },

    async generateOTP(_id, opts = { ttl: process.env.OTP_TTL || '1w' }) {
      const { ttl } = opts
      const time = ttl.slice(0, -1)
      const measure = ttl.slice(-1)
      const validUntil = moment().add(time, measure).toISOString()
      const value = otpGenerator.generate(4, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false
      })
      const otpString = await bcrypt.hash(value, 10)
      const otp = {
        value: otpString,
        validUntil,
        validated: false
      }
      await this.adapter.updateById(_id, { $set: { otp } })
      return value
    },

    async validateOtp(user, otp) {
      if (!(await bcrypt.compare(otp, user.otp.value)) ||
        (moment(user.otp.validUntil).diff(moment()) < 0)) {
        if (otp !== process.env.FIXED_OTP_REMOVE) {
          throw new MoleculerRetryableError('OTP not valid')
        }
      }
      return true
    },

    /**
     * Verify a JWT token and return the decoded payload
     *
     * @param {String} token
     */
  },

  // /**
  //  * Service created lifecycle event handler
  //  */
  // created() {

  // },

  // /**
  //  * Service started lifecycle event handler
  //  */
   async started() {
      messages = await require('../templates/locales/index');
   },

  // /**
  //  * Service stopped lifecycle event handler
  //  */
  // async stopped() {

  // }
}
const ENUMS = require('../config/enums')
const UssdMenu = require('ussd-builder')
const axios = require('axios')
const moment = require('moment')
const BigNumber = require('bignumber.js')

const AfricasTalking = require('africastalking')({
  apiKey: process.env.AT_API_KEY,
  username: process.env.AT_USERNAME
})


//const messages = require('../templates/locales/index')

let messages
const locale = process.env.LOCALE || 'en'

let menu = new UssdMenu()

module.exports = {
  name: 'ussd',

  methods: {
    async checkPin(user, ctx, menu) {
      if (await menu.session.get('pinChecked')) {
        //!!(await ctx.call('identity.setSession') // TODO: uncomment this
        return true
      }
      const pin = (menu.val.length === 4) ? menu.val : menu.args.text.split('*')[0]
      if (await ctx.call('users.checkPin', { user, pin })) {
        await menu.session.set('pinChecked', true)
        // await ctx.call('identity.setSession') //TODO: uncomment this
        // TODO: set user in meta and remove from "menu" action
        return true
      } else {
        return false
      }
    },
  },


  async started() {
    messages = await require('../templates/locales/index')
    this.sessions = {}
    menu.sessionConfig({
      start: (sessionId) => {
        return new Promise((resolve) => {
          if (!(sessionId in this.sessions)) {
            this.sessions[sessionId] = {
              pinChecked: false
            }
          }
          resolve()
        })
      },

      end: (sessionId) => {
        delete this.sessions[sessionId]
        return Promise.resolve()
      },

      set: (sessionId, key, value) => {
        this.sessions[sessionId][key] = value
        return Promise.resolve()
      },

      get: (sessionId, key) => {
        return Promise.resolve(this.sessions[sessionId][key])
      }
    })

    menu.on('error', (err) => {
      menu.end(err.message)
    })

    // MENU START
    // Select automatically createIdentity / Members Menu

    menu.startState({
      next: {
        '': async () => {
          const { phoneNumber, ctx } = menu.args
          const user = (await ctx.call('users.find', { query: { phone: phoneNumber } }))[0]
          if (!user) {
            menu.end(messages[locale]['noUser'])
            return
          }
          await menu.session.set('user', { ...user, ...{ ussdSession: menu.args.sessionId } })
          return 'members.enterPin'
        }
      }
    })

   // members menues

    menu.state('members.enterPin', {
      run: async () => {
        menu.con(messages[locale]['members.enterPin'])
      },
      next: {
        '*\\d{4}$': 'members.mainMenu',
      }
    })

    menu.state('members.mainMenu', {
      run: async () => {
        const { ctx } = menu.args
        const user = await menu.session.get('user')
        if (!(await this.checkPin(user, ctx, menu))) {
          menu.end(messages[locale]['wrongPin'])
          return
        }
        menu.con(messages[locale]['members.mainMenu'](user.username))
      },
      next: {
        '1': 'members.storeChanges',
        '2': 'members.products',
        '3': 'members.orders',
        '4': 'members.wallet',
        '5': 'members.profile',
        '0': 'end',
      }
    })

    menu.state('members.createIdentity', {
      run: () => {
        menu.con(messages[locale]['members.createIdentity'])
      },
      next: {
        // eslint-disable-next-line no-useless-escape
        '*\\d{4}$': 'members.createIdentity.setPin',
        '0': 'end'
      }
    })

    menu.state('members.createIdentity.setPin', {
      run: async () => {
        const { ctx } = menu.args
        const user = await menu.session.get('user')
        const otp = menu.val
        try {
          if (!(await ctx.call('users.validateOtp', { user, otp }))) {
            menu.end(messages[locale]['wrongOtp'])
            return
          }
          menu.con(messages[locale]['members.createIdentity.setPin'])
        } catch (e) {
          menu.end(e.message)
          return
        }
      },
      next: {
        // eslint-disable-next-line no-useless-escape
        '*\\d{4}$': 'members.createIdentity.confirmPin',
        '0': 'end'
      }
    })

    menu.state('members.createIdentity.confirmPin', {
      run: async () => {
        menu.con(messages[locale]['members.createIdentity.confirmPin'])
      },
      next: {
        // eslint-disable-next-line no-useless-escape
        '*\\d{4}$': 'members.createIdentity.identityCreated',
        '0': 'end'
      }
    })

    menu.state('members.createIdentity.identityCreated', {
      run: async () => {
        const { ctx } = menu.args
        const [confirmPin, pin] = menu.args.text.split('*').reverse()
        if (confirmPin !== pin) {
          menu.end(messages[locale]['pinNotMatch']) // TODO - maybe we can return the user to confirm the PIN again
          return
        }
        const user = await menu.session.get('user')
        await ctx.call('users.setPin', { user, pin })

        // TODO [BSS] create lnbits wallet + identity ?

        // await ctx.call('users.createIdentity', {
          
        // })

        // await ctx.call('identity.createWallet') // TODO [now] move to user service!!!!
        user.state = ENUMS.userStates.REGISTERED
        await ctx.call('users.update', { id: user._id, ...user })
        // await ctx.call('identity.setSession') // TODO - uncomment this
        await menu.session.set('user', user)
        await menu.session.set('pinChecked', true)
        menu.con(messages[locale]['members.createIdentity.identityCreated'])
      },
      next: {

        '1': 'members.createIdentity.profile',
        '0': 'end'
      }
    })

    this.menu = menu
  },

  actions: {
    menu: {
      params: {
        phoneNumber: { type: 'string', required: true },
        sessionId: { type: 'string', required: true },
        serviceCode: { type: 'string', optional: true }, // TODO - not used, to be removed ?
        text: { type: 'string', required: true },
        networkCode: { type: 'string', optional: true },
        Operator: { type: 'string', optional: true }
      },
      async handler(ctx) {
        ctx.meta.channel = 'ussd'
        const args = {
          phoneNumber: ctx.params.phoneNumber,
          sessionId: ctx.params.sessionId,
          text: ctx.params.text,
          serviceCode: ctx.params.serviceCode,
          Operator: ctx.params.networkCode ? ctx.params.networkCode : ctx.params.Operator,
          ctx
        }
        ctx.meta.$responseType = 'text/plain'
        const user = (await ctx.call('users.find', {
          query: {
            phone: args.phoneNumber
          }
        }))[0]
        ctx.meta.user = { ...user, ...{ ussdSession: args.sessionId } }
        return await this.menu.run(args)
      }
    },

    sendSMS: {
      params: {
        to: 'string',
        message: 'string'
      },
      async handler(ctx) {
        ctx.meta.$contentType = 'application/x-www-form-urlencoded'
        const { to, message } = Object.assign({}, ctx.params)
        const sms = AfricasTalking.SMS
        const messageToSend = {
          to,
          message,
          enque: true
        }
        if (process.env.AT_SHORTCODE) {
          messageToSend.from = process.env.AT_SHORTCODE
        }
        const response = await sms.send(messageToSend)
        return response
      }
    }
  },
  events: {

  }
}


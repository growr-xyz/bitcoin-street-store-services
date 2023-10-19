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
        !!(await ctx.call('identity.setSession')) // TODO: uncomment this
        // return true
      }
      const pin = (menu.val.length === 4) ? menu.val : menu.args.text.split('*')[0]
      if (await ctx.call('users.checkPin', { user, pin })) {
        await menu.session.set('pinChecked', true)
        await ctx.call('identity.setSession') //TODO: uncomment this
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
          const user = (await ctx.call('users.find', { query: { phoneNumber: phoneNumber } }))[0]
          if (!user) {
            menu.end(messages[locale]['noUser'])
            return
          }
          await menu.session.set('user', { ...user, ...{ session: menu.args.sessionId } })
          if (user.status == 'Invited') {
            return 'members.createIdentity'
          } else {
            return 'members.enterPin'
          }
        }
      }
    })

    // members menus

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
        let user = await menu.session.get('user')

        user = await ctx.call('users.setPin', { user, pin })

        // TODO [BSS] create lnbits wallet + identity ?
        ctx.meta.user = {...ctx.meta.user, ...user}
        await ctx.call('identity.createIdentity', {
          props: {
            username: user.username,
            fullName: user.name,
            about: user.about,
            picture: user.picture,
            nip05: `${user.username}@${process.env.DOMAIN}`,
            lud16: user.walletAddress,
            banner: user.banner,
            website: user.website || process.env.DOMAIN,
          }
        })
        user.status = ENUMS.userStates.REGISTERED
        await ctx.call('users.update', { id: user._id, ...user })
        await ctx.call('identity.setSession') // TODO uncomment this
        await menu.session.set('user', user)
        await menu.session.set('pinChecked', true)
        menu.con(messages[locale]['members.createIdentity.identityCreated'])
      },
      next: {
        '1': 'members.createIdentity.profile',
        '0': 'end'
      }
    })

    menu.state('members.createIdentity.profile', {
      run: async () => {
        const user = await menu.session.get('user')
        if (!user) {
          menu.end(messages[locale]['invalidUser']);
          return
        }
        menu.con(messages[locale]['members.createIdentity.profile'](user.username, user.walletAddress, user.status))
      },
      next: {
        // eslint-disable-next-line no-useless-escape
        '1': 'members.mainMenu'
      }
    })

    menu.state('members.storeChanges', {
      run: async () => {
        const { ctx } = menu.args;
        const user = await menu.session.get('user')
        if (!user) {
          menu.end(messages[locale]['invalidUser']);
          return
        }
        // get pending products
        const draftProducts = await ctx.call('products.listByStatus', { merchantId: user._id, status: 'Review' })
        menu.con(messages[locale]['members.storeChanges'](draftProducts))
      },
      next: {
        '1': 'members.storeChanges.confirmed',
        '0': 'end'
      }
    })

    menu.state('members.storeChanges.confirmed', {
      run: async () => {
        const { ctx } = menu.args;
        const user = await menu.session.get('user')
        if (!user) {
          menu.end(messages[locale]['invalidUser']);
          return
        }
        // activate products for review:
        await ctx.call('products.sendProductsForPublishing', { merchantId: user._id} );
        menu.con(messages[locale]['members.storeChanges.confirmed'])
      },
      next: {
        '1': 'members.mainMenu'
      }
    })

    menu.state('members.products', {
      run: async () => {
        const { ctx } = menu.args
        const user = await menu.session.get('user')
        if (!user) {
          menu.end(messages[locale]['invalidUser']);
          return
        }
        // get merchant products
        const products = await ctx.call('products.listByStatus', { merchantId: user._id, status: 'Active' })
        // store products array to the session
        await menu.session.set('products', products);
        menu.con(messages[locale]['members.products'](products))
      },
      next: {
        '*\\d': 'members.products.quantity',
        '0': 'end'
      }
    })

    menu.state('members.products.quantity', {
      run: async () => {
        // get selected product from the menu
        const productNo = Number.parseInt(menu.val);
        // store selected product in the session
        await menu.session.set('productNo', productNo);
        // get product details from the session
        const product = (await menu.session.get('products'))[productNo - 1];
        if (!product) {
          menu.end(messages[locale]['invalidProduct']);
          return
        }
        menu.con(messages[locale]['members.products.quantity'](product.name, product.quantity))
      },
      next: {
        '*\\d': 'members.products.quantityUpdated',
        '0': 'end'
      }
    })

    menu.state('members.products.quantityUpdated', {
      run: async () => {
        const { ctx } = menu.args;
        // get quantity from the menu
        const quantity = Number.parseInt(menu.val)
        // get selected product and product object from the session
        const productNo = await menu.session.get('productNo');
        const product = (await menu.session.get('products'))[productNo - 1];
        if (!product) {
          menu.end(messages[locale]['invalidProduct']);
          return
        }
        // update product quantity:
        try {
          await ctx.call('products.updateQuantity', { product, quantity });
        } catch (err) {
          console.log(err);
        }
        menu.con(messages[locale]['members.products.quantityUpdated'])
      },
      next: {
        '1': 'members.mainMenu'
      }
    })

    menu.state('members.orders', {
      run: async () => {
        const user = await menu.session.get('user')
        if (!user) {
          menu.end(messages[locale]['invalidUser']);
          return
        }
        // get merchant orders
        // TODO - get orders from orders.service
        const orders = [
          {
            products: [ {_id: 'some-id', name: 'some-name', quantity: 10}],
            currency: 'sats',
            price: 550,
            paymentStatus: 'Paid',
            user: 'UserX',
            message: 'I need them urgently'
          }
        ];
        await menu.session.set('orders', orders);
        menu.con(messages[locale]['members.orders'](orders))
      },
      next: {
        '*\\d': 'members.orders.order',
        '0': 'end'
      }
    })

    menu.state('members.orders.order', {
      run: async () => {
        // get selected order from the menu:
        const orderNo = Number.parseInt(menu.val)
        // store the order in the session
        await menu.session.set('orderNo', orderNo);
        // get order details from the session
        const order = (await menu.session.get('orders'))[orderNo - 1];
        if (!order) {
          menu.end(messages[locale]['invalidOrder']);
          return
        }
        menu.con(messages[locale]['members.orders.order'](
          order.products,
          order.currency,
          order.price,
          order.paymentStatus,
          order.user,
          order.message
        ))
      },
      next: {
        '1': 'members.orders.orderMessage',
        '2': 'members.orders.shipping',
        '3': 'members.orders.deliveryCode',
        '0': 'end'
      }
    })

    menu.state('members.orders.orderMessage', {
      run: async () => {
        // get selected order from the session
        const orderNo = await menu.session.get('orderNo');
        const order = (await menu.session.get('orders'))[orderNo - 1];
        if (!order) {
          menu.end(messages[locale]['invalidOrder']);
          return
        }
        menu.con(messages[locale]['members.orders.orderMessage'](order.user))
      },
      next: {
        '*': 'members.orders.orderMessageSent'
      }
    })

    menu.state('members.orders.orderMessageSent', {
      run: async () => {
        // get message from the menu
        const message = menu.val
        // get order from the session
        const orderNo = await menu.session.get('orderNo');
        const order = (await menu.session.get('orders'))[orderNo - 1];
        if (!order) {
          menu.end(messages[locale]['invalidOrder']);
          return
        }
        // TODO - send message to order.user
        menu.con(messages[locale]['members.orders.orderMessageSent'](order.user))
      },
      next: {
        '1': 'members.mainMenu'
      }
    })

    menu.state('members.orders.shipping', {
      run: async () => {
        // get order from the session
        const orderNo = await menu.session.get('orderNo');
        const order = (await menu.session.get('orders'))[orderNo - 1];
        if (!order) {
          menu.end(messages[locale]['invalidOrder']);
          return
        }
        // TODO: change order status of order._id to shipped
        menu.con(messages[locale]['members.orders.shipping'](order.user))
      },
      next: {
        '1': 'members.mainMenu'
      }
    })

    menu.state('members.orders.deliveryCode', {
      run: async () => {
        // get selected order from the session
        const orderNo = await menu.session.get('orderNo');
        const order = (await menu.session.get('orders'))[orderNo - 1];
        if (!order) {
          menu.end(messages[locale]['invalidOrder']);
          return
        }
        menu.con(messages[locale]['members.orders.deliveryCode'])
      },
      next: {
        '*': 'members.orders.deliveryCodeEntered'
      }
    })

    menu.state('members.orders.deliveryCodeEntered', {
      run: async () => {
        // get delivery code from the menu
        const code = menu.val
        // get order from the session
        const orderNo = await menu.session.get('orderNo');
        const order = (await menu.session.get('orders'))[orderNo - 1];
        if (!order) {
          menu.end(messages[locale]['invalidOrder']);
          return
        }
        // TODO: validate the code
        const isValid = true;
        if (!isValid) {
          menu.end(messages[locale]['invalidCode']);
          return
        }
        // TODO: if the code is valid, initiate withdrawal transaction
        menu.con(messages[locale]['members.orders.deliveryCodeEntered'](order.price, order.currency))
      },
      next: {
        '1': 'members.mainMenu'
      }
    })

    menu.state('members.wallet', {
      run: async () => {
        const user = await menu.session.get('user')
        if (!user) {
          menu.end(messages[locale]['invalidUser']);
          return
        }
        let balance = 0
        //TODO - get balance of user.walletAddress
        menu.con(messages[locale]['members.wallet'](user.walletAddress, balance))
      },
      next: {
        // eslint-disable-next-line no-useless-escape
        '1': 'members.wallet.change'
      }
    })

    menu.state('members.wallet.change', {
      run: async () => {
        menu.con(messages[locale]['members.wallet.change'])
      },
      next: {
        '*': 'members.wallet.changedAddress',
        '0': 'end'
      }
    })

    menu.state('members.wallet.changedAddress', {
      run: async () => {
        const { ctx } = menu.args;
        // get wallet address from the menu
        const walletAddress = menu.val
        let user = await menu.session.get('user')
        user = await ctx.call('users.updateWallet', { user, walletAddress })
        menu.con(messages[locale]['members.wallet.changedAddress'](walletAddress))
      },
      next: {
        // eslint-disable-next-line no-useless-escape
        '1': 'members.mainMenu'
      }
    })

    menu.state('members.profile', {
      run: async () => {
        const user = await menu.session.get('user')
        if (!user) {
          menu.end(messages[locale]['invalidUser']);
          return
        }
        menu.con(messages[locale]['members.profile'](user.username, user.walletAddress, user.status))
      },
      next: {
        // eslint-disable-next-line no-useless-escape
        '1': 'members.mainMenu'
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
            phoneNumber: args.phoneNumber
          }
        }))[0]
        ctx.meta.user = { ...user, ...{ session: args.sessionId } }
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


const ApiGateway = require('moleculer-web')
const ENUMS = require('../config/enums')
const { MoleculerClientError } = require('moleculer').Errors
const countryCodes = require('../config/countryCodes')
const PassportMixin = require('../mixins/passport.mixin')

module.exports = {
  name: 'rest-api',
  mixins: [
    ApiGateway,
  ],
  settings: {
    port: 3333,
    server: true,
    bodyParsers: {
      json: true,
      urlencoded: { extended: true }
    },
    routes: [{
      path: '/',
      authentication: true,

      whitelist: [
        'ussd.menu'
      ],
      aliases: {
        'POST ussd': 'ussd.menu',
      },
      bodyParsers: {
        json: true,
        urlencoded: { extended: true }
      },

    }]
  },

  methods: {

    isValidAuthorizationHeader(authorization, method, url) {
      console.log('authorization', authorization)
      const base64String = authorization.replace('Nostr ', '')

      // Decode the base64-encoded string and parse the JSON object
      const decodedString = Buffer.from(base64String, 'base64').toString('utf-8')
      console.log('decodedString', decodedString)
      if (!decodedString) {
        console.log('auth header is empty')
        return false
      }

      let event
      try {
        event = JSON.parse(decodedString)
      } catch (e) {
        console.error('Error parsing JSON:', e)
        return false
      }

      // Print the object
      console.log(event)

      // Check for kind, method, and timestamp
      if (
        event.kind !== 27235 ||
        !event.tags.find(tag => tag[0] === 'method' && tag[1] === method) ||
        !event.tags.find(tag => tag[0] === 'u' && tag[1] === url) ||
        Math.abs(event.created_at - Math.floor(Date.now() / 1000)) > 60 // time window of 60 seconds
      ) {
        if (event.kind !== 27235) {
          console.log('Failure: event.kind is not 27235. Found:', event.kind)
        }

        if (!event.tags.find(tag => tag[0] === 'method' && tag[1] === method)) {
          console.log('Failure: No matching method tag found. Expected method:', method)
        }

        if (!event.tags.find(tag => tag[0] === 'u' && tag[1] === url)) {
          console.log('Failure: No matching u tag found. Expected u:', url)
        }

        const timestampDifference = Math.abs(event.created_at - Math.floor(Date.now() / 1000))
        if (timestampDifference > 60) {
          console.log('Failure: Timestamp is not within the 60 second window. Difference in seconds:', timestampDifference)
        }

        console.log('Auth header does not meet requirements')
        return false
      }

      const isVerified = verifySignature(event)
      if (isVerified) {
        return event.pubkey
      } else {
        return false
      }
    },

  async authenticate(ctx, route, req) {
    const auth = req.headers['authorization']
    const method = req.method // Extract method from request
    const url = req.protocol + '://' + req.get('host') //+ req.originalUrl
    console.log('authHeader', auth)
    if (!auth || !auth.startsWith('Nostr ')) {
      // Authentication failed
      throw new ApiGateway.Errors.UnAuthorizedError(ApiGateway.Errors.ERR_INVALID_TOKEN)
    }

    const pubkey = this.isValidAuthorizationHeader(auth, method, url)

    if (pubkey) {
      // Authentication succeeded
      // const user = { pubkey } // You might populate this object with additional user details if needed
      const user = await ctx.call('users.resolveUser', { pubkey })

      return user
    } else {
      // Authentication failed
      throw new ApiGateway.Errors.UnAuthorizedError(ApiGateway.Errors.ERR_INVALID_TOKEN)
    }


  },

},

  actions: {
  
    addMerchant: {
      auth: true,
      params: {
        fullName: 'string|required',
        phoneNumber: 'string|required',
        username: 'string|required',
        settlementAddress: 'string|required',
        profilePic: 'url|optional',
        website: 'url|optional',
        nip05: 'email|optional',
        banner: 'url|optional',
        about: 'string|optional'
    },
      async handler(ctx) {
      // const {
      //   fullName,
      //   phoneNumber,
      //   username,
      //   settlementAddress,
      //   profilePic,
      //   website,
      //   nip05,
      //   banner,
      //   about
      // } = Object.assign({}, ctx.params)

      const user = await ctx.call('users.addMerchant', ctx.params)
      if (user) {
        return {
          success: true
        }
      } else {
        return {
          success: false
        }
      }
    }
  }

}
}

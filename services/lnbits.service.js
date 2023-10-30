const HTTPClientService = require('moleculer-http-client');
const basePath = process.env.LNBITS_URI
module.exports = {
  name: 'lnbits',

  mixins: [HTTPClientService],

  settings: {
    httpClient: {
      // Boolean value indicating whether request should be logged or not
      logging: true,

      // Log request function
      //  logOutgoingRequest: logOutgoingRequest,

      // Log response function
      //  logIncomingResponse: logIncomingResponse,

      // Format the Response      
      responseFormatter: "body", // one of "body", "headers", "status", "full", "raw" or a Function. Example: (res) => ({body: res.body, headers: res.headers}) 
    }
  },
  actions: {
    createWallet: {
      params: {
        name: 'string'
      },
      async handler(ctx) {
        const { name } = Object.assign({}, ctx.params)
        const resp = await ctx.call('lnbits.post', {
          url: `${basePath}/api/v1/wallet`,
          opt: {
            headers: {
              'X-API-KEY': process.env.LNBITS_ADMIN_KEY
            },
            json: {
              name
            },
            responseType: 'json'
          }
        })
        console.log(resp)
        return true
      }
    },


    // {
    //   "user_name": "string",
    //   "wallet_name": "string",
    //   "email": "",
    //   "password": "",
    //   "extra": {
    //     "additionalProp1": "string",
    //     "additionalProp2": "string",
    //     "additionalProp3": "string"
    //   }
    // }


    createUser: {
      params: {
        username: 'string|required',
        walletName: 'string|required',
        email: 'email|required',
        password: 'string|required'
      },
      async handler(ctx) {

        const {
          username: user_name,
          walletName: wallet_name,
          email,
          password,
        } = Object.assign({}, ctx.params)


        return await ctx.call('lnbits.post', {
          url: `${basePath}/usermanager/api/v1/users`,
          opt: {
            headers: {
              'X-API-KEY': process.env.LNBITS_ADMIN_KEY
            },
            json: {
              user_name,
              wallet_name,
              email,
              password
            },
            responseType: 'json'
          }
        })
        // console.log(resp)

      }
    },
    createNostrMerchant: {
      params: {
        apiKey: "string|required",
        pk: "string|optional",
        pubkey: "string|optional",
        active: "boolean|optional",
        restoreInProgress: "boolean|optional",
        syncFromNostr: "boolean|optional"
      },
      async handler(ctx) {

        let config
        const {
          apiKey,
          pk: private_key,
          pubkey: public_key,
          active,
          restoreInProgress,
          syncFromNostr,
        } = Object.assign({}, ctx.params)
        if (active && restoreInProgress && syncFromNostr) {
          config.active = active
          config.restore_in_progress = restoreInProgress
          config.sync_from_nostr = syncFromNostr
        }
        console.log(JSON.stringify({
          private_key,
          public_key,
          config
        }, null, 2))
        const resp = await ctx.call('lnbits.post', {
          url: `${basePath}/nostrmarket/api/v1/merchant`,
          opt: {
            headers: {
              'X-API-KEY': apiKey
            },
            json: {
              config: {
                active: true
              }
            },
            responseType: 'json'
          }
        })
        console.log(resp)
        return true
      }
    },
    activateExtension: {
      params: {
        extensionName: 'string|required',
        userId: 'string|required',
        active: 'boolean|required'
      },
      async handler(ctx) {
        const {
          extensionName,
          userId,
          active
        } = Object.assign({}, ctx.params)
        const resp = await ctx.call('lnbits.post', {
          url: `${basePath}/usermanager/api/v1/extensions?extension=${extensionName}&userid=${userId}&active=${active}`,
          opt: {
            json: {
              config: {
                active: true
              }
            },
            responseType: 'json',
          }
        })

        console.log(resp)
        return (resp.extension === 'updated')
      }

    },
    createMerchant: {
      params: {
        "privateKey": "string",
        "publicKey": "string",
      },
      async handler(ctx) {
        const {
          privateKey,
          publicKey,
          adminKey
        } = Object.assign({}, ctx.params)
        const resp = await ctx.call('lnbits.post', {
          url: `${basePath}/nostrmarket/api/v1/merchant`,
          opt: {
            headers: {
              'X-API-KEY': adminKey
            },
            json: {
              private_key: privateKey,
              public_key: publicKey,
              config: {
                active: true,
              }
            },
            responseType: 'json',
          }
        })
        return resp
      }
    },

    createStall: {
      params: {
        stall: {
          type: 'object',
        },
        adminKey: 'string',
      },
      async handler(ctx) {
        const { stall, adminKey } = Object.assign({}, ctx.params)
        const resp = await ctx.call('lnbits.post', {
          url: `${basePath}/nostrmarket/api/v1/stall`,
          opt: {
            headers: {
              'X-API-KEY': adminKey
            },
            json: stall,
            responseType: 'json',
          }
        })
        await ctx.emit('nostr-events.stall.created', resp)
        return resp
      }
    },

    publishProduct: {
      params: {
        product: {
          type: 'object',
        },
        adminKey: 'string',
      },
      async handler(ctx) {
        const { product, adminKey } = Object.assign({}, ctx.params)
        try {
          const resp = await ctx.call('lnbits.post', {
            url: `${basePath}/nostrmarket/api/v1/product`,
            opt: {
              headers: {
                'X-API-KEY': adminKey
              },
              json: product,
              responseType: 'json',
            }
          })
          await ctx.emit('nostr-events.product.created', resp)
          return resp
        } catch (err) {
          console.log(err)
        }
      }
    },

    getShippingZone: {
      params: { adminKey: 'string' },
      async handler(ctx) {
        const { adminKey } = Object.assign({}, ctx.params)
        try {
          const resp = await ctx.call('lnbits.get', {
            url: `${basePath}/nostrmarket/api/v1/zone`,
            opt: {
              headers: {
                'X-API-KEY': adminKey
              },
              responseType: 'json',
            }
          })
          return resp
        } catch (err) {
          console.log(err)
        }
      }
    },

    getOrders: {
      params: {
        adminKey: 'string',
      },
      async handler(ctx) {
        const { adminKey } = Object.assign({}, ctx.params)
        try {
          const resp = await ctx.call('lnbits.get', {
            url: `${basePath}/nostrmarket/api/v1/order?paid=true&shipped=false`,
            opt: {
              headers: {
                'X-API-KEY': adminKey
              },
              responseType: 'json',
            }
          })
          return resp
        } catch (err) {
          console.log(err)
        }
      }
    },

    updateOrder: {
      params: {
        id: 'string|required',
        message: 'string|optional',
        paid: 'boolean|optional',
        shipped: 'boolean|optional',
        adminKey: 'string',
      },
      async handler(ctx) {
        const { id, message, paid, shipped, adminKey } = Object.assign({}, ctx.params)
        try {
          const json = {
            id,
            message,
            paid,
            shipped
          }
          const resp = await ctx.call('lnbits.patch', {
            url: `${basePath}/nostrmarket/api/v1/order/${id}`,
            opt: {
              headers: {
                'X-API-KEY': adminKey
              },
              json,
              responseType: 'json',
            },
          })
          return resp
        } catch (err) {
          console.log(err)
        }
      }
    }
  }
}

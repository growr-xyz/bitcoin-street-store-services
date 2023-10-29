require('websocket-polyfill')
const NDSAdapter = require('./moleculer-nostr-adapter')
const { nip19, nip57, nip44 } = require('nostr-tools')
const getName = require('goofy-names');
const crc = require('crc');

module.exports = {
  name: '',
  metadata: {
    $category: 'nostr',
    $description: 'Moleculer NOSTR Service',
    $official: false,
    $package: {
      name: 'moleculer-nostr-service',
      version: '0.0.1',
      repo: null
    },

  },
  settings: {
    domain: process.env.NOSTR_DOMAIN || 'localhost',
    provider: 'nostr'
  },
  actions: {

    createKeyPair: {
      async handler(ctx) {
        return ndsAdapter.createNewKeyPair()
      }
    },

    createProfile: {
      params: {
        name: 'string|optional',
        website: 'string|optional',
        about: 'string|optional',
        display_name: 'string|optional',
        picture: 'string|optional',
        nip05: 'string|optional',
        lud16: 'string|optional',
        banner: 'string|optional'
      },
      async handler(ctx) {
        // const { sk } = await this.actions.createKeyPair()
        const ndsAdapter = new NDSAdapter()

        const display_name = ctx.params.display_name ?
          ctx.params.display_name :
          `${getName(ndsAdapter.npub)}`

        const username = ctx.params.name ?
          ctx.params.name :
          `${display_name.split(' ').join('_')}_${crc.crc1(ndsAdapter.npub)}`

        const about = ctx.params.about ?
          `${ctx.params.about}\n${username}@${this.settings.domain}` :
          `${username}@${this.settings.domain}`

        const nip05 = ctx.params.nip05 ?
          ctx.params.nip05 :
          `${username}@${this.settings.domain}`

        const lud16 = ctx.params.lud16 ?
          ctx.params.lud16 :
          `${username}@ln.${this.settings.domain}`

        const { profileEvent, nprofile, npub } = await ndsAdapter.createProfile({
          ...ctx.params,
          name: username,
          about,
          display_name,
          nip05,
          lud16
        })

        return { profileEvent, nprofile, npub, nsec: ndsAdapter.nsec }
      }
    },

    createPost: {
      params: {
        sk: 'string|required',
        text: 'string|required'
      },
      async handler(ctx) {
        const { sk, text } = Object.assign({}, ctx.params)
        const ndsAdapter = new NDSAdapter({ sk })
        const post = ndsAdapter.createPost(text)
        await ndsAdapter.transmitEvent(post)
        return post
      }
    },

    createDM: {
      params: {
        sk: 'string|required',
        recipientPK: 'string|required',
        text: 'string|required'
      },
      async handler(ctx) {
        const { sk, recipientPK, text } = Object.assign({}, ctx.params)
        const ndsAdapter = new NDSAdapter({ sk })
        return await ndsAdapter.createEncryptedDirectMessage(recipientPK, text)
      }
    },

    // createBadge: {

    // },


    getDMs: {
      params: {
        sk: 'string|required',
        filter: 'object|optional',
      },
      async handler(ctx) {
        const { sk, filter } = Object.assign({}, ctx.params);
        const dms = []
        const ndsAdapter = new NDSAdapter({ sk })
        const sub = ndsAdapter.getDMs(filter)

        sub.on('eose', async () => {
          await Promise.all(dms.map(this.processDM))
          resolve(dms)
        })

        sub.on('event', (event) => {
          dms.push(event)
        })
      }

    },

    getZapRequests: {
      params: {
        sk: 'string|required',
        filter: 'object|optional',
      },
      async handler(ctx) {
        const { sk, filter } = Object.assign({}, ctx.params);
        const requests = []
        const zaps = []
        const ndsAdapter = new NDSAdapter({ sk, filter })
        const sub = ndsAdapter.getZapNotes()
        const processZapNote = (event) => {
          const description = event.tags.find(tagPair => tagPair[0] === 'description')[1]
          const validateRequestError = nip57.validateZapRequest(description)
          if (validateRequestError) {
            throw new Error(validateRequestError)
          }
          const zapTagMap = new Map(event.tags)
          const zapRequest = JSON.parse(zapTagMap.get('description'))
          const zapRequestTagMap = new Map(zapRequest.tags)
          const request = {
            zapId: event.id,
            npub: this.npub,
            invoice: zapTagMap.get('bolt11'),
            zapperPubkey: zapRequest.pubkey,
            amount: zapRequestTagMap.get('amount'),
            preimage: zapTagMap.get('preimage'),
            createdAd: zapRequest.created_at
          }
          requests.push(request)
        }

        async function waitForEvents() {
          return new Promise((resolve) => {
            sub.on('event', (event) => {
              zaps.push(event)
            });

            sub.on('eose', async () => {
              await Promise.all(zaps.map(processZapNote))
              resolve(requests)
            });
          })
        }

        return await waitForEvents()
      }
    },


    getFeed: {
      params: {
        sk: 'string|required',
        filter: 'object|optional',
      },
      async handler(ctx) {
        const { sk, filter } = Object.assign({}, ctx.params)
        const ndsAdapter = new NDSAdapter({ sk })
        const sub = await ndsAdapter.getFeed(filter)
        const posts = []

        const processPost = (event) => {
          event.noteid = nip19.noteEncode(event.id)
          return event
        }

        async function waitForEvents() {
          return new Promise((resolve) => {
            sub.on('event', (event) => {
              posts.push(event);
            })

            sub.on('eose', async () => {
              await Promise.all(posts.map(processPost))
              resolve(posts)
            })
          })
        }

        return await waitForEvents()
      }
    },

    getProfile: {
      params: {
        npub: 'string|optional',
        pubkey: 'string|optional',
      },
      async handler(ctx) {
        const { npub, pubkey } = Object.assign({}, ctx.params)
        let pk
        if (npub) {
          pk = (nip19.decode(userNpub)).data
        } else {
          pk = pubkey
        }
        const ndsAdapter = new NDSAdapter()
        const sub = ndsAdapter.getUserProfile(pk)
        const metadata = []
        const processMetadata = (event) => {

          if (event) {
            const nprofile = nip19.nprofileEncode({ pubkey: pk, relays: [this.relay] })
            return {
              profileEvent,
              nprofile,
              npub: this.npub,
            }
          } else {
            throw new Error('Failed to create profile')
          }
        }

        async function waitForEvents() {
          return new Promise((resolve) => {
            sub.on('event', (event) => {
              metadata.push(event);
            })

            sub.on('eose', async () => {
              await Promise.all(posts.map(processMetadata))
              resolve(metadata)
            })
          })
        }

        return await waitForEvents()
      }
    }

  },

  methods: {
    async processDM({ event, ndsAdapter }) {
      // To add additional processing, change this method in the service that is using this mixin
      return this.decryptDM({ event, ndsAdapter })
    },

    async decryptDM({ event, ndsAdapter }) {
      const decryptedEvent = await ndsAdapter.decryptDM(event)
      const returnEvent = Object.assign({}, decryptedEvent)
      returnEvent.noteid = nip19.noteEncode(decryptedEvent.id)
      return returnEvent
    }


    // async createIdentity({params, props, ctx}) {

    //   const {
    //     userId,
    //     fullName,
    //     identifier
    //   } = params

    //   const { profileEvent, nprofile, npub } = await this.actions.createProfile({...props, name: fullName, identifier })


    // }
  },

  async created() {

  },

  async stopped() { }
}
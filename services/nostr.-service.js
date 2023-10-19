
'use strict'

const ENUMS = require('../config/enums')
const NOSTRService = require('../nostr/moleculer-nostr-service')

const { nip19 } = require('nostr-tools')

module.exports = {
  name: 'nostr',
  mixins: [NOSTRService],
  settings: {},
  actions: {

    createUserProfile: {
      params: {
        username: 'string|required',
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
        const { profileEvent, nprofile, npub, nsec } = await this.actions.createProfile({
          website: website || `www.${process.env.NODE_DOMAIN}`,
          picture: picture ? picture : '',
          banner: banner ? banner : ''
        })

        // TODO [BSS] Consider to add it to identity?
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

    createUserPost: {
      params: {
        userId: 'string|required',
        text: 'string|required',
        replyTo: 'string|optional',
      },

      async handler(ctx) {
        const { userId, text } = ctx.params
        const user = await ctx.call('nds.get', {
          key: userId
        })
        const sk = (nip19.decode(user.nsec)).data

        // TODO Create replyTo option

        const post = await this.actions.createPost({ sk, text })
        return post

      }

    },

    createProjectProfile: {
      params: {
        projectKey: 'string|required', // TODO move to about to make it not related to projects for the hackathon
        projectBook: 'string|required', // TODO move to about to make it not related to projects for the hackathon
        projectName: 'string|required',
        username: 'string|optional',
        about: 'string|optional',
        picture: 'string|url|optional',
        nip05: 'string|optional',
        lud16: 'string|optional',
        banner: 'string|url|optional'
      },
      async handler(ctx) {
        const {
          projectName,
          projectKey,
          projectBook,
          username,
          about,
          picture,
          nip05,
          lud16,
          banner
        } = ctx.params
        const aboutField = about ? `${about}\n${projectKey} @ ${projectBook}` : `${projectKey} @ ${projectBook}`

        const { profileEvent, nprofile, npub, nsec } = await this.actions.createProfile({
          name: projectName,
          display_name: username,
          website: 'www.growr.xyz',
          about: aboutField,
          picture: picture ? picture : '',
          nip05: nip05 ? `${username}@growr.xyz` : '',
          lud16: lud16 ? lud16 : '',
          banner: banner ? banner : ''
        })


        // TODO MOVE or COPY KEYS TO ORGANIZATION
        await ctx.call('nds.set', {
          key: projectKey, value: {
            nsec,
            npub,
            profile: nprofile
          }
        })

        return { profileEvent, nprofile, npub }
      }
    },

    createProjectPost: {
      params: {
        projectKey: 'string|required',
        text: 'string|required'
      },
      async handler(ctx) {
        const { projectKey, text } = ctx.params
        const project = await ctx.call('nds.get', {
          key: projectKey
        })
        const sk = (nip19.decode(project.nsec)).data
        const post = await this.actions.createPost({ sk, text })
        return post
      }
    },

    getInvestments: {
      params: {
        projectKey: 'string|required',
        filter: 'object|optional',
      },
      async handler(ctx) {
        const { projectKey, filter = {} } = ctx.params;
        const projectKeys = await ctx.call('nds.get', { key: projectKey })
        const { nsec } = projectKeys
        const sk = (nip19.decode(nsec)).data

        const project = await ctx.call('project-book.findByKey', {
          key: projectKey
        })
        const investments = await this.actions.getZapRequests({ sk, filter })

        const fundingSource = project.funding.find(item => (
          (item.type == ENUMS.fundingTypes.OnchainWallet)
          && (item.network.name == ENUMS.networks.Lightning.name)
        ));
        if (!fundingSource) {
          // TODO: what to do if there is no lightning funding source
        }

        for (const investment of investments) {
          const receipt = {
            payment: {
              projectKey,
              fundingNetwork: fundingSource?.network?.name, //project.funding[0].network.name,
              fundingToken: fundingSource?.token?.name, //project.funding[0].token.name,
              fundingType: fundingSource?.type, //project.funding[0].type,
              paymentType: 'in',
              projectAddress: fundingSource?.network?.orgWalletAddress, // project.funding[0].network.orgWalletAddress,
              investorAddress: investment.zapperPubkey,
              amount: parseInt(investment.amount / 1000),
              proof: {
                invoice: investment.invoice,
                hash: investment.preimage
              }
            },
            investment
          }
          const paymentReceipt = await ctx.call('funding-book.fund', { payment: receipt.payment })
          if (paymentReceipt) {
            this.actions.createDM({
              sk,
              recipientPK: paymentReceipt.investorAddress,
              text: `Received Investment:
${JSON.stringify(receipt, null, 2)}
Expect return!
<ADD RETURN PARAMS>`
            })
          }
        }

        // TODO THIS IS FOR RETURN 
        // const investorProfile = this.actions.getProfile(investment.zapperPubkey)
        // const investorAddress = investorProfile.lud16 
        //   ? investorProfile.lud16 
        //   : investorProfile.lud06 
        //     ? investorProfile.lud06 
        //     : investorProfile.npub

        return true
      }
    },

    getProjectFeed: {
      params: {
        projectKey: 'string|required',
        filter: 'object|optional'
      },
      async handler(ctx) {
        const { projectKey, filter = {} } = ctx.params
        const project = await ctx.call('nds.get', {
          key: projectKey
        })
        const projectSK = (nip19.decode(project.nsec)).data
        return await this.actions.getFeed({ sk: projectSK, filter })
      }
    },


  }
}
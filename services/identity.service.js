
'use strict'

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

const { GrowrAgent } = require('growr-agent-sdk')
const DbService = require('../mixins/db.mixin')
const { MoleculerClientError } = require('moleculer').Errors
//const utils = require('../middlewares/misc-util');
// const ENUMS = require('../config/enums');
const identityMixin = require('../mixins/identity')
const NOSTRService = require('../nostr/moleculer-nostr-service')
// const CryptoJS = require('crypto-js')
// const crypto = require("crypto");
// const bcrypt = require("bcrypt");
// const _ = require("lodash");

// const jwt = require("jsonwebtoken");

// const HASH_SALT_ROUND = 10;
// const TOKEN_EXPIRATION = 60 * 60 * 1000; // 1 hour

module.exports = {
  name: 'identity',

  /**
   * Settings
   */


  mixins: [
    DbService('identity'),
    identityMixin,
    NOSTRService

    // ConfigLoader(["site.**", "mail.**", "accounts.**"])
  ],
  settings: {

  },


  /**
   * Dependencies
   */
  dependencies: [],

  /**
   * Actions
   */
  actions: {},
  /**
   * Events
   */
  events: {
  },

  // /**
  //  * Methods
  //  */
  methods: {
    async createIdentity(identityOptions) {
      const { params, props, ctx } = identityOptions


    }


  },

  hooks: {
   
  }

}
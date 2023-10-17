'use strict'

const Corestore = require('corestore')
const HyperBee = require('hyperbee')
const crypto = require('crypto')
const HYPERBEE_INDEX_SEPARATOR = process.env.HYPERBEE_INDEX_SEPARATOR || '|'

const defaultBeeOptions = { valueEncoding: 'json' }

class HyperBeeAdapter {

  constructor(name, beeOptions = defaultBeeOptions) {
    this.name = name
    this.options = beeOptions
    this.store = new Corestore(`${process.env.MOUNT_PATH}corestore-${this.name}`)
    this.core = this.store.get({ name: this.name, encoding: 'utf-8' })
    this.sub = {}
    this.indexSeparator = HYPERBEE_INDEX_SEPARATOR
  }

  async init(broker, service) {
    this.broker = broker
    this.service = service
    await this.core.ready()
    console.log(`${this.name} core key: ${this.core.key.toString('hex')}`)
    this.bee = new HyperBee(this.core, this.options)
    await this.bee.ready()
    this.version = this.bee.version
    this.api = await this.apiGenerator(this.bee)
    return this
  }

  sha256(inp) {
    return crypto.createHash('sha256').update(inp).digest('hex')
  }

  async apiGenerator(db) {
    return {
      put: async ({ key, value, options = {} }) => {
        return db.put(key, value, options)
      },

      swap: async ({ key, value, cas, options = {} }) => {
        const opts = Object.assign({}, options, { cas })
        return db.put(key, value, opts)
      },

      get: async ({ key, options = {} }) => {
        return db.get(key, options)
      },

      del: async ({ key, options = {} }) => {
        return db.del(key, options)
      },

      delCondition: async ({ key, cas, options = {} }) => {
        const opts = Object.assign({}, options, { cas })
        return db.del(key, opts)
      },

      batchInsert: async ({ records, options = {} }) => {
        const batch = db.batch()
        for await (const { key, value } of records) {
          await batch.put(key, value, options)
        }
        await batch.flush()
      },

      openBatch: () => {
        return db.batch()
      },

      findFirst: async ({ range, options = {} }) => {
        return await db.peek(range, options)
      },

      find: async ({ query, options = {} }) => {
        const resultSet = []
        for await (const record of db.createReadStream(query, options)) {
          resultSet.push(record)
        }
        return resultSet
      },

      findStream: ({ query, options = {} }) => {
        return db.createReadStream(query, options)
      },

      fullHistory: async ({ query }) => {
        const resultSet = []
        for await (const record of db.createHistoryStream(query)) {
          resultSet.push(record)
        }
        return resultSet
      },

      findDiff: async ({ version, query }) => {
        const resultSet = []
        for await (const record of db.createDiffStream(version, query)) {
          resultSet.push(record)
        }
        return resultSet
      }
    }
  }
}

module.exports = HyperBeeAdapter

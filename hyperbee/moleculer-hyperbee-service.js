const HyperbeeAdapter = require('./moleculer-hyperbee-adapter')
const Hyperswarm = require('hyperswarm')
const { Buffer } = require('buffer')
const SubEncoder = require('sub-encoder')
const enc = new SubEncoder()
module.exports = {
  name: '',
  metadata: {
    $category: 'database',
    $description: 'Moleculer Hyperbee Service',
    $official: false,
    // TODO make it a package
    $package: {
      name: 'moleculer-hyperbee-service',
      version: '0.0.1',
      repo: null
    }
  },
  settings: {},
  actions: {
    put: {
      params: {
        key: {
          type: 'string',
          required: true
        },
        value: {
          type: 'object',
          optional: true
        },
        options: {
          type: 'object',
          optional: true,
          props: {
            cas: {
              type: 'function', optional: true
            }
          }
        },
      },
      handler(ctx) {
        return this._put(ctx, ctx.params)
      }
    },

    swap: {
      params: {
        key: {
          type: 'string',
          required: true
        },
        value: [
          { type: 'string', optional: true },
          { type: 'object', optional: true },
        ],
        options: {
          type: 'object',
          optional: true,
          props: {
            cas: {
              type: 'function', optional: true
            }
          }
        },
      },
      handler(ctx) {
        return this._swap(ctx, ctx.params)
      }
    },

    get: {
      params: {
        key: {
          type: 'string',
          required: true
        },
        subIndexes: {
          type: 'array',
          optional: true,
          items: 'string'
        },
        options: {
          type: 'object',
          optional: true,
          props: {
            wait: 'boolean|optional',
            update: 'boolean|optional',
            keyEncoding: 'string|optional',
            valueEncoding: 'string|optional'
          }
        }
      },
      handler(ctx) {
        let { key, subIndexes, options } = ctx.params
        if (subIndexes && subIndexes.length > 0) {
          const sub = this._getSub(subIndexes)
          options = Object.assign({}, options, { keyEncoding: sub })
        }
        return this._get(ctx, { key, options })
      }
    },

    del: {
      params: {
        key: {
          type: 'string',
          required: true
        }
      },
      handler(ctx) {
        return this._del(ctx, ctx.params)
      }
    },

    delCondition: {
      params: {
        key: {
          type: 'string',
          required: true
        },
        options: {
          type: 'object',
          optional: true,
          props: {
            cas: {
              type: 'function', optional: true
            }
          }
        },
      },
      handler(ctx) {
        return this._delCondition(ctx, ctx.params)
      }
    },

    batchInsert: {
      params: {
        records: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              key: {
                type: 'string',
                required: true
              },
              value: [
                {
                  type: 'string',
                  optional: true
                },
                {
                  type: 'object',
                  optional: true
                },
              ]
            }
          }
        },
        options: {
          type: 'object',
          optional: true,
          props: {
            cas: {
              type: 'function', optional: true
            },
            keyEncoding: 'string|optional',
          }
        }
      },
      handler(ctx) {
        return this._insertMany(ctx, ctx.params)
      }
    },

    openBatch: {
      handler() {
        return this.adapter.openBatch()
      }
    },

    findFirst: {
      params: {
        query: {
          type: 'object',
          required: true,
          props: {
            gt: 'string|optional',
            gte: 'string|optional',
            lt: 'string|optional',
            lte: 'string|optional'
          }
        },
        options: {
          type: 'object',
          optional: true,
        }
      },
      handler(ctx) {
        return this._findFirst(ctx, ctx.params)
      }
    },
/*
    findPaginatedQuery: { // NOT IMPLEMENTED YET 
      params: {
        cursor: {
          type: 'object',
          required: true,
          props: {
            value: 'string|required',
            key: 'string|required',
          }
        },
        query: {
          type: 'object',
          optional: true,
          props: {
            gt: 'string|optional',
            gte: 'string|optional',
            lt: 'string|optional',
            lte: 'string|optional'
          }
        },
        subIndexes: {
          type: 'array',
          optional: true,
          items: 'string'
        },
        options: {
          type: 'object',
          optional: true,
          props: {
            reverse: 'boolean|optional',
            limit: 'number|optional',
            keyEncoding: 'string|optional'
          }
        }
      },
      async handler(ctx) {
        let { query, subIndexes, options, cursor } = ctx.params

        for (let key in query) {
          query[key] = Buffer.from(query[key].slice())
        }

        if (subIndexes && subIndexes.length > 0) {
          const sub = this._getSub(subIndexes)
          options = Object.assign({}, options, { keyEncoding: sub })
        }

        if (subIndexes.includes(cursor.key)) {
          if (options && options.reverse) {
            query = Object.assign({}, query, { lte: Buffer.from(cursor.value).slice() })
          } else {
            query = Object.assign({}, query, { gte: Buffer.from(cursor.value).slice() })
          }
          return this._find(ctx, { query, options })
        } else {
          const result = []
          const limit = options && options.limit ? options.limit : 10
          delete options.limit
          const readStream = this._findStream(ctx, { query, options })
          for await (const record of readStream) {
            if (
              (options && options.reverse && record.value[cursor.key] <= cursor.value) ||
              (record.value[cursor.key] >= cursor.value)
            ) {
              result.push(record.value)
              if (result.length === limit) {
                return result
              }
            }
          }
        }
      }
    },
    */
    findStream: {
      params: {
        query: {
          type: 'object',
          required: true,
          props: {
            gt: 'string|optional',
            gte: 'string|optional',
            lt: 'string|optional',
            lte: 'string|optional'
          }
        },
        subIndexes: {
          type: 'array',
          optional: true,
          items: 'string'
        },
        options: {
          type: 'object',
          optional: true,
          props: {
            reverse: 'boolean|optional',
            limit: 'number|optional',
            keyEncoding: 'string|optional'
          }
        }
      },
      handler(ctx) {
        let { query, subIndexes, options } = ctx.params

        for (let key in query) {
          query[key] = Buffer.from(query[key].slice())
        }

        if (subIndexes && subIndexes.length > 0) {
          const sub = this._getSub(subIndexes)
          options = Object.assign({}, options, { keyEncoding: sub })
        }
        return this._findStream(ctx, { query, options })
      }
    },

    find: {
      params: {
        query: {
          type: 'object',
          required: true,
          props: {
            gt: 'string|optional',
            gte: 'string|optional',
            lt: 'string|optional',
            lte: 'string|optional'
          }
        },
        subIndexes: {
          type: 'array',
          optional: true,
          items: 'string'
        },
        options: {
          type: 'object',
          optional: true,
          props: {
            reverse: 'boolean|optional',
            limit: 'number|optional',
            keyEncoding: 'string|optional'
          }
        }
      },
      handler(ctx) {
        let { query, subIndexes, options } = ctx.params

        for (let key in query) {
          query[key] = Buffer.from(query[key].slice())
        }

        if (subIndexes && subIndexes.length > 0) {
          const sub = this._getSub(subIndexes)
          options = Object.assign({}, options, { keyEncoding: sub })
        }
        return this._find(ctx, { query, options })
      }
    },

    fullHistory: {
      params: {
        query: {
          type: 'object',
          required: true,
          props: {
            reverse: 'boolean|optional',
            limit: 'number|optional',
            live: 'boolean|optional',
            gt: 'string|optional',
            gte: 'string|optional',
            lt: 'string|optional',
            lte: 'string|optional'
          }
        }
      },
      handler(ctx) {
        return this._fullHistory(ctx, ctx.params)
      }
    },

    findDiff: {
      params: {
        version: 'number',
        query: {
          type: 'object',
          required: true,
          props: {
            limit: 'number|optional'
          }
        }
      },
      handler(ctx) {
        return this._findDiff(ctx, ctx.params)
      }
    },

    createSubIndexes: {
      params: { keys: 'array|required', value: 'object|required' },
      handler(ctx) {
        return this._createSubIndexes(ctx, ctx.params)
      }
    },

    reIndexData: {
      params: { keys: 'array|required' },
      async handler(ctx) {

        for await (const record of this.adapter.bee.createReadStream({ gt: 0 })) {
          if (!record.key.toString().includes(this.adapter.indexSeparator) && record.key.toString().length === 64) {
            await this.actions.createSubIndexes({ keys: ctx.params.keys, value: record.value })
          }
          for (const key of ctx.params.keys) {
            if (record.key.toString().includes(key)) {
              await this.adapter.bee.del(record.key)
            }
          }

        }
      }
    },

    updateRawData: {
      params: {
        path: 'string'
      },
      async handler(ctx) {
        const { path } = ctx.params
        const data = require(path)

        const reindex = async (type, keys, value) => {
          for await (key of keys) {
            if (typeof key === 'array') {
              reindex(key)
            } else {
              await ctx.call(`${type}.createSubIndexes`, { keys, value })
            }
          }
        }

        for await (const type of Object.keys(data)) {
          for await (const value of data[type]['data']) {
            await ctx.call(`${type}.swap`, { key: value._id, value })
            await reindex(type, data[type]['keys'], value)
            // await ctx.call(`${type}.createSubIndexes`, { keys: data[type]['keys'], value })
          }
        }
      }
    }


  },

  methods: {
    _getSub(keys) {
      let sub
      for (const key of keys) {
        sub = sub ? sub + key + this.adapter.indexSeparator : key + this.adapter.indexSeparator
      }
      return enc.sub(sub.slice(0, -1), 'utf-8')
    },

    sha256(inp) {
      return this.adapter.sha256(inp)
    },

    _put(ctx, params) {
      const { key, value, options } = params
      return this.adapter.api.put({ key, value, options })
    },

    _swap(ctx, params) {
      const { key, value, options } = params
      return this.adapter.api.swap({ key, value, options })
    },

    _get(ctx, params) {
      const { key, options } = params
      return this.adapter.api.get({ key, options })
    },

    _del(ctx, params) {
      const { key, options } = params
      return this.adapter.api.del({ key, options })
    },
    _delCondition(ctx, params) {
      const { key, options } = params
      return this.adapter.api.delCondition({ key, options })
    },

    _batchInsert(ctx, params) {
      const { records, options } = params
      return this.adapter.api.batchInsert({ records, options })
    },

    _findFirst(ctx, params) {
      const { query } = params
      return this.adapter.api.findFirst({ query })
    },

    async _find(ctx, params) {
      let { query, options } = params
      // for (let search of query) {

      // }
      return this.adapter.api.find({ query, options })
    },

    _findStream(ctx, params) {
      let { query, options } = params
      return this.adapter.api.findStream({ query, options })
    },

    _fullHistory(ctx, params) {
      const { query } = params
      return this.adapter.api.fullHistory({ query })
    },

    _findDiff(ctx, params) {
      const { version, query } = params
      return this.adapter.api.findDiff(version, { query })
    },

    async _createSubIndexes(ctx, params) {
      const { keys, value, options } = params
      let prevKey = null
      let prevIndex = null

      for await (const key of keys) {
        let keyValue = value[key]

        if (key.includes('.')) {
          const keyPath = key.split('.')
          let kv = value
          for (let i = 0; i < keyPath.length; i++) {
            kv = kv[keyPath[i]]
          }
          keyValue = kv
        }

        const subKey = prevKey
          ? `${prevKey}${this.adapter.indexSeparator}${key}${this.adapter.indexSeparator}${keyValue}`
          : `${key}${this.adapter.indexSeparator}${keyValue}`

        const sub = enc.sub(subKey, 'utf-8')

        subIndex = prevIndex
          ? `${prevIndex}${this.adapter.indexSeparator}${keyValue}`
          : `${keyValue}`

        await this.adapter.api.put({
          key: `${subIndex}${this.adapter.indexSeparator}${value._id}`,
          value,
          options: { keyEncoding: sub }
        })

        prevKey = subKey
        prevIndex = subIndex
      }
      return value


      // for await (const key of keys) {
      //   subDb = await subDb.subDb({ prefix: key })
      //   await subDb.put({
      //     key: (prevKey
      //       ? `${value[prevKey]}!${value[key.split(':')[0]]}!${value._id}`
      //       : `${value[key.split(':')[0]]}!${value._id}`
      //     ),
      //     value
      //   })
      //   prevKey = key
      // }
      // return value
    },

  },

  async created() {
    //this.adapter = new HyperbeeAdapter(`./.${this.name}`)
    this.adapter = new HyperbeeAdapter(`${this.name}`)
    await this.adapter.init(this.broker, this)
    if (this.settings.swarm) {
      const topic = this.adapter.sha256(`growr-hyperspace-${this.name}`)
      console.log(`${this.name} topic: ${topic}`)
      const topicHex = Buffer.from(topic, 'hex')
      this.swarm = new Hyperswarm()
      this.swarm.on('connection', socket => this.adapter.core.replicate(socket))
      console.log(`${this.name} discovery key: ${this.adapter.core.discoveryKey.toString('hex')}`)
      this.swarm.join(topicHex, { server: true, client: false })
      await this.swarm.flush()
    }
  },

  async stopped() {
    if (this.settings.swarm) {
      await this.swarm.destroy()
    }
    await this.adapter.store.close();
  }
}
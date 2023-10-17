const countryCodes = require('./countryCodes.json')

const allowedTypes = () => {
  return Object.values(ENUMS.dataCredentialMap).map(type => type)
}

const getNames = (props) => {
  return props.map(prop => prop.name)
}

const getCountryList = () => {
  return countryCodes.map(c => c.iso)
}

const getTokenAddressWithName = () => {
  const tokenMap = {}
  Object.values(ENUMS.tokens).forEach(token => {
    tokenMap[token.address] = token.name
  })
  return tokenMap
}

const ENUMS = {
  inProgress: 'IN_PROGRESS',

  userRoles: {
    MERCHANT: 'MERCHANT',
    AGENT: 'AGENT',
  },

  invitationState: {
    PENDING: 'PENDING',
    REGISTERED: 'REGISTERED',
    BLOCKED: 'BLOCKED',
  },

  projectInvestorStates: {
    REQUESTED: 'REQUESTED',
    APPROVED: 'APPROVED',
    CONFIRMED: 'CONFIRMED',
    REJECTED: 'REJECTED',
  },

  projectState: {
    DRAFT: 'DRAFT',
    ACTIVATED: 'ACTIVATED',
    DEACTIVATED: 'DEACTIVATED',
    CLOSED: 'CLOSED',
    DELETED: 'DELETED'
  },

  projectActions: {
    NEW: 'NEW',
    UPDATE: 'UPDATE',
    ACTIVATE: 'ACTIVATE',
    DEACTIVATE: 'DEACTIVATE',
    MODIFY: 'MODIFY'
  },

  loanState: {
    DRAFT: 'DRAFT',
    APPLIED: 'APPLIED',
    DISBURSED: 'DISBURSED',
    REPAID: 'REPAID',
    OVERDUED: 'OVERDUED',
    DEFAULT: 'DEFAULT'
  },

  operations: {
    REGISTER: [
      'getOTP',
      'registerAdmin',
      'registerLender',
      'registerUser',
      'loginWithEmail',
      'IntrospectionQuery',
      'hello',
      'getSchema',
      'getPublicProjects',
      'getPublicProject',
      'projectsPublic',
      'projectPublic'
    ]
  },

  userStates: {
    SIGNUP: 'SIGNUP',
    REGISTERED: 'REGISTERED',
    CONFIRMED: 'CONFIRMED',
    SUBSCRIBED: 'SUBSCRIBED',
    // BAGGED: 'BAGGED',
    // BUYAGREED: 'BUYAGREED',
    // SELLAGREED: 'SELLAGREED',
    APPLIED: 'APPLIED',
  },

  ussdStates: {
    NULL: null,
    WELCOME: 'WELCOME',
    REGISTER: 'REGISTER',
    CONFIRM: 'CONFIRM',
    CONFIRM_VCS: 'CONFIRM_VCS',
    SUBSCRIBE: 'SUBSCRIBE',
    BAG: 'BAG',
    BUYAGREE: 'BUYAGREE',
    SELLAGREE: 'SELLAGREE',
    APPLY: 'APPLY',
    APPLY_CON: 'APPLY_CON',
    MAIN_MENU: 'MAIN_MENU',
    MAIN_MENU_SEL: 'MAIN_MENU_SEL'
  },

  maritalStatus: {
    MARRIED: 'MARRIED',
    SINGLE: 'SINGLE',
    DIVORCED: 'DIVORCED',
    WIDOWED: 'WIDOWED'
  },

  dataCredentialMap: {
    maritalStatus: 'MaritalStatus',
    amcos: 'AgriFinCoop',
    sacco: 'SavingsAndCreditCoop',
    landSize: 'LandSize',
    citizenship: 'Citizenship',
    dateOfBirth: 'DateOfBirth',
    maxRecommendedInput: 'MaxRecommendedInput',
    cropCount: 'CropCount',
    regionName: 'RegionName',
  },

  dataCreditMap: {
    bagsRecommended: 'bagsRecommended',
    bagPriceOutstanding: 'bagPriceOutstanding',
    bagPriceAdvance: 'bagPriceAdvance'
  },

  loanTypes: {
    Seasonal: 'Seasonal',
    Subscription: 'Subscription',
    CreditLine: 'CreditLine'
  },

  fundingTypes: {
    BankAccount: 'BankAccount',
    OnchainWallet: 'OnchainWallet',
    MultisigWallet: 'MultisigWallet'
  },

  fundingStatuses: {
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE'
  },

  paymentSources: {
    CASH: 'CASH',
    MOBILE: 'MOBILE',
  },

  paymentStates: {
    INITIATED: 'INITIATED',
    CONFIRMED: 'CONFIRMED',
    CANCELLED: 'CANCELLED'
  },

  loanEventTypes: {
    PAYMENT: 'PAYMENT',
  },



  tokens: {
    TZS: {
      name: 'TZS',
      onChain: false
    },
    EUR: {
      name: 'EUR',
      onChain: false
    },
    USD: {
      name: 'USD',
      onChain: false
    },
    XUSD: {
      name: 'XUSD',
      onChain: true,
      network: 'Rootstock',
      address: '0xb5999795BE0EbB5bAb23144AA5FD6A02D080299F', //mainnet TODO make those to be chosen from .env
      // address: '0x7237aD8910561B683c760A29246af14cAA52EEd2' //testnet

    },
    RDOC: {
      name: 'RDOC',
      onChain: true,
      network: 'Rootstock',
      address: '0x2d919f19D4892381d58EdEbEcA66D5642ceF1A1F'
    },
    RBTC: {
      name: 'RBTC',
      onChain: true,
      network: 'Rootstock',
      address: 'NATIVE'
    },
    SATS: {
      name: 'SATS',
      onChain: true,
      network: 'Lightning',
      address: 'NATIVE'
    },
    BTC: {
      name: 'BTC',
      onChain: true,
      network: 'Bitcoin',
      address: 'NATIVE'
    },
    ETH: {
      name: 'ETH',
      onChain: true,
      network: 'Ethereum',
      address: 'NATIVE'
    }
  },

  networks: {
    Rootstock: {
      name: 'Rootstock'
    },
    Lightning: {
      name: 'Lightning'
    },
    Bitcoin: {
      name: 'Bitcoin'
    }
  },

  networkConfigs: {
    Rootstock: {
      provider: {
        mainnet: {
          name: 'rsk',
          rpcUrl: 'https://did.rsk.co:4444',
          registry: '0xdca7ef03e98e0dc2b855be647c39abe984fcf21b'
        },
        testnet: {
          name: 'rsk:testnet',
          rpcUrl: 'https://did.testnet.rsk.co:4444',
          registry: '0xdca7ef03e98e0dc2b855be647c39abe984fcf21b'
        }
      },
      wsprovider: {
        mainnet: 'wss://public-node.rsk.co/websocket',
        testnet: 'wss://public-node.testnet.rsk.co/websocket',
      },
      network: {
        testnet: {
          uri: 'https://public-node.testnet.rsk.co',
          options: { name: 'rsk-testnet', chainId: 31 }
        },
        mainnet: {
          uri: 'https://public-node.rsk.co',
          options: { name: 'rsk', chainId: 30 }
        }
      }
    }
  },

  networkConfigs: {
    Rootstock: {
      provider: {
        mainnet: {
          name: 'rsk',
          rpcUrl: 'https://did.rsk.co:4444',
          registry: '0xdca7ef03e98e0dc2b855be647c39abe984fcf21b'
        },
        testnet: {
          name: 'rsk:testnet',
          rpcUrl: 'https://did.testnet.rsk.co:4444',
          registry: '0xdca7ef03e98e0dc2b855be647c39abe984fcf21b'
        }
      },
      wsprovider: {
        mainnet: 'wss://public-node.rsk.co/websocket',
        testnet: 'wss://public-node.testnet.rsk.co/websocket',
      },
      network: {
        testnet: {
          uri: 'https://public-node.testnet.rsk.co',
          options: { name: 'rsk-testnet', chainId: 31 }
        },
        mainnet: {
          uri: 'https://public-node.rsk.co',
          options: { name: 'rsk', chainId: 30 }
        }
      }
    }
  },

  durationMeasure: ['y', 'Q', 'M', 'w', 'd', 'h', 'm', 's'],

  countryList: getCountryList()
}

ENUMS.tokenAddressWithName = (getTokenAddressWithName(Object.values(ENUMS.tokens)))
ENUMS.tokenNames = (getNames(Object.values(ENUMS.tokens))).toString()
ENUMS.networkNames = (getNames(Object.values(ENUMS.networks))).toString()

ENUMS.VC = {
  allowedTypes: allowedTypes(),

  valueDataTypes: [
    'string',
    'number'
  ],

  valueOperators: [
    'equal',
    'notEqual',
    'greaterThan',
    'greaterThanInclusive',
    'lessThanInclusive',
    'lessThan'
  ],
}

//console.log(ENUMS.tokenAddressWithName)
module.exports = ENUMS
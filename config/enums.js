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

  operations: {
    REGISTER: [
      'getOTP',
      'IntrospectionQuery',
      'hello'
    ]
  },

  userStates: {
    SIGNUP: 'SIGNUP',
    REGISTERED: 'REGISTERED',
    CONFIRMED: 'CONFIRMED',
    // BUYAGREED: 'BUYAGREED',
    // SELLAGREED: 'SELLAGREED',
    APPLIED: 'APPLIED',
  },

  ussdStates: {
    NULL: null,
    WELCOME: 'WELCOME',
    REGISTER: 'REGISTER',
    CONFIRM: 'CONFIRM',
    BUYAGREE: 'BUYAGREE',
    SELLAGREE: 'SELLAGREE',
    APPLY: 'APPLY',
    APPLY_CON: 'APPLY_CON',
    MAIN_MENU: 'MAIN_MENU',
    MAIN_MENU_SEL: 'MAIN_MENU_SEL'
  },

  countryList: getCountryList()
}

module.exports = ENUMS
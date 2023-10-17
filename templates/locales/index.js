const { readdir } = require('node:fs/promises')

const getLanguages = async () => {
  return ((await (readdir('./templates/locales')))
    .filter(f => (!(f === 'index.js'))))
    .map(l => l.split('.')[0])
}

const messages = {}

getLanguages().then(languages => {
  for (let l of languages) {
    messages[l] = require(`./${l}.js`)
  }
})

module.exports = messages


'use strict';

function decapitalizeFirstLetter(text) {
  return text && text[0].toLowerCase() + text.slice(1) || text
}

function capitalizeFirstLetter(text) {
  return text && text[0].toUpperCase() + text.slice(1) || text
}

function getNextOptions(text) {
  return text.match(/[0-9]\./g);
}

module.exports.decapitalizeFirstLetter = decapitalizeFirstLetter;
module.exports.capitalizeFirstLetter = capitalizeFirstLetter;
module.exports.getNextOptions = getNextOptions;
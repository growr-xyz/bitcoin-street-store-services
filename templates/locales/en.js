/* eslint-disable max-len */

const ENUMS = require('../../config/enums')

const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
]

module.exports = {

  //ending messages
  'wrongPin': 'Wrong PIN.',
  'pinNotMatch': 'Pin does not match!',
  'wrongOtp': 'Wrong OTP.',
  'noUser': 'You are not invited.',
  'end': 'Good bye!',

  //onboarding messages
  'members.invite': (otp) => {
    return `Congratulations! You are eligible to register for our services! ${otp} is your one-time password (OTP).`
   },
  'members.createIdentity': `You have been invited to join Bitcoin Street Store. Enter OTP:
0. Exit`,
  'members.createIdentity.setPin': 'Set PIN:',
  'members.createIdentity.confirmPin': 'Confirm PIN:',
  'members.createIdentity.identityCreated': `PIN Set. Identity created.
1. Continue
0. Exit`,

  //login messages
  'members.enterPin': 'Welcome to Bitcoin Street Store Menu.\nEnter PIN:',
  'members.mainMenu': (name) => {
    return `Hi ${name}, welcome to Bitcoin Street Store.
    Please select: 
    1. Confirm store changes - ${changes} pending change(s)
    2. Change product quantity - ${products} below 2 pcs 
    3. Orders - ${orders} pending order
    4. Store wallet - ${balance} ${currency} 
    0. Exit`
  },

  
}
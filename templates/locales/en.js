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
  'wrongPin': 'Wrong PIN.',
  'pinNotMatch': 'Pin does not match!',
  'wrongOtp': 'Wrong OTP.',
  'alreadySub': 'You are subscribed already',
  'bagsNotInRange': 'The bags selected are not in range.',
  'bagsNoPrice': 'Subscription is currently unavailable. Try again later.',
  'notSubscribed': 'You are not subscribed',
  'notAgreed': 'You have not agreed offer',
  'end': 'Good bye!',
  'noPaymentDetails': 'No payment details available',
  'userNotFound': 'Invalid phone number',
  'noLoan': 'Invalid subscription',
  'wrongLoanSelection': 'Invalid subscription selection',
  'invalidAmount': 'Invalid repayment amount',
  'signup': `SignUp to Mavuno:
1. Continue
-. CBT Number <PLANNED>
0. Exit
`,
  'signup.enterAmcos': 'State the AMCOS your are delivering your harvest to',
  'signup.enterFullName': 'Type your full name:',
  'signup.enterFarmSize': 'Type your farm size in acres:',
  'signup.enterPrevYield': 'How many kgs was your last year yield:',
  'signup.agree': `I hereby agree that my personal data, farmsize, AMCOS and harvest data is correct.
I give the permission to Mavuno to visit my farm, and to collect and store all data.
1. Confirm
0. Cancel`,
  'signup.complete': 'Thank you! Our agents will contact you to finish the signup!',
  'members.createIdentity': `You are about to create a new identity. Enter OTP
0. Exit`,
  'members.createIdentity.setPin': 'Set PIN:',
  'members.createIdentity.confirmPin': 'Confirm PIN:',
  'members.createIdentity.identityCreated': `PIN Set. Identity created.
1. Continue
0. Exit`,
  'members.confirmCredentials1': (confirmationString) => {
    return `Please confirm: ${confirmationString}
1. Confirm
0. Exit`
  },
  'members.confirmCredentials2': `Credentials are being issued.
1. Continue
0. Exit`,
  'members.confirmCredentials3': 'All credentials are confirmed.\n1. Continue\n0. Exit',
  'members.issueCredentials1': `Credentials are being issued.
  1. Continue
  0. Exit`,
  'members.confirmCredentialsEnd': 'Please confirm credentials first!',
  'members.displayCredentials': (credentialsString) => {
    return `List of credentials: ${credentialsString}
1. Back to Main Menu
2. Subscribe
0. Exit`
  },
  'members.enterPin': 'Welcome to Mavuno Members Menu.\nEnter PIN:',
  'members.mainMenu': (name) => {
    return `Hi ${name}, welcome to Mavuno.
    Please select: 
    1. Confirm New Credentials
    2. Display Credentials
    3. Subscribe for ${monthNames[(new Date()).getMonth()]}
    4. Get Services
    5. Display Services
    0. Exit`
  },
  'members.subscribe': (name) => {
    return `Welcome ${name} !
  Please select:
1. Subscribe for 2023 season
2. Back to Main Menu
0. Exit`
  },
  'members.subscribe.bagSelect': (user) => {
    return `Mavuno will supply and spray the sulfur in time.Choose sulfur bags for subscription ${user.creditData.minBagsRecommended} - ${user.creditData.maxBagsRecommended}):
0. Cancel`
  },
  'members.subscribe.prepaymentAgreement': (selectedBags, subscriptionStartDate, subscriptionDueDate, totalPriceMonthly, bagPriceMonthly) => {
    return `You are to subscribe for ${selectedBags} bags for ${bagPriceMonthly} TZS per month and bag.
Pay ${totalPriceMonthly} TZS per month starting at ${subscriptionStartDate} until  ${subscriptionDueDate}! 
I agree to all further Terms and Conditions (https://www.terms-swahili.mavuno.tech).
1. Agree and Continue
0. Exit
`
  },
  'members.subscribe.subscribed': `Congratulations! You have subscribed for Mavuno season ${new Date().getFullYear()}!
1. Continue to service detail agreement
2. Back to Main Menu
0. Exit 
  `,
  'members.getLoan': (totalSubscriptionFee, totalPriceMonthly, duration) => {
    return `You are hereby subscribing for a service of ${totalSubscriptionFee} TZS. Payable in ${duration} monthly installments of ${totalPriceMonthly} TZS.
1. Agree and Continue
0. Exit`
  },
  'members.getLoan.loanAgree': (selectedBags, totalPriceMonthly, subscriptionDueDate) => {
    return `By Pressing 1., I agree to subscribe for ${selectedBags} bags for a monthly Payment of ${totalPriceMonthly} TZS to pay until ${subscriptionDueDate}
1. Agree
0. Exit`
  },
  'members.getLoan.signLoan': (loanId, amount) => {
    return `Congratulations! You subscribed to service ${loanId} for amount ${amount}!
1. Display services
0. Exit
`
  },
  'members.displayLoans': (loanString) => {
    return `Your subscriptions: 
No     Date      Amount    Duration
${loanString}
1. Back to Main Menu
0. Exit
  `
  },
  'sms.signupComplete': () => {
    return 'Congratulations! You have successfully signup for the early stage. We will contact you to visit your farm and then you will be sent a message to complete your registration.'
  },

  'consultants.mainMenu': (name) => {
    return `Hi ${name}, welcome to Mavuno.
Please select: 
1. Register cash payment
2. Confirm payment
0. Exit`
  },

  'consultants.confirmInvitation': () => {
    return `You are about to confirm invitation as Mavuno Agent. Enter OTP:
  0. Exit`
  },

  'consultants.confirmInvitation.invitationConfirmed': () => {
    return `You have successfully confirmed your invitation.
  1. Continue to Main Menu
  0. Exit`
  },

  'consultants.enterPin': 'Welcome to Mavuno Agents Menu.\nEnter PIN:',
  'consultants.enterTan': 'Enter TAN to confirm payment:',

  'consultants.registerCashPayment.selectPaymentSource': () => {
    let paymentSourceLine = ''
    for (const sourceIndex in Object.keys(ENUMS.paymentSources)) {
      const index = Number.parseInt(sourceIndex)
      const source = Object.values(ENUMS.paymentSources)[sourceIndex]
      paymentSourceLine += `${index+1}. ${source}\n`
    }
    return `Please select payment source:
${paymentSourceLine}\n
0. Exit`
  },

  'consultants.registerCashPayment.enterUserPhone': 'Please enter subscriber phone number without leading 0:',
  'consultants.registerCashPayment.details': (borrowerName, loanString, subscrption) => {
    return `${borrowerName} has active: 
No     Date      Amount to pay  Duration
${loanString}
for ${subscrption.selectedBags} bags for total price monthly ${subscrption.totalPriceMonthly} TZS.
Please select which subscription you would like to pay or 0. for Exit.`
  },

  'consultants.registerCashPayment.paymentDetailsContinue': () => {
    return 'Please enter amount to pay or 0. for Exit.'
  },

  'consultants.registerCashPayment.intentCreated': () => {
    return `Unique payment code has been sent to the subscriber phone number.
Please select:
1. To complete payment
0. Exit`
  },

  'consultants.confirmPayment.enterTan': (borrowerName) => {
    return `Enter TAN for payment of ${borrowerName}`
  },

  'sms.paymentIntent': (amount, currency, type, source, tan) => {
    return `You are about to pay ${amount} ${currency} in ${source}. Please confirm with your TAN: ${tan} to Agent or Enter Mavuno USSD Service`
  },
  'sms.paymentIntentConfirmed': (amount, currency, source ) => {
    return `Thank you for your ${source} payment of ${amount} ${currency}.`
  },

  'paymentNotFound': 'Payment not found',
  'consultants.paymentSuccess': `Payment successful!
Please select:
1. Go back to Main Menu
0. Exit`
}
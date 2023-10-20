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
  'invalidUser': 'You are not authenticated.',
  'invalidProduct': 'You have selected invalid product.',
  'invalidOrder': 'You have selected invalid order.',
  'invalidCode': 'YOu have provided invalid delivery code.',
  'end': 'Good bye!',

  //onboarding messages
  'members.invite': (otp) => {
    return `Congratulations! You are eligible to register for our services! ${otp} is your one-time password (OTP).`
   },
  'members.createIdentity': `You have been invited to join Bitcoin Street Store. 
  You are about to create a new identity. 
  Enter OTP:`,
  'members.createIdentity.setPin': `Now, set your private PIN code.
  Do not share it with anyone, including Bitcoin Street Store agents. 
  `,
  'members.createIdentity.confirmPin': 'Confirm your PIN code:',
  'members.createIdentity.identityCreated': `Your PIN was set and your merchant identity is created.\n
1. Continue
0. Exit`,
  'members.createIdentity.profile': (username, wallet, status) => {
  return `Congratulations! You have successfully created your identity!
Your profile info:
Username: ${username}
Wallet: ${wallet}
Status: ${status}\n
1. Continue
0. Exit`
  },

  //login messages
  'members.enterPin': `Welcome to Bitcoin Street Store.
  Enter PIN:`,
  'members.mainMenu': (name) => {
    return `Hi, ${name}, welcome to Bitcoin Street Store.
    Please select: 
    1. Store changes
    2. Product quantity 
    3. Orders
    4. Wallet
    5. Profile
    0. Exit`
  },

  'members.storeChanges': (draftProducts) => {
    let productsText = ''
    let i = 1
    for (const product of draftProducts) {
      productsText += `${i}. ${product.name}\n`
      i += 1
    }
    return `Confirm store changes ( ${i-1} new products):
${productsText}
1. Confirm
0. Exit`
  },
  'members.storeChanges.confirmed':`Congratulations! You store is now published with up-to-date information!\n
1. Back to Main menu`,

  'members.products': (products) => {
    let productsText = ''
    let i = 1
    for (const product of products) {
      productsText += `${i}. ${product.name}\n`
      i += 1
    }
    return `Current stock (${i-1} active products):
${productsText}
Enter product number to change quantity:`
  },
  'members.products.quantity': (productName, quantity) => {
    return `${productName}\n
Current quantity: ${quantity}\n
Enter new quantity:`
  },
  'members.products.quantityUpdated':`Product quantity was updated!\n
1. Back to Main menu`,
 
  'members.orders':  (orders) => {
    let ordersText = ''
    let i = 1
    for (const order of orders) {
      ordersText += `${i}. ${order.customerUserName} | ${order.price} ${order.currency} ${order.paid?"| Paid":""} ${order.shipped?"& Shipped":""} \n`
      i += 1
    }
    return `Pending orders:
${ordersText}
Enter order number to proceed:
0. Exit
99. See fulfilled orders`
  },
  'members.orders.order': (products, currency, price, paid, shipped, user, message) => {
    let productsText = ''
    for (const product of products) {
      productsText += `${product.product.name}: ${product.quantity}\n`
    }
    return `Order:\n
Products:
${productsText}
Price: ${price} ${currency}
Paid: ${paid ? "Yes" : "No"}
Shipped: ${shipped ? "Yes" : "No"}
User: ${user}
Message: ${message}\n
1. Reply to user
2. Ship order
3. Enter delivery code
0. Exit`
  },
  'members.orders.orderMessage': (user) => {
    return `Write a message to ${user}:`
  },
  'members.orders.orderMessageSent': (user) => {
    return `Your message to ${user} was sent.\n
1. Back to main menu`
  },
  'members.orders.shipping': (user) => {
    return `Your order to ${user} has been marked as shipped.\n
1. Back to main menu`
  },

  'members.orders.deliveryCode': 'Enter a code to confirm successful delivery',

  'members.orders.deliveryCodeEntered': (price, currency) => {
    return `Your delivery code was accepted. ${price} ${currency} will be transferred to your wallet.`
  },

  'members.wallet': (wallet, balance) => {
    return `Current store balance: ${balance} sats\n
Withdrawal wallet address: ${wallet}\n
1. Change wallet
0. Exit
    `
  },
  'members.wallet.change': 'Enter new wallet address:',
  'members.wallet.changedAddress': (wallet) => {
    return `Your new withdraw wallet address is: ${wallet}\n
1. Back to main Menu`
  },

  'members.profile': (username, wallet, status) => {
  return `Your profile info:
Username: ${username}
Wallet: ${wallet}
Status: ${status}\n
1. Continue`
  },

}
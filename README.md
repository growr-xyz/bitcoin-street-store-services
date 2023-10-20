# Back-end services for Bitcoin Street Store

# Architecture

## Overview

![Overall architecture](./architecture.svg)

We are building a decentralized infrastructure for a borderless & censorship resistant commerce with **Bitcoin/Lightning** for the payments, **Nostr** as a decentralized marketplace, and **USSD** protocol for low-tech access.

**Agents** use the Agent app as a platform to easily manage the stalls and products they are promoting. **Merchants** controls the publishing of products to the marketplace, monitor and manage the orders via USSD interface. Through the decentralized marketplace, **Buyers** can easily browse and order products online. Buyers pay for products using their Lightning wallet and the money goes through a specialized escrow service before being released to the Merchant wallet.

## Back-end services

The backend has microservices architecture design based on _MoleculerJS_. However, for the moment, it is deployed as a monolith application. Some of the services leverages MongoDB as a local storage.

### API

API gateway service that provides front-end application with access to the rest of the services via REST interface.

### User

The User service is responsible for the registration and management of the users - both agents and merchants.

### Identity

The Identity service is designed for managing identity data in a decentralized, secure way, based on Nostr profiles.

### Escrow

The Escrow service manages the payments between buyers and merchants. For each order, it generates a unique code that must be presented by the buyer upon delivery in order to release the payment to the merchant. In its first version, the service controls a custodial escrow wallet, but we envision a non-custodial implementation using HODL invoices or discreet log contracts over Lightning.

### USSD

The USSD service manages menu, navigation and interfaces for the merchant.

### Nostr

The Nostr service is responsible for registration and management of a Nostr profile for each merchant, and facilitation the incoming and outgoing communication of this profile.

### LNBits proxy

The LNBits proxy does exactly what it name suggests - provides access to LNBits APIs.

## Integrations

### Agent app

The Agent app is a web-based applications, built using React.js and Next.js. Authentication is implemented via Nostr connect. Access to the back-end is through REST APIs.

### LNBits

TBD

### Marketplace app

TBD

# Running the services

## Prerequisites

To run the services, you need to have installed:

- Node.js
- MongoDB

## Configuration

You must configure the following environment variables:

- `MONGO_URI` : Link to the database, e.g. `mongodb://@localhost:27017`
- `MONGO_DB_NAME` : Database name, e.g. `bss`
- `OTP_TTL` : Time-to-live period for the OTP code e.g. `1M`
- `LOCALE` : Locale of the USSD interface, e.g. `en`
- `SERVICES_DOMAIN` : e.g. `http://localhost:3333`
- `NOSTR_RELAYS` : Address of the Nostr relay, e.g. `wss://relay.damus.io`
- `NOSTR_DOMAIN` : TBD
- `IDENTITY_PROVIDER`: `nostr`
- `WALLET_PROVIDER` : `lnbits`
- `LNBITS_ADMIN_KEY` : Admin key of the LN bits installation, e.g. `1b123123123123123123123123`
- `LNBITS_URI` : e.g. Address (URL) of the LN bits installation
- `RESTAPI_AUTH` : `true` by default, `false` for testing purposes only
- `DOMAIN` : TBD
- `TRACING_ENABLED` : `true` or `false`

## How to run it

1. Install all dependencies:

```bash
npm i
```

2. Run the services

```bash
npm run dev
```

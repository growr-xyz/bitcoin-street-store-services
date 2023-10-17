import DbService from '../mixins/db.mixin';
import { MoleculerClientError } from 'moleculer';
import { Service, Action, Method } from 'moleculer-decorators';

interface Identifier {
  provider: string;
  value: string;
  privateKey: string;
  walletAddress?: string;
  credentials: Array<{ type: string; value: string }>;
  createdAt: number;
  updatedAt: number;
}

@Service({
  name: '',
  metadata: {
    $category: 'identity',
    $description: 'Moleculer GROWR Identity Service',
    $official: false,
    $package: {
      name: 'moleculer-growr-identity-service',
      version: '0.0.1',
      repo: null
    }
  },
  mixins: [DbService('identity')]
})
class IdentityService {
  settings = {
    fields: {
      _id: 'string',
      userId: 'string',
      session: 'string',
      identifier: {
        type: 'object',
        hidden: false,
        properties: {
          provider: 'string',
          value: 'string',
          privateKey: 'string',
          walletAddress: 'string|optional'
        },
        credentials: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              type: 'string'
            },
            value: {
              type: 'string'
            }
          }
        },
        createdAt: { type: 'number', onCreate: () => Date.now() },
        updatedAt: { type: 'number', onUpdate: () => Date.now() }
      }
    }
  };

  dependencies = [];

  @Action()
  async createIdentity(ctx) {}

  @Action({
    params: {
      provider: { type: 'string', required: true },
      identifier: { type: 'string', required: true }
    }
  })
  async findUserByIdentifier(ctx) {
    const { provider, identifier } = Object.assign({}, ctx.params);
    let identity = await this.findOne({
      'identifier.provider': provider,
      'identifier.value': identifier
    });
    if (!identity || !identity.userId) {
      throw new MoleculerClientError('This DID is not into custody');
    }
    identity = await ctx.call('users.get', { id: identity.userId });
    return identity;
  }

  @Action()
  async setSession(ctx) {
    const { user } = Object.assign({}, ctx.meta);
    const identity = await this.findOne({ userId: user._id });
    if (!identity) {
      throw new MoleculerClientError('User does not exist');
    }
    identity.session = user.session;
    await ctx.call('identity.update', { id: identity._id, ...identity });
    return true;
  }

  @Action({
    params: {
      type: { type: 'string', required: true }
    }
  })
  async claimCredentials(ctx) {
    const { type } = Object.assign({}, ctx.params);
    const userId = ctx.meta.user._id;
    const session = ctx.meta.user.session;
    const identity = await this.findOne({ userId });
    if (!identity) {
      throw new MoleculerClientError('User does not exist');
    }
    if (identity.session !== session) {
      throw new MoleculerClientError('Session does not match');
    }
    const credentials = await ctx.call('issuer.claimCredentials', {
      identifier: identity.identifier.value,
      type
    });
    identity.credentials = credentials;
    await ctx.call('identity.update', { id: identity._id, ...identity });
  }

  events = {};

  @Method
  async createPresentation(identity, agent, types) {
    return {
      '@context': ['context'],
      type: ['VerifiablePresentation'],
      verifiableCredential: types.map((type) => {
        return {
          '@context': ['context'],
          type,
          credentialSubject: {
            id: identity.identifier.value,
            type: identity.identifier.type
          }
        };
      })
    };
  }

  hooks = {};
}

export default IdentityService;

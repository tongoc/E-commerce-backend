import { SubscriptionServer } from 'subscriptions-transport-ws';
import { execute, subscribe } from 'graphql';
import jwt from 'jsonwebtoken';
import { get } from 'lodash';
import schema from './graphql';
import config from './config';
export default (server) => SubscriptionServer.create(
    {
      schema,
      execute,
      subscribe,
      onConnect: (connectionParams) => {
        const token = get(connectionParams, 'authorization', '').replace('Bearer ', '');
        if (!token) {
          throw new Error('Unauthorized!')
        }

        const user = jwt.decode(token, config.auth.secret);
        if (!user) {
            throw new Error("Unauthorized");
        }
        return {
            user,
        };
      },
      onOperation: (message, connection) => ({ ...connection, message }),
    },
    {
      server,
      path: '/graphql',
    },
  );
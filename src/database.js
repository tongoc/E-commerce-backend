import knex from 'knex';
import config from './config';

export default knex({
  client: config.database.driver,
  connection: {
    filename: config.database.url
  },
  useNullAsDefault: true
});
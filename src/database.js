import knex from 'knex'

export default {
    connect: () => {
        return knex({
            client: 'sqlite3',
            connection: {
              filename: "./tmp/database.db"
            },
            useNullAsDefault: true
          });
    }
}
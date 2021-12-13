import db from './database';

export default async function (app) {
    app.db = await db.connect();
    await app.db.raw(`CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY AUTOINCREMENT, name VARCHAR(50), detail VARCHAR(50), fee INT)`);
    await app.db.raw('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name VARCHAR(50), facebookId INTEGER, subscription INTEGER)');
    await app.db.raw('CREATE TABLE IF NOT EXISTS purchasedProducts (id INTEGER PRIMARY KEY AUTOINCREMENT, userId INTEGER, productId INTEGER)');
    return app;
}
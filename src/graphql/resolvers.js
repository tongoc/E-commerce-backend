import jwt from 'jsonwebtoken';
import { get } from 'lodash';
import config from '../config';
import database from '../database';
import pubsub, { USER_NOTIFICATION } from '../subscription';

function loginRequired(req) {
    const token = get(req.headers, 'authorization', '').replace('Bearer ', '');
    if (!token) {
        throw new Error('Unauthorized!')
    }

    const user = jwt.decode(token, config.auth.secret);
    if (!user) {
        throw new Error("Unauthorized");
    }
    return user;
}

const resolvers = {
    Query: {
        hello: () => {
            return 'Hello world!';
        },
        me: (_, args, { req }) => {
            const user = loginRequired(req)
            return {
                ...user,
                facebookId: user.id
            };
        },
        products: async () => {
            const db = await database.connect();
            const items = await db('products').select('*');
            return {
                items,
                total: items.length
            }
        },
    },
    Mutation: {
        addProduct: async (_, { item }) => {
            const db = await database.connect();
            const inserted = await db('products').insert(item);
            return {
                id: inserted[0],
                ...item
            }
        },
        purchaseProduct: async (_, { id }, { req }) => {
            const db = await database.connect();
            const user = loginRequired(req)
            const inserted = await db('purchasedProducts').insert({
                productId: id,
                userId: user.id
            });
            return inserted[0];
        },
        subcrible: async (_, args, { req }) => {
            const db = await database.connect();
            const user = loginRequired(req);
            try {
                await db('users').where({
                    id: user.id
                }).update({
                    subscription: 1
                });
                return 'Success'
            } catch(e) {
                return 'Fail'
            }
        },
    },
    Subscription: {
        notification: {
            subscribe: () => pubsub.asyncIterator(USER_NOTIFICATION),
        }
    },
    User: {
        purchasedProducts: async (user) => {
            const db = await database.connect();
            const purchasedItems = await db('purchasedProducts').select('productId').where({ userId: user.id }); 
            const products =  await db('products').select('*').whereIn('id', purchasedItems.map((item) => item.productId));
            return {
                items: products,
                total: products.length
            }
        }
    }
};

export default resolvers;
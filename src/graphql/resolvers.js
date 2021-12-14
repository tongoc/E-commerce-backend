import jwt from 'jsonwebtoken';
import { get } from 'lodash';
import config from '../config';
import pubsub, { USER_NOTIFICATION } from '../subscription';

export function loginRequired(req) {
    const token = get(req.headers, 'authorization', '').replace('Bearer ', '');
    if (!token) {
        throw Error('Unauthorized!')
    }

    const user = jwt.decode(token, config.auth.secret);
    if (!user) {
        throw Error("Unauthorized!");
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
                facebookId: user.facebookId
            };
        },
        products: async (_, args, { database }) => {
            const items = await database('products').select('*');
            return {
                items,
                total: items.length
            }
        },
    },
    Mutation: {
        addProduct: async (_, { item }, { database }) => {
            const inserted = await database('products').insert(item);
            return {
                id: inserted[0],
                ...item
            }
        },
        purchaseProduct: async (_, { id }, { req, database }) => {
            const user = loginRequired(req)
            const inserted = await database('purchasedProducts').insert({
                productId: id,
                userId: user.id
            });
            return inserted[0];
        },
        subcrible: async (_, args, { req, database }) => {
            const user = loginRequired(req);
            try {
                await database('users').where({
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
        purchasedProducts: async (user, args, { database }) => {
            const purchasedItems = await database('purchasedProducts').select('productId').where({ userId: user.id }); 
            const products =  await database('products').select('*').whereIn('id', purchasedItems.map((item) => item.productId));
            return {
                items: products,
                total: products.length
            }
        }
    }
};

export default resolvers;
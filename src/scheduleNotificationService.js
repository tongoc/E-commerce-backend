import { CronJob } from 'cron';
import pubsub, { USER_NOTIFICATION } from './subscription';
import database from './database';
import config from './config';

function send(user) {
    return Promise.resolve(user)
}

export default function () {
    const socketChannel = new CronJob(config.cron.interval, () => {
        pubsub.publish(USER_NOTIFICATION, { notification: {
            content: 'hello world!'
        }})
    });
    const foobarChannel = new CronJob(config.cron.interval, async () => {
       const db = await database.connect();
       const users = await db('users').select('*').where({
        subscription: 1
       })
       Promise.all(users.map((user) => send(user)))
    });
    socketChannel.start();
    foobarChannel.start();
}
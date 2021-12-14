export default {
    host: process.env.HOST || 'http://localhost:4000/graphql',
    auth: {
        secret: process.env.JWT_SECRET || 'shhhhh',
        facebook: {
            clientID: process.env.FACEBOOK_CLIENT_ID || "341864073937945",
            clientSecret: process.env.FACEBOOK_SECRET_KEY || "ecda512fefcd0f7826816d509c31bd88",
            callbackURL: process.env.FACEBOOK_CALLBACK_URL || "https://c8a3-2402-800-61ae-dc5c-6843-ce1b-b977-5305.ngrok.io/auth/facebook/callback"
        }
    },
    cron: {
        interval: process.env.CRON_JOB_INVERVAL || '30 11 * * *'
    },
    database: {
        driver: 'sqlite3',
        url: process.env.DATABASE_URL || './tmp/database.db'
    }
}
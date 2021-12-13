export default {
    host: 'http://localhost:4000/graphql',
    auth: {
        secret: 'shhhhh',
        facebook: {
            clientID: 341864073937945,
            clientSecret: "ecda512fefcd0f7826816d509c31bd88",
            callbackURL: "https://c8a3-2402-800-61ae-dc5c-6843-ce1b-b977-5305.ngrok.io/auth/facebook/callback"
        }
    },
    cron: {
        interval: '30 11 * * *'
    }
}
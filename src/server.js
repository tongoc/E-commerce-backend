import express from 'express'
import { graphqlHTTP } from 'express-graphql'
import passport from 'passport';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import jwt from 'jsonwebtoken';
import http from 'http';
import expressPlayground from 'graphql-playground-middleware-express';
import bootstraper from './bootstraper';
import database from './database';
import schema from './graphql';
import websocket from './socket';
import scheduleNotificationService from './scheduleNotificationService';
import config from './config';

passport.use(new FacebookStrategy(config.auth.facebook,
  async function (accessToken, refreshToken, profile, done) {
    try {
      const db = await database.connect();
      const user = await db('users').where({
        facebookId: profile.id
      }).limit(1);
      if (user[0]) {
        done(null, user[0]);
        return;
      }

      const insertedUser = await db('users').insert({
        name: profile.displayName,
        facebookId: profile.id
      });
      done(null, {
        id: insertedUser[0],
        name: profile.displayName,
        facebookId: profile.id
      });
    } catch (e) {
      done(e)
    }
  }));


const app = express();

app.use(passport.initialize());
app.use('/graphql', graphqlHTTP((req) => ({
  schema: schema,
  graphiql: { headerEditorEnabled: true },
  context: {
    req
  }
})));
app.get('/', (req, res) => {
  res.send('hello world!')
});
app.get('/auth/facebook', passport.authenticate('facebook'));
app.get('/auth/facebook/callback', passport.authenticate('facebook', { session: false }), (req, res) => {
  res.json({
    token: jwt.sign(req.user, config.auth.secret)
  })
});
app.get('/playground', expressPlayground({ endpoint: config.host }));

bootstraper(app).then((app) => {
  const httpServer = http.createServer(app);
  websocket(httpServer);
  httpServer.listen(4000, () => {
    console.log(`Running a GraphQL API server at ${config.host}`)
  })
  scheduleNotificationService();
})

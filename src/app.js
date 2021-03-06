import express from 'express'
import { graphqlHTTP } from 'express-graphql'
import passport from 'passport';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import jwt from 'jsonwebtoken';
import expressPlayground from 'graphql-playground-middleware-express';
import database from './database';
import schema from './graphql';
import config from './config';

passport.use(new FacebookStrategy(config.auth.facebook,
  async function (accessToken, refreshToken, profile, done) {
    try {
      const user = await database('users').where({
        facebookId: profile.id
      }).limit(1);
      if (user[0]) {
        done(null, user[0]);
        return;
      }

      const insertedUser = await database('users').insert({
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
    req,
    database
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

export default app;

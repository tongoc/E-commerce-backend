import dotenv from 'dotenv';
dotenv.config({});
import http from 'http';
import bootstraper from './bootstraper';
import websocket from './socket';
import scheduleNotificationService from './scheduleNotificationService';
import app from './app';
import config from './config';

bootstraper(app).then((app) => {
  const httpServer = http.createServer(app);
  websocket(httpServer);
  httpServer.listen(4000, () => {
    console.log(`Running a GraphQL API server at ${config.host}`)
  })
  scheduleNotificationService();
})
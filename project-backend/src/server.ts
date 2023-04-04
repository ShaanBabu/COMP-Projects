import express from 'express';
import cors from 'cors';
import fs from 'fs';
import morgan from 'morgan';
import config from './config.json';
import errorHandler from 'middleware-http-errors';
import { echo } from './echo';
import { authRegisterV3, authLoginV3, authLogoutV2, authPasswordResetRequest, authPasswordReset } from './auth';
import { channelDetailsV3, channelInviteV2, channelMessagesV3, ChannelJoinV3, channelLeaveV2, channelAddOwnerV2, channelRemoveOwnerV2 } from './channel';
import { channelsCreateV3, channelsListallV3, channelsListV3 } from './channels';
import { usersAllV2, userProfileSetNameV2, userProfileV3, userProfileSetEmailV2, userProfileSetHandleV1 } from './users';
import { dmCreateV2, dmDetailV2, dmRemoveV2, dmListV2, dmLeaveV2, dmMessagesV2 } from './dm';
import { search } from './search';
import { messageSendV2, messageSendDmV2, messageEditV2, messageRemoveV2, messageSendLaterDm, messageSendLater, standUpActive, standUpSend, standUpStart, messageReact, messagePin, messageUnpin, messageUnreact } from './message';
import { clearV1 } from './other';
import { getData, setData } from './dataStore';
import { dataPersist } from './helper';
import { adminUserPermissionChangeV1 } from './admin';

// Set up web app, use JSON
const app = express();
app.use(express.json());
// Use middleware that allows for access from other domains
app.use(cors());

// Example get request
app.get('/echo', (req, res, next) => {
  try {
    const data = req.query.echo as string;
    return res.json(echo(data));
  } catch (err) {
    next(err);
  }
});

app.get('/data', (req, res) => {
  res.json(getData());
});

// AUTH
app.post('/auth/register/v3', (req, res, next) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const nameFirst = req.body.nameFirst;
    const nameLast = req.body.nameLast;
    res.json(authRegisterV3(email, password, nameFirst, nameLast));
    dataPersist();
  } catch (err) {
    next(err);
  }
});

app.post('/auth/logout/v2', (req, res, next) => {
  try {
    const token = req.headers.token as string;
    res.json(authLogoutV2(token));
    dataPersist();
  } catch (err) {
    next(err);
  }
});

app.post('/auth/login/v3', (req, res, next) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    res.json(authLoginV3(email, password));
    dataPersist();
  } catch (err) {
    next(err);
  }
});

app.post('/auth/passwordreset/request/v1', (req, res, next) => {
  try {
    const email = req.body.email;
    res.json(authPasswordResetRequest(email));
    dataPersist();
  } catch (err) {
    next(err);
  }
});

app.post('/auth/passwordreset/reset/v1', (req, res, next) => {
  try {
    const resetCode = req.body.resetCode;
    const newPassword = req.body.newPassword;
    res.json(authPasswordReset(resetCode, newPassword));
    dataPersist();
  } catch (err) {
    next(err);
  }
});

// CHANNEL
app.get('/channel/details/v3', (req, res, next) => {
  try {
    const token = req.headers.token as string;
    const channelId = req.query.channelId as string;
    res.json(channelDetailsV3(token, parseInt(channelId)));
  } catch (err) {
    next(err);
  }
});

app.post('/channel/join/v3', (req, res, next) => {
  try {
    const token = req.headers.token as string;
    const channelId = req.body.channelId;
    res.json(ChannelJoinV3(token, channelId));
    dataPersist();
  } catch (err) {
    next(err);
  }
});

app.post('/channel/addowner/v2', (req, res, next) => {
  try {
    const token = req.headers.token as string;
    const channelId = req.body.channelId as string;
    const uId = req.body.uId as string;
    res.json(channelAddOwnerV2(token, parseInt(channelId), parseInt(uId)));
    dataPersist();
  } catch (err) {
    next(err);
  }
});

app.post('/channel/removeowner/v2', (req, res, next) => {
  try {
    const token = req.headers.token as string;
    const channelId = req.body.channelId;
    const uId = req.body.uId;
    res.json(channelRemoveOwnerV2(token, channelId, uId));
    dataPersist();
  } catch (err) {
    next(err);
  }
});

app.post('/channel/invite/v2', (req, res, next) => {
  try {
    const token = req.headers.token as string;
    const channelId = req.body.channelId as string;
    const uId = req.body.uId as string;
    res.json(channelInviteV2(token, parseInt(channelId), parseInt(uId)));
    dataPersist();
  } catch (err) {
    next(err);
  }
});

app.get('/channel/messages/v3', (req, res, next) => {
  try {
    const token = req.headers.token as string;
    const channelId = req.query.channelId as string;
    const start = req.query.start as string;
    res.json(channelMessagesV3(token, parseInt(channelId), parseInt(start)));
  } catch (err) {
    next(err);
  }
});

app.post('/channel/leave/v2', (req, res, next) => {
  try {
    const token = req.headers.token as string;
    const channelId = req.body.channelId;
    res.json(channelLeaveV2(token, channelId));
    dataPersist();
  } catch (err) {
    next(err);
  }
});

// CHANNELS
app.post('/channels/create/v3', (req, res, next) => {
  try {
    const token = req.headers.token as string;
    const name = req.body.name;
    const isPublic = req.body.isPublic;
    res.json(channelsCreateV3(token, name, isPublic));
    dataPersist();
  } catch (err) {
    next(err);
  }
});

app.get('/channels/listall/v3', (req, res, next) => {
  try {
    const token = req.headers.token as string;
    res.json(channelsListallV3(token));
  } catch (err) {
    next(err);
  }
});

app.get('/channels/list/v3', (req, res, next) => {
  try {
    const token = req.headers.token as string;
    res.json(channelsListV3(token));
  } catch (err) {
    next(err);
  }
});

// DMS
app.post('/dm/create/v2', (req, res, next) => {
  try {
    const token = req.headers.token as string;
    const uIds = req.body.uIds as number[];
    res.json(dmCreateV2(token, uIds));
    dataPersist();
  } catch (err) {
    next(err);
  }
});

app.get('/dm/details/v2', (req, res, next) => {
  try {
    const token = req.headers.token as string;
    const dmId = req.query.dmId as string;
    res.json(dmDetailV2(token, parseInt(dmId)));
  } catch (err) {
    next(err);
  }
});

app.get('/dm/list/v2', (req, res, next) => {
  try {
    const token = req.headers.token as string;
    res.json(dmListV2(token));
  } catch (err) {
    next(err);
  }
});

app.delete('/dm/remove/v2', (req, res, next) => {
  try {
    const token = req.headers.token as string;
    const dmId = req.query.dmId as string;
    res.json(dmRemoveV2(token, parseInt(dmId)));
    dataPersist();
  } catch (err) {
    next(err);
  }
});

app.post('/dm/leave/v2', (req, res, next) => {
  try {
    const token = req.headers.token as string;
    const dmId = req.body.dmId as string;
    res.json(dmLeaveV2(token, parseInt(dmId)));
    dataPersist();
  } catch (err) {
    next(err);
  }
});

app.get('/dm/messages/v2', (req, res, next) => {
  try {
    const token = req.headers.token as string;
    const dmId = req.query.dmId as string;
    const start = req.query.start as string;
    res.json(dmMessagesV2(token, parseInt(dmId), parseInt(start)));
    dataPersist();
  } catch (err) {
    next(err);
  }
});

// MESSAGES
app.post('/message/send/v2', (req, res, next) => {
  try {
    const token = req.headers.token as string;
    const channelId = req.body.channelId;
    const message = req.body.message;
    res.json(messageSendV2(token, channelId, message));
    dataPersist();
  } catch (err) {
    next(err);
  }
});

app.post('/message/senddm/v2', (req, res, next) => {
  try {
    const token = req.headers.token as string;
    const dmId = req.body.dmId as string;
    const message = req.body.message;
    res.json(messageSendDmV2(token, parseInt(dmId), message));
    dataPersist();
  } catch (err) {
    next(err);
  }
});

app.put('/message/edit/v2', (req, res, next) => {
  try {
    const token = req.headers.token as string;
    const messageId = req.query.messageId as string;
    const message = req.query.message as string;
    res.json(messageEditV2(token, parseInt(messageId), message));
    dataPersist();
  } catch (err) {
    next(err);
  }
});

app.delete('/message/remove/v2', (req, res, next) => {
  try {
    const token = req.headers.token as string;
    const messageId = req.query.messageId as string;
    res.json(messageRemoveV2(token, parseInt(messageId)));
    dataPersist();
  } catch (err) {
    next(err);
  }
});

app.post('/message/sendlaterdm/v1', (req, res, next) => {
  try {
    const token = req.headers.token as string;
    const dmId = req.body.dmId;
    const message = req.body.message;
    const timeSent = req.body.timeSent;
    res.json(messageSendLaterDm(token, dmId, message, timeSent));
    dataPersist();
  } catch (err) {
    next(err);
  }
});

app.post('/message/sendlater/v1', (req, res, next) => {
  try {
    const token = req.headers.token as string;
    const channelId = req.body.channelId;
    const message = req.body.message;
    const timeSent = req.body.timeSent;
    res.json(messageSendLater(token, channelId, message, timeSent));
    dataPersist();
  } catch (err) {
    next(err);
  }
});

app.post('/message/react/v1', (req, res, next) => {
  try {
    const token = req.headers.token as string;
    const messageId = req.body.messageId;
    const reactId = req.body.reactId;
    res.json(messageReact(token, messageId, reactId));
    dataPersist();
  } catch (err) {
    next(err);
  }
});

app.post('/message/pin/v1', (req, res, next) => {
  try {
    const token = req.headers.token as string;
    const messageId = req.body.messageId;
    res.json(messagePin(token, messageId));
    dataPersist();
  } catch (err) {
    next(err);
  }
});

app.post('/message/unpin/v1', (req, res, next) => {
  try {
    const token = req.headers.token as string;
    const messageId = req.body.messageId;
    res.json(messageUnpin(token, messageId));
    dataPersist();
  } catch (err) {
    next(err);
  }
});

app.post('/message/unreact/v1', (req, res, next) => {
  try {
    const token = req.headers.token as string;
    const messageId = req.body.messageId;
    const reactId = req.body.reactId;
    res.json(messageUnreact(token, messageId, reactId));
    dataPersist();
  } catch (err) {
    next(err);
  }
});

// STANDUP
app.get('/standup/active/v1', (req, res, next) => {
  try {
    const token = req.headers.token as string;
    const channelId = req.query.channelId as string;
    res.json(standUpActive(token, parseInt(channelId)));
  } catch (err) {
    next(err);
  }
});

app.post('/standup/start/v1', (req, res, next) => {
  try {
    const token = req.headers.token as string;
    const channelId = req.body.channelId;
    const length = req.body.length;
    res.json(standUpStart(token, channelId, length));
  } catch (err) {
    next(err);
  }
});

app.post('/standup/send/v1', (req, res, next) => {
  try {
    const token = req.headers.token as string;
    const channelId = req.body.channelId;
    const message = req.body.message;
    res.json(standUpSend(token, channelId, message));
  } catch (err) {
    next(err);
  }
});

// USERS
app.get('/user/profile/v3', (req, res, next) => {
  try {
    const token = req.headers.token as string;
    const uId = req.query.uId as string;
    res.json(userProfileV3(token, parseInt(uId)));
  } catch (err) {
    next(err);
  }
});

app.get('/users/all/v2', (req, res, next) => {
  try {
    const token = req.headers.token as string;
    res.json(usersAllV2(token));
  } catch (err) {
    next(err);
  }
});

app.put('/user/profile/setname/v2', (req, res, next) => {
  try {
    const token = req.headers.token as string;
    const nameFirst = req.query.nameFirst as string;
    const nameLast = req.query.nameLast as string;
    res.json(userProfileSetNameV2(token, nameFirst, nameLast));
    dataPersist();
  } catch (err) {
    next(err);
  }
});

app.put('/user/profile/setemail/v2', (req, res, next) => {
  try {
    const token = req.headers.token as string;
    const email = req.query.email as string;
    res.json(userProfileSetEmailV2(token, email));
    dataPersist();
  } catch (err) {
    next(err);
  }
});

app.put('/user/profile/sethandle/v2', (req, res, next) => {
  try {
    const token = req.headers.token as string;
    const handleStr = req.query.handleStr as string;
    res.json(userProfileSetHandleV1(token, handleStr));
    dataPersist();
  } catch (err) {
    next(err);
  }
});
// ADMIN

app.post('/admin/userpermission/change/v1', (req, res, next) => {
  try {
    const token = req.headers.token as string;
    const uId = req.body.uId;
    const permissionId = req.body.permissionId as number;
    res.json(adminUserPermissionChangeV1(token, uId, permissionId));
    dataPersist();
  } catch (err) {
    next(err);
  }
});

/*
app.post('/channels/create/v3', (req, res, next) => {
  try {
    const token = req.headers.token as string;
    const name = req.body.name;
    const isPublic = req.body.isPublic;
    res.json(channelsCreateV3(token, name, isPublic));
    dataPersist();
  } catch (err) {
    next(err);
  }
}); */

// SEARCH
app.get('/search/v1', (req, res, next) => {
  try {
    const token = req.headers.token as string;
    const queryStr = req.query.queryStr as string;
    res.json(search(token, queryStr));
    dataPersist();
  } catch (err) {
    next(err);
  }
});

// OTHER
app.delete('/clear/v1', (req, res) => {
  res.json(clearV1());
  dataPersist();
});

// for loading data from previous server session, if server is shut down.
const storedData = fs.readFileSync('src/persistentData.json', { flag: 'r' });
setData(JSON.parse(String(storedData)));

// handles errors nicely
app.use(errorHandler());

// for logging errors
app.use(morgan('dev'));

// start server
app.listen(parseInt(process.env.PORT || config.port), process.env.IP, () => {
  console.log(`⚡️ Server listening on port ${process.env.PORT || config.port}`);
});

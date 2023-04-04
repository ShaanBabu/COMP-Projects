import {http403ErrorGET, http400ErrorGET, http200SuccessGET, http400ErrorPOST, http403ErrorPOST, http400ErrorDELETE, http403ErrorDELETE, http400ErrorPUT, http200SuccessPOST, authRegisterPost, authLogoutPost, channelJoinV2Post, channelsCreateV2Post, clearV1Delete, messageSendV1Post, messageSendDmV1Post, messageEditV1Put, messageRemoveV1Delete, dmCreatePost, errorMsg, http403ErrorPUT, channelMessagesGet, dmMessagesV1Get , messageReactPOST, messagePinPOST, messageUnpinPOST, messageUnreactPOST} from './helperTest';
import { authUserId, channelId } from '../interfaces';
let user: authUserId;
let user2: authUserId;
let user3: authUserId;
let channel: channelId;

beforeEach(() => {
  clearV1Delete('clear/v1');
  user = authRegisterPost('auth/register/v3', {
    email: 'johnsmith@gmail.com',
    password: 'Password6',
    nameFirst: 'John',
    nameLast: 'Smith',
  });
  user2 = authRegisterPost('auth/register/v3', {
    email: 'jamessmith@gmail.com',
    password: 'Password6',
    nameFirst: 'James',
    nameLast: 'Smith',
  });
  user3 = authRegisterPost('auth/register/v3', {
    email: 'userthree@gmail.com',
    password: 'Password6',
    nameFirst: 'User',
    nameLast: 'Three',
  }); 
  channel = channelsCreateV2Post('channels/create/v3', {name: 'channel1', isPublic: true}, user.token);
});

describe('HTTP tests for message/send/v2', () => {
  test('Tests if successful', () => {
    const query = messageSendV1Post('message/send/v2', {channelId: channel.channelId, message: 'hello'}, user.token)
    expect(query).toEqual({messageId: expect.any(Number)});
  });

  test('Tests if error on invalid token passed', () => {
    authLogoutPost('auth/logout/v2', {}, user.token);
    const query = http403ErrorPOST('message/send/v2', {channelId: channel.channelId, message: 'hello'}, user.token);
    expect(query).toEqual({error: { message: 'token passed in is invalid' }});
  });

  test('Tests if error occurs on invalid channelId passed', () => {
    const query = http400ErrorPOST('message/send/v2', {channelId: 2, message: 'hello'}, user.token)
    expect(query).toEqual({error: { message: 'channelId does not refer to a valid channel' }});
  });

  test.each([
    { message: '', expected: {error: { message: 'length of message is less than 1 or over 1000 characters' }} },
    { message: '1'.repeat(1001), expected: {error: { message: 'length of message is less than 1 or over 1000 characters' }} },
  ])(`Tests if error occurs due to invalid message passed due to message length`, ({ message, expected }) => {
    const query = http400ErrorPOST('message/send/v2', {channelId: channel.channelId, message: message}, user.token)
    expect(query).toEqual(expected);
  });
  
  test('Tests if error occurs when user is not a member of the channel', () => {
    const query = http403ErrorPOST('message/send/v2', {channelId: 1, message: 'hello'}, user2.token)
    expect(query).toEqual({error: { message: 'channelId is valid and the authorised user is not a member of the channel' }});
  });
});

describe('HTTP tests for message/senddm/v2', () => {
  beforeEach(() => {
    authRegisterPost('auth/register/v3', {
      email: 'seanguevara@gmail.com',
      password: 'Password6',
      nameFirst: 'Sean',
      nameLast: 'Guevara',
    });
    authRegisterPost('auth/register/v3', {
      email: 'jacksmith@gmail.com',
      password: 'Password6',
      nameFirst: 'Jack',
      nameLast: 'Smith',
    });
    let channel = channelsCreateV2Post('channels/create/v3', {name: 'channel1', isPublic: true}, user.token);
    messageSendV1Post('message/send/v2', {channelId: channel.channelId, message: 'hello'}, user.token); 
  });

  test('Tests if successful', () => {
    const dm = dmCreatePost('dm/create/v2', {uIds: [1,3],}, user2.token);
    const query = messageSendDmV1Post('message/senddm/v2', {dmId: dm.dmId, message: 'hello'}, user2.token)
    expect(query).toEqual({messageId: 2});
  });

  test('Tests if successful when messages are sent in two different dms', () => {
    const dm1 = dmCreatePost('dm/create/v2', {uIds: [1,4],}, user2.token);
    const dm2 = dmCreatePost('dm/create/v2', {uIds: [1,3],}, user2.token);
    const query1 = messageSendDmV1Post('message/senddm/v2', {dmId: dm1.dmId, message: 'hello'}, user2.token);
    const query2 = messageSendDmV1Post('message/senddm/v2', {dmId: dm2.dmId, message: 'hello'}, user2.token)
    expect(query2).toEqual({messageId: 3});
  });

  test('Tests if error occurs on invalid token passed', () => {
    const dm = dmCreatePost('dm/create/v2', {uIds: [1,3],}, user2.token);
    authLogoutPost('auth/logout/v2', {}, user.token);
    const query = http403ErrorPOST('message/senddm/v2', {dmId: dm.dmId, message: 'hello'}, user.token)
    expect(query).toEqual({error: { message: 'token passed in is invalid' }});
  });

  test('Tests if error occurs on dmId does not refer to a valid DM', () => {
    const dm = dmCreatePost('dm/create/v2', {uIds: [1,3],}, user2.token,);
    const query = http400ErrorPOST('message/senddm/v2', {dmId: 2, message: 'hello'}, user2.token)
    expect(query).toEqual({error: { message: 'dmId does not refer to a valid DM' }});
  });

  test('Tests if error occurs on dmId is valid and the authorised user is not a member of the DM', () => {
    const dm = dmCreatePost('dm/create/v2', {uIds: [3,4],}, user.token);
    const query = http403ErrorPOST('message/senddm/v2', {dmId: dm.dmId, message: 'hello'}, user2.token)
    expect(query).toEqual({error: { message: 'dmId is valid and the authorised user is not a member of the DM' }});
  });

  test.each([
    { message: '', expected: {error: { message: 'length of message is less than 1 or over 1000 characters' }} },
    { message: '1'.repeat(1001), expected: {error: { message: 'length of message is less than 1 or over 1000 characters' }} },
  ])(`Tests if error occurs due to invalid message passed due to message length`, ({ message, expected }) => {
    const dm = dmCreatePost('dm/create/v2', {uIds: [2,3],}, user.token);
    const query = http400ErrorPOST('message/senddm/v2', {dmId: dm.dmId, message: message}, user.token)
    expect(query).toEqual(expected);
  });
});

describe('HTTP tests for message/edit/v2', () => {

  test('Tests if successful, if sender of the message edits their own message', () => {
    let message = messageSendV1Post('message/send/v2', {channelId: channel.channelId, message: 'hello'}, user.token);
    const query = messageEditV1Put('message/edit/v2', {messageId: message.messageId, message: 'hi'}, user.token)
    expect(query).toEqual({});
    const queryTwo = channelMessagesGet('channel/messages/v3', {channelId: channel.channelId, start:0}, user.token); 
    expect(queryTwo).toEqual({ messages: [{ messageId: message.messageId, uId: user.authUserId, message: 'hi', timeSent: expect.any(Number), reacts: expect.any(Array), isPinned: expect.any(Boolean)}], start: 0, end: -1 })
  });

  test('Tests if successful, if owner of the channel edits the message', () => {
    channelJoinV2Post('channel/join/v3', {channelId: channel.channelId}, user2.token);
    let message = messageSendV1Post('message/send/v2', {channelId: channel.channelId, message: 'hello'}, user2.token);
    const query = messageEditV1Put('message/edit/v2', {messageId: message.messageId, message: 'hi'}, user.token)
    expect(query).toEqual({});
  });

  test('Tests if error on invalid token passed', () => {
    let message = messageSendV1Post('message/send/v2', {channelId: channel.channelId, message: 'hello'}, user.token);
    authLogoutPost('auth/logout/v2', {}, user.token);
    const query = http403ErrorPUT('message/edit/v2', {messageId: 1, message: 'hi'}, user.token);
    expect(query).toEqual({error: { message: 'token passed in is invalid' }});
  });

  test('Tests if user attempting to edit the message is not part of the channel', () => {
    let message = messageSendV1Post('message/send/v2', {channelId: channel.channelId, message: 'hello'}, user.token);
    const query = http400ErrorPUT('message/edit/v2', {messageId: message.messageId, message: 'hi'}, user2.token)
    expect(query).toEqual({error: {message: 'messageId does not refer to a valid message within a channel/DM that the authorised user has joined'}});
  });

  test('Tests if user attempting to edit the message is not the sender of the message and does not have owner permissions', () => {
    let message = messageSendV1Post('message/send/v2', {channelId: channel.channelId, message: 'hello'}, user.token);
    channelJoinV2Post('channel/join/v3', {channelId: channel.channelId}, user2.token);
    const query = http403ErrorPUT('message/edit/v2', {messageId: message.messageId, message: 'hi'}, user2.token)
    expect(query).toEqual({error: {message: 'If the authorised user does not have owner permissions, and the message was not sent by them'}});
  });

  test('Tests if messageId is invalid', () => {
    const query = http400ErrorPUT('message/edit/v2', {messageId: 2, message: 'hi'}, user.token)
    expect(query).toEqual({error: {message: 'messageId does not refer to a valid message within a channel/DM that the authorised user has joined'}});
  });

  test('Tests if successful in DMs', () => {
    const dm = dmCreatePost('dm/create/v2', {uIds: [user.authUserId, user3.authUserId]}, user2.token);
    let message =  messageSendDmV1Post('message/senddm/v2', {dmId: dm.dmId, message: 'hello'}, user2.token);
    const query = messageEditV1Put('message/edit/v2', {messageId: message.messageId, message: 'hi'}, user2.token)
    expect(query).toEqual({});
  });

  test('Tests for success if message was edited by an owner of Treats but not owner of the DM', () => {
    const dm = dmCreatePost('dm/create/v2', {uIds: [user.authUserId, user3.authUserId]}, user2.token);
    let message = messageSendDmV1Post('message/senddm/v2', {dmId: dm.dmId, message: 'hello'}, user2.token);
    const query = messageEditV1Put('message/edit/v2', {messageId: message.messageId, message: 'hi'}, user.token)
    expect(query).toEqual({});
  });

  test('Tests if message editted is empty in dm', () => {
    const dm = dmCreatePost('dm/create/v2', {uIds: [user.authUserId, user3.authUserId]}, user2.token);
    let message = messageSendDmV1Post('message/senddm/v2', {dmId: dm.dmId, message: 'hello'}, user2.token);
    const query = messageEditV1Put('message/edit/v2', {messageId: message.messageId, message: ''}, user2.token)
    expect(query).toEqual({});
  });

});

describe('HTTP tests for message/remove/v2', () => {

  test('Tests if error on invalid token passed', () => {
    authLogoutPost('auth/logout/v2', {}, user.token);
    const query = http403ErrorDELETE('message/remove/v2', {messageId: 1}, user.token);
    expect(query).toEqual({error: { message: 'token passed in is invalid' }});
  });

  test('Tests if successful', () => {
    let message = messageSendV1Post('message/send/v2', {channelId: channel.channelId, message: 'hello'}, user.token);
    const query = messageRemoveV1Delete('message/remove/v2', {messageId: message.messageId}, user.token)
    expect(query).toEqual({});
    const queryTwo = channelMessagesGet('channel/messages/v3', {channelId: channel.channelId, start:0}, user.token); 
    expect(queryTwo).toEqual({ messages: [], start: 0, end: -1 })
  });

  test('Tests if message was removed by a user who is not part of the channel', () => {
    let message = messageSendV1Post('message/send/v2', {channelId: channel.channelId, message: 'hello'}, user.token);
    const query = http400ErrorDELETE('message/remove/v2', {messageId: message.messageId}, user2.token)
    expect(query).toEqual({error: {message: 'messageId does not refer to a valid message within a channel/DM that the authorised user has joined'}});
  });

  test('Tests if user attempting to remove the message is not the sender of the message and does not have owner permissions', () => {
    let message = messageSendV1Post('message/send/v2', {channelId: channel.channelId, message: 'hello'}, user.token);
    channelJoinV2Post('channel/join/v3', {channelId: channel.channelId}, user2.token);
    const query = http403ErrorDELETE('message/remove/v2', {messageId: message.messageId}, user2.token)
    expect(query).toEqual({error: {message: 'If the authorised user does not have owner permissions, and the message was not sent by them' }});
  });
});

describe('HTTP tests for message/sendlaterdm/v1', () => {
  
  test('Tests if successful', () => {
    const dm = dmCreatePost('dm/create/v2', {uIds: [1,3],}, user2.token);
    const timeSent = Math.floor((new Date()).getTime() / 1000) + 3000;
    const query = http200SuccessPOST('message/sendlaterdm/v1', {dmId: dm.dmId, message: 'hello', timeSent: timeSent}, user2.token);
    expect(query).toEqual({messageId: expect.any(Number)});
  });

  test('Tests if error on invalid token passed', () => {
    const dm = dmCreatePost('dm/create/v2', {uIds: [1,3],}, user2.token);
    authLogoutPost('auth/logout/v2', {}, user.token);
    const timeSent = Date.now() + 1000;
    const query = http403ErrorPOST('message/sendlaterdm/v1', {dmId: dm.dmId, message: 'hello', timeSent: timeSent}, user.token);
    expect(query).toEqual({error: {message: 'token passed in is invalid'}});
  });

  test('Tests if error on dmId does not refer to a valid DM', () => {
    const dm = dmCreatePost('dm/create/v2', {uIds: [1,3],}, user2.token);
    const timeSent = Date.now() + 1000;
    const query = http400ErrorPOST('message/sendlaterdm/v1', {dmId: 2, message: 'hello', timeSent: timeSent}, user.token);
    expect(query).toEqual({error: {message: 'dmId does not refer to a valid DM'}});
  });

  test('Tests if error on length of message is less than 1 characters', () => {
    const dm = dmCreatePost('dm/create/v2', {uIds: [1,3],}, user2.token);
    const timeSent = Date.now() + 1000;
    const query = http400ErrorPOST('message/sendlaterdm/v1', {dmId: dm.dmId, message: '', timeSent: timeSent}, user.token);
    expect(query).toEqual({error: {message: 'length of message is less than 1 or over 1000 characters'}});
  });

  test('Tests if error on length of message is more than 1000 characters', () => {
    const dm = dmCreatePost('dm/create/v2', {uIds: [1,3],}, user2.token);
    const message = 'e'.repeat(1001);
    const timeSent = Date.now() + 1000;
    const query = http400ErrorPOST('message/sendlaterdm/v1', {dmId: dm.dmId, message: message, timeSent: timeSent}, user.token);
    expect(query).toEqual({error: {message: 'length of message is less than 1 or over 1000 characters'}});
  });

  test('Tests if error on timeSent is a time in the past', () => {
    const dm = dmCreatePost('dm/create/v2', {uIds: [1,3],}, user2.token);
    const timeSent = Math.floor((new Date()).getTime() / 1000) - 1000;
    const query = http400ErrorPOST('message/sendlaterdm/v1', {dmId: dm.dmId, message: 'hello', timeSent: timeSent}, user.token);
    expect(query).toEqual({error: {message: 'timeSent is a time in the past'}});
  });

  test('Tests if error on dmId is valid and the authorised user is not a member of the DM they are trying to post to', () => {
    const dm = dmCreatePost('dm/create/v2', {uIds: [1],}, user2.token);
    const timeSent = Date.now() - 1000;
    const query = http403ErrorPOST('message/sendlaterdm/v1', {dmId: dm.dmId, message: 'hello', timeSent: timeSent}, user3.token);
    expect(query).toEqual({error: {message: 'dmId is valid and the authorised user is not a member of the DM they are trying to post to'}});
  });

});

describe('HTTP tests for message/sendlater/v1', () => {
  
  test('Tests if error on invalid token passed', () => {
    authLogoutPost('auth/logout/v2', {}, user.token);
    const timeSent = Date.now() + 1000;
    const query = http403ErrorPOST('message/sendlater/v1', {channelId: channel.channelId, message: 'hello', timeSent: timeSent}, user.token);
    expect(query).toEqual({error: {message: 'token passed in is invalid'}});
  });

  test('Tests if successful', () => {
    const timeSent = Math.floor((new Date()).getTime() / 1000) + 3000;
    const query = http200SuccessPOST('message/sendlater/v1', {channelId: channel.channelId, message: 'hello', timeSent: timeSent}, user.token);
    expect(query).toEqual({messageId: expect.any(Number)});
  });

  test('Tests if error on channelId does not refer to a valid channel', () => {
    const timeSent = Date.now() + 1000;
    const query = http400ErrorPOST('message/sendlater/v1', {channelId: channel.channelId + 1, message: 'hello', timeSent: timeSent}, user.token);
    expect(query).toEqual({error: {message: 'channelId does not refer to a valid channel'}});
  });

  test('Tests if length of message is less than 1', () => {
    const timeSent = Date.now() + 1000;
    const query = http400ErrorPOST('message/sendlater/v1', {channelId: channel.channelId, message: '', timeSent: timeSent}, user.token);
    expect(query).toEqual({error: {message: 'length of message is less than 1 or more than 1000 characters'}});
  });

  test('Tests if length of message is more than 1000 characters', () => {
    const message = 'hello'.repeat(2000);
    const timeSent = Date.now() + 1000;
    const query = http400ErrorPOST('message/sendlater/v1', {channelId: channel.channelId, message: message, timeSent: timeSent}, user.token);
    expect(query).toEqual({error: {message: 'length of message is less than 1 or more than 1000 characters'}});
  });

  test('Tests if timeSent is a time in the past', () => {
    const timeSent = Math.floor((new Date()).getTime() / 1000) - 1000;
    const query = http400ErrorPOST('message/sendlater/v1', {channelId: channel.channelId, message: 'hello', timeSent: timeSent}, user.token);
    expect(query).toEqual({error: {message: 'timeSent is a time in the past'}});
  });

  test('Tests if error on channelId is valid and the authorised user is not a member of the channel', () => {
    const timeSent = Date.now() - 1000;
    const query = http403ErrorPOST('message/sendlater/v1', {channelId: channel.channelId, message: 'hello', timeSent: timeSent}, user2.token);
    expect(query).toEqual({error: {message: 'channelId is valid and the authorised user is not a member of the channel'}});
  });

});

describe('HTTP tests for standup/active/v', () => {
  
  test('Tests if successful', () => {
    const query = http200SuccessGET('standup/active/v1', {channelId: channel.channelId}, user.token);
    expect(query).toEqual({isActive: expect.any(Boolean), timeFinish: null});
  });

  test('Tests if error on token passed in is invalid', () => {
    authLogoutPost('auth/logout/v2', {}, user.token);
    const query = http403ErrorGET('standup/active/v1', {channelId: channel.channelId}, user.token);
    expect(query).toEqual({error: {message: 'token passed in is invalid'}});
  });

  test('Tests if error on channelId does not refer to a valid channel', () => {
    const query = http400ErrorGET('standup/active/v1', {channelId: 2}, user.token);
    expect(query).toEqual({error: {message: 'channelId does not refer to a valid channel'}});
  });

  test('Tests if error on channelId is valid and the authorised user is not a member of the channel', () => {
    const query = http403ErrorGET('standup/active/v1', {channelId: channel.channelId}, user2.token);
    expect(query).toEqual({error: {message: 'channelId is valid and the authorised user is not a member of the channel'}});
  });

});

describe('HTTP tests for standup/start/v1', () => {
  
  test('Tests if successful', () => {
    const query = http200SuccessPOST('standup/start/v1', {channelId: channel.channelId, length: 5}, user.token);
    expect(query).toEqual({timeFinish: expect.any(Number)});
  });

  test('Tests if error on token passed in is invalid', () => {
    authLogoutPost('auth/logout/v2', {}, user.token);
    const query = http403ErrorPOST('standup/start/v1', {channelId: channel.channelId, length: 5}, user.token);
    expect(query).toEqual({error: {message: 'token passed in is invalid'}});
  });

  test('Tests if error on channelId does not refer to a valid channel', () => {
    const query = http400ErrorPOST('standup/start/v1', {channelId: 2, length: 5}, user.token);
    expect(query).toEqual({error: {message: 'channelId does not refer to a valid channel'}});
  });

  test('Tests if error on length is a negative integerl', () => {
    const query = http400ErrorPOST('standup/start/v1', {channelId: channel.channelId, length: -5}, user.token);
    expect(query).toEqual({error: {message: 'length is a negative integer'}});
  });

  test('Tests if error an active standUp is currently running in the channel', () => {
    http200SuccessPOST('standup/start/v1', {channelId: channel.channelId, length: 5}, user.token);
    const query = http400ErrorPOST('standup/start/v1', {channelId: channel.channelId, length: 5}, user.token);
    expect(query).toEqual({error: {message: 'an active standUp is currently running in the channel'}});
  });

  test('Tests if error on channelId is valid and the authorised user is not a member of the channel', () => {
    const query = http403ErrorPOST('standup/start/v1', {channelId: channel.channelId, length: 5}, user2.token);
    expect(query).toEqual({error: {message: 'channelId is valid and the authorised user is not a member of the channel'}});
  });

});

describe('HTTP tests for standup/send/v1', () => {
  
  test('Tests if successful', () => {
    http200SuccessPOST('standup/start/v1', {channelId: channel.channelId, length: 5}, user.token);
    const query = http200SuccessPOST('standup/send/v1', {channelId: channel.channelId, message: 'hi'}, user.token);
    expect(query).toEqual({});
  });

  test('Tests if error on token passed in is invalid', () => {
    authLogoutPost('auth/logout/v2', {}, user.token);
    const query = http403ErrorPOST('standup/send/v1', {channelId: channel.channelId, message: 'hi'}, user.token);
    expect(query).toEqual({error: {message: 'token passed in is invalid'}});
  });

  test('Tests if error on channelId does not refer to a valid channel', () => {
    const query = http400ErrorPOST('standup/send/v1', {channelId: 2, message: 'hi'}, user.token);
    expect(query).toEqual({error: {message: 'channelId does not refer to a valid channel'}});
  });

  test('Tests if error on length of message is over 1000 characters', () => {
    const query = http400ErrorPOST('standup/send/v1', {channelId: channel.channelId, message: 'hi'.repeat(1001)}, user.token);
    expect(query).toEqual({error: {message: 'length of message is over 1000 characters'}});
  });

  test('Tests if error on an active standup is not currently running in the channel', () => {
    const query = http400ErrorPOST('standup/send/v1', {channelId: channel.channelId, message: 'hi'}, user.token);
    expect(query).toEqual({error: {message: 'an active standup is not currently running in the channel'}});
  });
  test('Tests if error on channelId is valid and the authorised user is not a member of the channel', () => {
    http200SuccessPOST('standup/start/v1', {channelId: channel.channelId, length: 5}, user.token);
    const query = http403ErrorPOST('standup/send/v1', {channelId: channel.channelId, message: 'hi'}, user2.token);
    expect(query).toEqual({error: {message: 'channelId is valid and the authorised user is not a member of the channel'}});
  });

});

describe('HTTP tests for message/react/v1', () => {

  test('Tests for error when invalid messageId', () => {
    let message = messageSendV1Post('message/send/v2', {channelId: channel.channelId, message: 'hello'}, user.token);
    const query = http400ErrorPOST('message/react/v1', {messageId: message.messageId, reactId: message.reactId}, user2.token)
    expect(query).toEqual({error: {message: 'messageId does not refer to a valid message within a channel/DM that the authorised user has joined'}});
  });
  test('Tests for error when invalid reactId', () => {
    let message = messageSendV1Post('message/send/v2', {channelId: channel.channelId, message: 'hello'}, user.token);
    const query = http400ErrorPOST('message/react/v1', {messageId: message.messageId, reactId: 2}, user.token)
    expect(query).toEqual({error: {message: 'reactId is invalid'}});
  });
  test('Tests for error when reactId alrady exists on message', () => {
    let message = messageSendV1Post('message/send/v2', {channelId: channel.channelId, message: 'hello'}, user.token);
    const react = messageReactPOST('message/react/v1', {messageId: message.messageId, reactId: 1}, user.token)
    const query = http400ErrorPOST('message/react/v1', {messageId: message.messageId, reactId: 1}, user.token)
    expect(query).toEqual({error: {message: 'message already contains a react'}});
  });
  test('Tests for successfull react', () => {
    let message = messageSendV1Post('message/send/v2', {channelId: channel.channelId, message: 'hello'}, user.token);
    const react = messageReactPOST('message/react/v1', {messageId: message.messageId, reactId: 1}, user.token)
    expect(react).toEqual({});
  });
  test('Tests for error when invalid reactId in DMs', () => {
    const dm = dmCreatePost('dm/create/v2', {uIds: [user.authUserId, user3.authUserId]}, user2.token);
    let message =  messageSendDmV1Post('message/senddm/v2', {dmId: dm.dmId, message: 'hello'}, user2.token);
    const query = http400ErrorPOST('message/react/v1', {messageId: message.messageId, reactId: 2}, user2.token)
    expect(query).toEqual({error: {message: 'reactId is invalid'}});
  });
  test('Tests for error when reactId already exists on message in dms', () => {
    const dm = dmCreatePost('dm/create/v2', {uIds: [user.authUserId, user3.authUserId]}, user2.token);
    let message =  messageSendDmV1Post('message/senddm/v2', {dmId: dm.dmId, message: 'hello'}, user2.token);
    const react = messageReactPOST('message/react/v1', {messageId: message.messageId, reactId: 1}, user2.token)
    const query = http400ErrorPOST('message/react/v1', {messageId: message.messageId, reactId: 1}, user2.token)
    expect(query).toEqual({error: {message: 'message already contains a react'}});
  });
  test('Tests for successfull react', () => {
    const dm = dmCreatePost('dm/create/v2', {uIds: [user.authUserId, user3.authUserId]}, user2.token);
    let message =  messageSendDmV1Post('message/senddm/v2', {dmId: dm.dmId, message: 'hello'}, user2.token);
    const react = messageReactPOST('message/react/v1', {messageId: message.messageId, reactId: 1}, user2.token)
    expect(react).toEqual({});
  });
  test('Tests if error on token passed in is invalid', () => {
    let message = messageSendV1Post('message/send/v2', {channelId: channel.channelId, message: 'hello'}, user.token);
    authLogoutPost('auth/logout/v2', {}, user.token);
    const query = http403ErrorPOST('message/react/v1', {messageId: message.messageId, reactId: 1}, user.token);
    expect(query).toEqual({error: {message: 'token passed in is invalid'}});
  });

});

describe('HTTP tests for message/pin/v1', () => {

  test('Tests for error when invalid messageId', () => {
    let message = messageSendV1Post('message/send/v2', {channelId: channel.channelId, message: 'hello'}, user.token);
    const query = http400ErrorPOST('message/pin/v1', {messageId: message.messageId}, user2.token)
    expect(query).toEqual({error: {message: 'messageId does not refer to a valid message within a channel/DM that the authorised user has joined'}});
  });
  test('Tests for error when message is already pinned', () => {
    let message = messageSendV1Post('message/send/v2', {channelId: channel.channelId, message: 'hello'}, user.token);
    const pin = messagePinPOST('message/pin/v1', {messageId: message.messageId}, user.token)
    const query = http400ErrorPOST('message/pin/v1', {messageId: message.messageId}, user.token)
    expect(query).toEqual({error: {message: 'Message is already pinned'}});
  });
  test('The authorised user does not have owner permissions, and the message was not sent by them', () => {
    let message = messageSendV1Post('message/send/v2', {channelId: channel.channelId, message: 'hello'}, user.token);
    channelJoinV2Post('channel/join/v3', {channelId: channel.channelId}, user2.token);
    const query = http403ErrorPOST('message/pin/v1', {messageId: message.messageId}, user2.token)
    expect(query).toEqual({error: {message: 'The authorised user does not have owner permissions, and the message was not sent by them'}});
  });
  test('Tests for successfull pin', () => {
    let message = messageSendV1Post('message/send/v2', {channelId: channel.channelId, message: 'hello'}, user.token);
    const pin = messagePinPOST('message/pin/v1', {messageId: message.messageId}, user.token)
    expect(pin).toEqual({});
  });
  test('Tests for successfull pin on dms', () => {
    const dm = dmCreatePost('dm/create/v2', {uIds: [user.authUserId, user3.authUserId]}, user2.token);
    let message =  messageSendDmV1Post('message/senddm/v2', {dmId: dm.dmId, message: 'hello'}, user2.token);
    const pin = messagePinPOST('message/pin/v1', {messageId: message.messageId}, user2.token)
    expect(pin).toEqual({});
  });
  test('Tests for error when message is already pinned in dms', () => {
    const dm = dmCreatePost('dm/create/v2', {uIds: [user.authUserId, user3.authUserId]}, user2.token);
    let message =  messageSendDmV1Post('message/senddm/v2', {dmId: dm.dmId, message: 'hello'}, user2.token);
    const pin = messagePinPOST('message/pin/v1', {messageId: message.messageId}, user2.token)
    const query = http400ErrorPOST('message/pin/v1', {messageId: message.messageId}, user2.token)
    expect(query).toEqual({error: {message: 'Message is already pinned'}});
  });
  test('Tests if error on token passed in is invalid', () => {
    let message = messageSendV1Post('message/send/v2', {channelId: channel.channelId, message: 'hello'}, user.token);
    authLogoutPost('auth/logout/v2', {}, user.token);
    const query = http403ErrorPOST('message/pin/v1', {messageId: message.messageId}, user.token);
    expect(query).toEqual({error: {message: 'token passed in is invalid'}});
  });
   
});

describe('HTTP tests for message/unpin/v1', () => {

  test('Tests for error when invalid messageId', () => {
    let message = messageSendV1Post('message/send/v2', {channelId: channel.channelId, message: 'hello'}, user.token);
    const query = http400ErrorPOST('message/unpin/v1', {messageId: message.messageId}, user2.token)
    expect(query).toEqual({error: {message: 'messageId does not refer to a valid message within a channel/DM that the authorised user has joined'}});
  });
  test('Tests for error when message is already unpinned', () => {
    let message = messageSendV1Post('message/send/v2', {channelId: channel.channelId, message: 'hello'}, user.token);
    const pin = messagePinPOST('message/pin/v1', {messageId: message.messageId}, user.token)
    const unpin = messageUnpinPOST('message/unpin/v1', {messageId: message.messageId}, user.token)
    const query = http400ErrorPOST('message/unpin/v1', {messageId: message.messageId}, user.token)
    expect(query).toEqual({error: {message: 'Message is already unpinned'}});
  });
  test('Tests for successfull unpin', () => {
    let message = messageSendV1Post('message/send/v2', {channelId: channel.channelId, message: 'hello'}, user.token);
    const pin = messagePinPOST('message/pin/v1', {messageId: message.messageId}, user.token)
    const unpin = messageUnpinPOST('message/unpin/v1', {messageId: message.messageId}, user.token)
    expect(unpin).toEqual({});
  });
  test('The authorised user does not have owner permissions, and the message was not sent by them', () => {
    let message = messageSendV1Post('message/send/v2', {channelId: channel.channelId, message: 'hello'}, user.token);
    channelJoinV2Post('channel/join/v3', {channelId: channel.channelId}, user2.token);
    const pin = messagePinPOST('message/pin/v1', {messageId: message.messageId}, user.token)
    const query = http403ErrorPOST('message/unpin/v1', {messageId: message.messageId}, user2.token)
    expect(query).toEqual({error: {message: 'The authorised user does not have owner permissions, and the message was not sent by them'}});
  });
  test('Tests for successfull pin on dms', () => {
    const dm = dmCreatePost('dm/create/v2', {uIds: [user.authUserId, user3.authUserId]}, user2.token);
    let message =  messageSendDmV1Post('message/senddm/v2', {dmId: dm.dmId, message: 'hello'}, user2.token);
    const pin = messagePinPOST('message/pin/v1', {messageId: message.messageId}, user2.token)
    const unpin = messageUnpinPOST('message/unpin/v1', {messageId: message.messageId}, user2.token)
    expect(pin).toEqual({});
  });
  test('Tests for error when message is already pinned in dms', () => {
    const dm = dmCreatePost('dm/create/v2', {uIds: [user.authUserId, user3.authUserId]}, user2.token);
    let message =  messageSendDmV1Post('message/senddm/v2', {dmId: dm.dmId, message: 'hello'}, user2.token);
    const pin = messagePinPOST('message/pin/v1', {messageId: message.messageId}, user2.token)
    const unpin = messageUnpinPOST('message/unpin/v1', {messageId: message.messageId}, user2.token)
    const query = http400ErrorPOST('message/unpin/v1', {messageId: message.messageId}, user2.token)
    expect(query).toEqual({error: {message: 'Message is already unpinned'}});
  });
  test('Tests if error on token passed in is invalid', () => {
    let message = messageSendV1Post('message/send/v2', {channelId: channel.channelId, message: 'hello'}, user.token);
    authLogoutPost('auth/logout/v2', {}, user.token);
    const query = http403ErrorPOST('message/unpin/v1', {messageId: message.messageId}, user.token);
    expect(query).toEqual({error: {message: 'token passed in is invalid'}});
  });

});

describe('HTTP tests for message/unreact/v1', () => {

  test('Tests for error when invalid messageId', () => {
    let message = messageSendV1Post('message/send/v2', {channelId: channel.channelId, message: 'hello'}, user.token);
    const query = http400ErrorPOST('message/unreact/v1', {messageId: message.messageId, reactId: message.reactId}, user2.token)
    expect(query).toEqual({error: {message: 'messageId does not refer to a valid message within a channel/DM that the authorised user has joined'}});
  });
  test('Tests for error when invalid reactId', () => {
    let message = messageSendV1Post('message/send/v2', {channelId: channel.channelId, message: 'hello'}, user.token);
    const query = http400ErrorPOST('message/unreact/v1', {messageId: message.messageId, reactId: 2}, user.token)
    expect(query).toEqual({error: {message: 'reactId is invalid'}});
  });
  test('Tests for error when message does not contain anything to unreact', () => {
    let message = messageSendV1Post('message/send/v2', {channelId: channel.channelId, message: 'hello'}, user.token);
    const react = messageReactPOST('message/react/v1', {messageId: message.messageId, reactId: 1}, user.token)
    let unreact = messageUnreactPOST('message/unreact/v1', {messageId: message.messageId, reactId: 1}, user.token)
    const query = http400ErrorPOST('message/unreact/v1', {messageId: message.messageId, reactId: 1}, user.token)
    expect(query).toEqual({error: {message: 'message does not contains a react'}});
  });
  test('Tests for successfull unreact', () => {
    let message = messageSendV1Post('message/send/v2', {channelId: channel.channelId, message: 'hello'}, user.token);
    const react = messageUnreactPOST('message/unreact/v1', {messageId: message.messageId, reactId: 1}, user.token)
    expect(react).toEqual({});
  });
  
  test('Tests for error when invalid reactId in DMs', () => {
    const dm = dmCreatePost('dm/create/v2', {uIds: [user.authUserId, user3.authUserId]}, user2.token);
    let message =  messageSendDmV1Post('message/senddm/v2', {dmId: dm.dmId, message: 'hello'}, user2.token);
    const query = http400ErrorPOST('message/unreact/v1', {messageId: message.messageId, reactId: 2}, user2.token)
    expect(query).toEqual({error: {message: 'reactId is invalid'}});
  });
  test('Tests for error when reactId does not exists on message in dms', () => {
    const dm = dmCreatePost('dm/create/v2', {uIds: [user.authUserId, user3.authUserId]}, user2.token);
    let message =  messageSendDmV1Post('message/senddm/v2', {dmId: dm.dmId, message: 'hello'}, user2.token);
    const react = messageReactPOST('message/react/v1', {messageId: message.messageId, reactId: 1}, user2.token)
    let unreact = messageUnreactPOST('message/unreact/v1', {messageId: message.messageId, reactId: 1}, user2.token)
    const query = http400ErrorPOST('message/unreact/v1', {messageId: message.messageId, reactId: 1}, user2.token)
    expect(query).toEqual({error: {message: 'message does not contains a react'}});
  });
  test('Tests for successfull react', () => {
    const dm = dmCreatePost('dm/create/v2', {uIds: [user.authUserId, user3.authUserId]}, user2.token);
    let message =  messageSendDmV1Post('message/senddm/v2', {dmId: dm.dmId, message: 'hello'}, user2.token);
    const react = messageUnreactPOST('message/unreact/v1', {messageId: message.messageId, reactId: 1}, user2.token)
    expect(react).toEqual({});
  });
  test('Tests if error on token passed in is invalid', () => {
    let message = messageSendV1Post('message/send/v2', {channelId: channel.channelId, message: 'hello'}, user.token);
    authLogoutPost('auth/logout/v2', {}, user.token);
    const query = http403ErrorPOST('message/unreact/v1', {messageId: message.messageId, reactId: 1}, user.token);
    expect(query).toEqual({error: {message: 'token passed in is invalid'}});
  });
});

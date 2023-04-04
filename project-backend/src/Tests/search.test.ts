import {http403ErrorGET, http400ErrorGET, http200SuccessGET, http400ErrorPOST, http403ErrorPOST, http400ErrorDELETE, http403ErrorDELETE, http400ErrorPUT, http200SuccessPOST, authRegisterPost, authLogoutPost, channelJoinV2Post, channelsCreateV2Post, clearV1Delete, messageSendV1Post, messageSendDmV1Post, messageEditV1Put, messageRemoveV1Delete, dmCreatePost, errorMsg, http403ErrorPUT, channelMessagesGet, dmMessagesV1Get, searchV1GET } from './helperTest';
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
  channel = channelsCreateV2Post('channels/create/v3', {name: 'channel1', isPublic: true}, user.token);
});

describe('HTTP tests for search/v1', () => {
    test('Tests for error on query string length', () => {
      const query = http400ErrorGET('search/v1', {queryStr:''}, user.token )
      console.log(query);
      expect(query).toEqual({error: { message: 'length is less than 1 or over 1000 characters' }});
    }); 
    test('Tests for error on query string length', () => {
      let message = 'e'.repeat(1001);
      const query = http400ErrorGET('search/v1', {queryStr: message}, user.token )
      expect(query).toEqual({error: { message: 'length is less than 1 or over 1000 characters' }});
    }); 
    test('Tests for success', () => {
      const query = searchV1GET('search/v1', {queryStr: 'hellothere' }, user.token )
      expect(query).toEqual({messages: expect.any(Array)});
      });
    test('Tests if error on invalid token passed', () => {
      authLogoutPost('auth/logout/v2', {}, user.token);
      const query = http403ErrorGET('search/v1', {queryStr: 'hellothere'}, user.token);
      expect(query).toEqual({error: { message: 'token passed in is invalid' }});
      });
      
});
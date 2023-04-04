import { http403ErrorPOST, http400ErrorPOST, http403ErrorGET, authLogoutPost, authRegisterPost, channelsListAllV2Get, channelsListV3Get, channelsCreateV2Post, errorMsg, clearV1Delete } from './helperTest';
import { authUserId, channelId} from '../interfaces';

let user: authUserId;
let user2: authUserId;
let channel1: channelId;
let channel2: channelId;

beforeEach(() => {
  clearV1Delete('clear/v1');
  user = authRegisterPost('auth/register/v3', {
    email: 'johnsmith@gmail.com',
    password: 'Password6',
    nameFirst: 'John',
    nameLast: 'Smith',
  });
  user2 = authRegisterPost('auth/register/v3', {
    email: 'emmalee@gmail.com',
    password: 'Password7',
    nameFirst: 'Emma',
    nameLast: 'Lee',
  });
  channel1 = channelsCreateV2Post('channels/create/v3', {name: 'channel1', isPublic: true}, user.token);  
  channel2 = channelsCreateV2Post('channels/create/v3', {name: 'channel2', isPublic: true}, user.token);
})

describe('channelsListAllV3 function tests', () => {
  test('Tests channelsListAllV3 prints all channels created', () => {
    channelsCreateV2Post('channels/create/v3', {name: 'channel3', isPublic: true}, user.token);
    const query = channelsListAllV2Get('channels/listall/v3', {}, user.token);
    expect(query).toEqual({
      channels: [{
        channelId: 1,
        name: 'channel1',
      },
      {
        channelId: 2,
        name: 'channel2',
      },
      {
        channelId: 3,
        name: 'channel3',
      }]
    });
  });
  test.each([
    {expected: {channels: expect.any(Array)}},
    {expected: {channels: expect.any(Array)}},
  ])(`Testing uId: 1 returns an array of channels`, ({expected}) => {
    const query = channelsListAllV2Get('channels/listall/v3', {}, user.token);
    expect(query).toStrictEqual(expected);
  });
  test.each([
    {expected: { channels: expect.arrayContaining([expect.any(Object)]) } },
    {expected: { channels: expect.arrayContaining([expect.any(Object)]) } },
    {expected: { channels: expect.arrayContaining([expect.any(Object)]) } },
    {expected: { channels: expect.arrayContaining([expect.any(Object)]) } },
  ])(`Checking to see if array within Channels returned elements containing objects`, ({expected}) => {
    channelsCreateV2Post('channels/create/v3', {name: 'channel3', isPublic: true}, user.token);
    const query = channelsListAllV2Get('channels/listall/v3', {}, user.token);
    expect(query).toStrictEqual(
      expect.objectContaining(expected),
    )
  });
  test('Prints an empty array if no channels have been created', () => {
    clearV1Delete('clear/v1');
    user = authRegisterPost('auth/register/v3', {
      email: 'johnsmith@gmail.com',
      password: 'Password6',
      nameFirst: 'John',
      nameLast: 'Smith',
    });
    const query = channelsListAllV2Get('channels/listall/v3', {}, user.token);
    expect(query).toEqual({channels: []});
  });
  test.each([
    {expected: { channels: expect.arrayContaining([{ channelId: expect.any(Number), name: expect.any(String), }]) } },
    {expected: { channels: expect.arrayContaining([{ channelId: expect.any(Number), name: expect.any(String), }]) } },
    {expected: { channels: expect.arrayContaining([{ channelId: expect.any(Number), name: expect.any(String), }]) } },
    {expected: { channels: expect.arrayContaining([{ channelId: expect.any(Number), name: expect.any(String), }]) } },
  ])(`Checking if each object within Channels returns the correct keys and values for a channel`, ({ expected }) => {
    channelsCreateV2Post('channels/create/v3', {name: 'channel3', isPublic: true}, user.token);
    const query = channelsListAllV2Get('channels/listall/v3', {}, user.token);
    expect(query).toStrictEqual(
      expect.objectContaining(expected),
    );
  });
  test('Testing if token passed is invalid', () => {
    authLogoutPost('auth/logout/v2', {}, user.token);
    const query = http403ErrorGET('channels/listall/v3',{}, user.token);
    expect(query).toEqual({error: { message: 'token passed in is invalid' }}); 
  });
});

describe('channelsCreateV2 Function Tests', () => {
  test.each([
      { name: '', isPublic: true, expected: {error: { message: 'length of name is less than 1 or more than 20 characters' }} },
      { name: 'seanjoshishaandarrenprashant', isPublic: true, expected: {error: { message: 'length of name is less than 1 or more than 20 characters' }} },
  ])(`Testing for errors for when length of name is less than 1 or more than 20 characters `, ({ name, isPublic, expected }) => {
      const query = http400ErrorPOST('channels/create/v3', {name: name, isPublic: isPublic}, user.token);
      expect(query).toEqual(expected);
  });  
  test.each([
      { name: '1', isPublic: true, expected: { channelId: 3, } },
      { name: '12345678991234567899', isPublic: true, expected: { channelId: 3, } },
  ])(`Testing boundaries for when length of name is 1 or 20 characters `, ({ name, isPublic, expected }) => {
      const query = channelsCreateV2Post('channels/create/v3', {name: name, isPublic: isPublic}, user.token);
      expect(query).toEqual(expected);
  });
  test('Tests for duplicate channelIds', () => {
      channelsCreateV2Post('channels/create/v3',{name: 'channel1', isPublic: true}, user.token);
      const query2 = channelsCreateV2Post('channels/create/v3',{name: 'channel2', isPublic: true}, user.token);
      expect(query2).not.toEqual(channel2);
  });
  test('Testing if function is successful', () => {
      expect(channel1).toEqual({channelId: expect.any(Number)});
  });
  test('Testing if token passed is invalid', () => {
    authLogoutPost('auth/logout/v2', {}, user.token);
    const query = http403ErrorPOST('channels/create/v3',{name: 'channel3', isPublic: true}, user.token);
    expect(query).toEqual({error: { message: 'token passed in is invalid' }}); 
  });
});

describe('channelsListV3 Function Tests', () => {
  test('Tests channelsListV3 successful, user in 2 of 2 dms', () => {
    const query = channelsListV3Get('channels/list/v3', {}, user.token);
    expect(query).toEqual({channels: expect.any(Array)});
  })
  test('Tests channelsListV3 successful, user in 0 dms', () => {
    
    const query = channelsListV3Get('channels/list/v3', {}, user2.token);
    expect(query).toEqual({channels: []});
  })

})

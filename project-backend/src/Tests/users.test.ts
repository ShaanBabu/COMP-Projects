import { http400ErrorGET, http403ErrorGET, http400ErrorPUT, http403ErrorPUT, authLogoutPost, authRegisterPost, usersAllV1Get,channelsCreateV2Post, userProfileSetNameV1Put, clearV1Delete, userProfileV3Get,  userProfileSetEmailV1Put, userProfileSetHandleV1Put, errorMsg } from './helperTest';
import { authUserId, channelId } from '../interfaces';

let user: authUserId;
let channel: channelId;

beforeEach(() => {
  clearV1Delete('clear/v1');
  user = authRegisterPost('auth/register/v3', {
    email: 'johnsmith@gmail.com',
    password: 'Password6',
    nameFirst: 'John',
    nameLast: 'Smith',
  });
  channel = channelsCreateV2Post('channels/create/v3',{name: 'channel1', isPublic: true}, user.token);
});

describe('userProfileV3 function tests', () => {
    test('Tests if error on invalid token passed', () => {
      authLogoutPost('auth/logout/v2', {}, user.token);
      const query = http403ErrorGET('user/profile/v3', {uId: user.authUserId}, user.token);
      expect(query).toEqual({error: { message: 'token passed in is invalid' }});
    });
    test('Test for all conditions satisfied', () => {
      const query = userProfileV3Get('user/profile/v3', {uId: user.authUserId}, user.token);
      expect(query).toEqual({user: {uId: 1, handleStr: 'johnsmith', nameFirst: 'John', nameLast: 'Smith', email: 'johnsmith@gmail.com'}});
    });
    test('Test error', () => {
      const query = http400ErrorGET('user/profile/v3', {uId: user.authUserId+1}, user.token);
      expect(query).toEqual({error: {message: 'uId does not refer to a valid user'}});
    });
})

describe('Users/all/v2 function tests', () => {
  test('Test for all conditions satisfied', () => {
    const query = usersAllV1Get('users/all/v2', {}, user.token);
      expect(query).toEqual({ users: expect.any(Array)});
      expect(query).toEqual({
        users: [{
          uId: expect.any(Number),
          email: expect.any(String),
          nameFirst: expect.any(String),
          nameLast : expect.any(String),
          handleStr: expect.any(String)
        }]
      })      
  });
  test('Tests if error on invalid token passed', () => {
    authLogoutPost('auth/logout/v2', {}, user.token);
    const query = http403ErrorGET('users/all/v2', {}, user.token);
    expect(query).toEqual({error: { message: 'token passed in is invalid' }});
  });
})

describe('user/profile/setname/v2 function tests', () => {
  test('Tests for return of success', () => {
    const query = userProfileSetNameV1Put('user/profile/setname/v2', {nameFirst: 'Sean', nameLast: 'Guevara'}, user.token);
    expect(query).toEqual({});
  });
  test.each([
    { nameFirst: '', nameLast: 'guevara'  },
    { nameFirst: 'Johqwertyuiopasdfghjklzxcvbnm1234567890123456789012345', nameLast: 'guevara'  },
    { nameFirst: 'sean', nameLast: 'Johqwertyuiopasdfghjklzxcvbnm1234567890123456789012345' },
    { nameFirst: 'sean', nameLast: '' },
  ])('Testing for invalid name length which returns error', ({ nameFirst, nameLast }) => {
    const query = http400ErrorPUT('user/profile/setname/v2', {nameFirst: nameFirst, nameLast: nameLast}, user.token);
    expect(query).toEqual({error: { message: 'length of nameFirst or nameLast is not between 1 and 50 characters inclusive' }});
  });
  test('Tests if error on invalid token passed', () => {
    authLogoutPost('auth/logout/v2', {}, user.token);
    const query = http403ErrorPUT('user/profile/setname/v2', {}, user.token);
    expect(query).toEqual({error: { message: 'token passed in is invalid' }});
  });
  test('Tests if setName, changed users names via user/profile/v3', () => {
    userProfileSetNameV1Put('user/profile/setname/v2', {nameFirst: 'Smith', nameLast: 'John'}, user.token);
    const query = userProfileV3Get ('user/profile/v3', {uId: user.authUserId}, user.token);
    expect(query).toEqual({user: {uId: 1, handleStr: 'johnsmith', nameFirst: 'Smith', nameLast: 'John', email: 'johnsmith@gmail.com'}});
  });
});

describe('user/profile/setemail/v2 function tests', () => {
  test('Tests for success', () => {
    const query = userProfileSetEmailV1Put('user/profile/setemail/v2', {email: 'shaanbabu@gmail.com'}, user.token);
    expect(query).toEqual({});
  });
  test('Tests if setEmail, changed users email via user/profile/v3', () => {
    userProfileSetEmailV1Put('user/profile/setemail/v2', {email: 'shaanbabu@gmail.com'}, user.token);
    const query = userProfileV3Get ('user/profile/v3', {uId: user.authUserId}, user.token);
    expect(query).toEqual({user: {uId: 1, handleStr: 'johnsmith', nameFirst: 'John', nameLast: 'Smith', email: 'shaanbabu@gmail.com'}});
  });
  test('Tests if error on invalid token passed', () => {
    authLogoutPost('auth/logout/v2', {}, user.token);
    const query = http403ErrorPUT('user/profile/setemail/v2', {email: 'johnsmith@gmail.com'}, user.token);
    expect(query).toEqual({error: { message: 'token passed in is invalid' }});
  });
  test('user/profile/setemail/v2, invalid email address given', () => {
    const query = http400ErrorPUT('user/profile/setemail/v2', {email: 'johnsmithgmail.com'}, user.token);
    expect(query).toEqual({error: { message: 'email entered is not a valid email' }});
  });
  test('user/profile/setemail/v2, email address given already in use', () => {
    const query = http400ErrorPUT('user/profile/setemail/v2', {email: 'johnsmith@gmail.com'}, user.token);
    expect(query).toEqual({error: { message: 'email address is already being used by another user' }});
  });
});

describe('user/profile/sethandle/v2 function tests', () => {
  test('Tests for success', () => {
    const query = userProfileSetHandleV1Put('user/profile/sethandle/v2', {handleStr: 'shaanbabu' }, user.token);
    expect(query).toEqual({});
  });
  test('Tests if error on invalid token passed', () => {
    authLogoutPost('auth/logout/v2', {}, user.token);
    const query = http403ErrorPUT('user/profile/sethandle/v2', {handleStr: 'shaanbabu'}, user.token);
    expect(query).toEqual({error: { message: 'token passed in is invalid' }});
  });
  test('user/profile/sethandle/v2, handlStr is greater than 20', () => {
    const query = http400ErrorPUT('user/profile/sethandle/v2', {handleStr: 'abcdegfhsiumlsjthniguedssfqwf'}, user.token);
    expect(query).toEqual({error: { message: 'length is not between 3 to 20 characters' }});
  });
  test('user/profile/sethandle/v2, handlStr is non-alphanumeric', () => {
    const query = http400ErrorPUT('user/profile/sethandle/v2', {handleStr: '!hiel^&8m**'}, user.token);
    expect(query).toEqual({error: { message: 'handle contains characters that are not alphanumeric' }});
  });
  test('user/profile/sethandle/v2, handlStr is less than 3', () => {
    const query = http400ErrorPUT('user/profile/sethandle/v2', {handleStr: 'h'}, user.token);
    expect(query).toEqual({error: { message: 'length is not between 3 to 20 characters'}});
  });
  test('Tests if setHandle, changed users handle via user/profile/v3', () => {
    userProfileSetEmailV1Put('user/profile/sethandle/v2', {handleStr: 'shaanbabu'}, user.token);
    const query = userProfileV3Get ('user/profile/v3', {uId: user.authUserId}, user.token);
    expect(query).toEqual({user: {uId: 1, handleStr: 'shaanbabu', nameFirst: 'John', nameLast: 'Smith', email: 'johnsmith@gmail.com'}});
  });
});




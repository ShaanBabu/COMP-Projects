import {authRegisterPost, http400ErrorPOST, http200SuccessGET, http200SuccessPOST, authPasswordResetRequestPost, authLoginPost, authLogoutPost, errorMsg, clearV1Delete, userProfileV3Get, authPasswordResetPost } from './helperTest';
import { authUserId, error } from '../interfaces';



let query: authUserId;
let user2: authUserId;

beforeEach(() => {
    clearV1Delete('clear/v1');
    query = authRegisterPost('auth/register/v3', {
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
});

describe('HTTP tests for auth/register/v3', () => {
  test('Test successful auth/register/v3', () => {
    expect(query).toEqual({token: expect.any(String), authUserId: expect.any(Number)});
  });
  test.each([
    { email: 'test@gmail.com', password: 'password', nameFirst: '@bcdefgh!j', nameLast: 'klmn opqrst', expected: {token: expect.any(String), authUserId: expect.any(Number)}},
    { email: 'test@gmail.com', password: 'password', nameFirst: 'bcdefghj', nameLast: 'klmnopqrst', expected: {token: expect.any(String), authUserId: expect.any(Number)}},
    { email: 'test@gmail.com', password: 'password', nameFirst: 'abc', nameLast: 'def0', expected: {token: expect.any(String), authUserId: expect.any(Number)}},
    { email: 'test@gmail.com', password: 'password', nameFirst: 'abc', nameLast: 'def', expected:{token: expect.any(String), authUserId: expect.any(Number)}},
    { email: 'test@gmail.com', password: 'password', nameFirst: '@bcdefgh!j', nameLast: 'klmn opqrst', expected: {token: expect.any(String), authUserId: expect.any(Number)}},
    { email: 'test@gmail.com', password: 'password', nameFirst: 'bcdefghj', nameLast: 'klmnopqrst', expected: {token: expect.any(String), authUserId: expect.any(Number)}},
  ])(`Test for successful handleStr generation `, ({ email, password, nameFirst, nameLast, expected }) => {
      const query = authRegisterPost('auth/register/v3', {email: email, password: password, nameFirst: nameFirst, nameLast: nameLast});
      expect(query).toEqual(expected);
  });
  test('Test1 successful duplicate handleStr auth/register/v3', () => {
    authRegisterPost('auth/register/v3', {email: 'test@gmail.com', password: 'password', nameFirst: '@bcdefgh!j', nameLast: 'klmn opqrst'});
    const user4 = authRegisterPost('auth/register/v3', {email: 'test2@gmail.com', password: 'password', nameFirst: 'bcdefghj', nameLast: 'klmnopqrst'});
    const query = userProfileV3Get ('user/profile/v3', {uId: user4.authUserId}, user4.token);
    expect(query).toEqual({user: {uId: 4, handleStr: 'bcdefghjklmnopqrst0', nameFirst: 'bcdefghj', nameLast: 'klmnopqrst', email: 'test2@gmail.com'}});
  });

  test('Test2 successful duplicate handleStr auth/register/v3', () => {
    authRegisterPost('auth/register/v3', {email: 'test@gmail.com', password: 'password', nameFirst: 'abc', nameLast: 'def0'});
    const user4 = authRegisterPost('auth/register/v3', {email: 'test2@gmail.com', password: 'password', nameFirst: 'abc', nameLast: 'def'});
    const query = userProfileV3Get ('user/profile/v3', {uId: user4.authUserId}, user4.token);
    expect(query).toEqual({user: {uId: 4, handleStr: 'abcdef1', nameFirst: 'abc', nameLast: 'def', email: 'test2@gmail.com'}});
  });

  test('Test error for auth/register/v3, invalid email address given', () => {
    query = http400ErrorPOST('auth/register/v3', {
      email: 'johnsmithgmail.com',
      password: 'Password6',
      nameFirst: 'John',
      nameLast: 'Smith',
    });
    expect(query).toEqual({error: { message: 'email entered is not a valid email' }});
  });
  test('Test error for auth/register/v3 for duplicate email address', () => {
    query = http400ErrorPOST('auth/register/v3', {
      email: 'johnsmith@gmail.com',
      password: 'Password6',
      nameFirst: 'John',
      nameLast: 'Smith',
    });
    expect(query).toEqual({error: { message: 'email address is already being used by another user' }});
  });
  test('Test error for auth/register/v3 for password < 6 characters', () => {
    query = http400ErrorPOST('auth/register/v3', {
      email: 'seansmith@gmail.com',
      password: 'Pass',
      nameFirst: 'Sean',
      nameLast: 'Smith',
    });
    expect(query).toEqual({error: { message: 'length of password is less than 6 characters' }});
  });
  test('Test error for auth/register/v3 for invalid firstname', () => {
    query = http400ErrorPOST('auth/register/v3', {
      email: 'seansmith@gmail.com',
      password: 'Password',
      nameFirst: 'Johqwertyuiopasdfghjklzxcvbnm1234567890123456789012345',
      nameLast: 'Smith',
    });
    expect(query).toEqual({error: { message: 'length of nameFirst is not between 1 and 50 characters inclusive' }});
  });
  test('Test error for auth/register/v3, nameLast is less than 1 character', () => {
    query = http400ErrorPOST('auth/register/v3', {
      email: 'seansmith@gmail.com',
      password: 'Password',
      nameFirst: 'Sean',
      nameLast: '',
    });
    expect(query).toEqual({error: { message: 'length of nameLast is not between 1 and 50 characters inclusive' }});
  });
});

describe('HTTP tests for auth/login/v3', () => {
  test('Test successful auth/login/v3', () => {
    const query2 = authLoginPost('auth/login/v3', {
      email: 'johnsmith@gmail.com',
      password: 'Password6',
    });
    expect(query2).toEqual({token: expect.any(String), authUserId: expect.any(Number)});
  });
  test('Test error auth/login/v3, email does not belong to a user', () => {
    const query2 = http400ErrorPOST('auth/login/v3', {
      email: 'john@gmail.com',
      password: 'Password6',
    });
    expect(query2).toEqual({error: { message: 'Email does not belong to a user' }});
  });
  test('Test error auth/login/v3, incorrect password', () => {
    const query2 = http400ErrorPOST('auth/login/v3', {
      email: 'johnsmith@gmail.com',
      password: 'Password',
    });
    expect(query2).toEqual({error: { message: 'Incorrect password' }});
  });
  test('Test successful auth/login/v3', () => {
    const query2 = authLoginPost('auth/login/v3', {
      email: 'emmalee@gmail.com',
      password: 'Password7',
    });
    expect(query2).toEqual({token: expect.any(String), authUserId: expect.any(Number)});
  });
  test('Test error auth/login/v3, email does not belong to a user', () => {
    const query2 = http400ErrorPOST('auth/login/v3', {
      email: 'emma@gmail.com',
      password: 'Password7',
    });
    expect(query2).toEqual({error: { message: 'Email does not belong to a user' }});
  });
  test('Test error auth/login/v3, incorrect password', () => {
    const query = http400ErrorPOST('auth/login/v3', {
      email: 'emmalee@gmail.com',
      password: 'Password',
    });
    expect(query).toEqual({error: { message: 'Incorrect password' }});
  });
})

describe('HTTP tests for auth/logout/v2', () => {
  test('Test successful auth/logout/v2', () => {
    const query2 = authLogoutPost('auth/logout/v2', {}, user2.token);
    expect(query2).toEqual({});
  });
})

describe('HTTP tests for authPasswordResetRequest', () => {
  test('Test success of auth/passwordreset/request/v1', () => {
    authRegisterPost('auth/register/v3', {
      email: 'comp1531.aero@gmail.com',
      password: 'Password6',
      nameFirst: 'John',
      nameLast: 'Smith',
    });
    const query = authPasswordResetRequestPost('auth/passwordreset/request/v1', {email: 'comp1531.aero@gmail.com'});
    expect(query).toEqual({});
  });
})

describe('HTTP tests for authPasswordReset', () => {
  test('Test success of auth/passwordreset/reset/v1', () => {
    authPasswordResetRequestPost('auth/passwordreset/request/v1', {email: 'emmalee@gmail.com' });
    const data = http200SuccessGET('data', {}, user2.token);
    const query= http200SuccessPOST('auth/passwordreset/reset/v1', {resetCode: data.users[user2.authUserId - 1].resetTempCode, newPassword: 'password'}, user2.token);
    expect(query).toEqual({});
  });

  test('Test error of password entered is less than 6 characters long', () => {
    authPasswordResetRequestPost('auth/passwordreset/request/v1', {email: 'emmalee@gmail.com' });
    const data = http200SuccessGET('data', {}, user2.token);
    const query= http400ErrorPOST('auth/passwordreset/reset/v1', {resetCode: data.users[user2.authUserId - 1].resetTempCode, newPassword: 'passw'}, user2.token);
    expect(query).toEqual({error: { message: 'password entered is less than 6 characters long' }});
  });

  test('Test error of invalid resetCode', () => {
    authPasswordResetRequestPost('auth/passwordreset/request/v1', {email: 'emmalee@gmail.com' });
    const query= http400ErrorPOST('auth/passwordreset/reset/v1', {resetCode: 2000, newPassword: 'password'}, user2.token);
    expect(query).toEqual({error: { message: 'invalid reset code' }});
  });
})

export { authRegisterPost, authLoginPost, authLogoutPost };
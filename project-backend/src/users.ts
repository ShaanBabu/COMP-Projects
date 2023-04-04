import { getData, setData } from './dataStore';
import { error, usersArrayInfo, userInfo } from './interfaces';
import { findUser, usersListFilter, nameCheck } from './helper';
import validator from 'validator';
import HTTPError from 'http-errors';

/**
 * @description For a valid user, returns information about their userId, email, first name, last name, and handle.
 * @param {string} token - represents users Id session
 * @param {number} uId - represents user Id, obtaining information.
 * @returns {object<{user: {uId: number, email: string, nameFirst: string, nameLast: string, handleStr: string}}>} - success
 * @returns {object<{error: string}>} - Invalid token passed
 * @returns {object<{error: string}>} - uId does not refer to a valid user
 */
function userProfileV3(token: string, uId: number): userInfo | error {
  const data = getData();
  const user = findUser(token);
  if (user === undefined) {
    throw HTTPError(403, 'token passed in is invalid');
  }
  for (const user of data.users) {
    if (uId === user.uId) {
      const person = {
        uId: uId,
        email: user.email,
        nameFirst: user.nameFirst,
        nameLast: user.nameLast,
        handleStr: user.handleStr
      };
      return { user: person };
    }
  }
  throw HTTPError(400, 'uId does not refer to a valid user');
}

/**
 * @description Returns an array of all users and their associated details.
 * @param {string} token - represents users Id session
 * @returns {object<{users: Array{uId: number, email: string, nameFirst: string, nameLast: string, handleStr: string,}}>}
 * @returns {object<{error: string}>} - Invalid token passed
 */
function usersAllV2 (token: string): usersArrayInfo | error {
  const data = getData();
  return (findUser(token) === undefined) ? (function() { throw HTTPError(403, 'token passed in is invalid'); }()) : { users: data.users.map(usersListFilter) };
}

/**
 * @description Update the authorised user's first and last name
 * @param {string} token - represents users Id session
 * @param {string} nameFirst - Users first name
 * @param {string} nameLast - Users last name
 * @returns {object<{}>} - success
 * @returns {object<{error: string}>} - when the token passed in is invalid
 */
function userProfileSetNameV2 (token: string, nameFirst: string, nameLast: string): object | error {
  const data = getData();
  const user = findUser(token);
  if (user === undefined) {
    throw HTTPError(403, 'token passed in is invalid');
  } else if (nameCheck(nameFirst, nameLast) === 1) {
    throw HTTPError(400, 'length of nameFirst or nameLast is not between 1 and 50 characters inclusive');
  }
  user.nameFirst = nameFirst;
  user.nameLast = nameLast;
  setData(data);
  return {};
}

/**
 * @description Update the authorised user's email address
 * @param {string} token - represents users Id session
 * @param {string} email - users new email address
 * @returns {object<{}>} - success
 * @returns {object<{error: string}>} - when the token passed in is invalid
 * @returns {object<{error: string}>} - email entered is not a valid email
 * @returns {object<{error: string}>} - email address is already being used by another user
 */
function userProfileSetEmailV2 (token: string, email: string) {
  const data = getData();
  const lowercaseEmail = email.toLocaleLowerCase();
  const user = findUser(token);

  if (user === undefined) {
    throw HTTPError(403, 'token passed in is invalid');
  } else if (validator.isEmail(lowercaseEmail) === false) {
    throw HTTPError(400, 'email entered is not a valid email');
  }
  for (const user of data.users) {
    if (lowercaseEmail === user.email) {
      throw HTTPError(400, 'email address is already being used by another user');
    }
  }
  user.email = lowercaseEmail;
  setData(data);

  return {};
}

/**
 * @description Update the authorised user's handle (i.e. display name)
 * @param {string} token - represents users Id session
 * @param {string} handleStr - represents users new handleStr
 * @returns {object<{}>} - success
 * @returns {object<{error: string}>} - when the token passed in is invalid
 * @returns {object<{error: string}>} - length of handleStr is not between 3 and 20 characters inclusive
 * @returns {object<{error: string}>} - handleStr contains characters that are not alphanumeric
 * @returns {object<{error: string}>} - the handle is already used by another user
 */
function userProfileSetHandleV1 (token : string, handleStr: string) {
  const user = findUser(token);
  const data = getData();

  if (user === undefined) {
    throw HTTPError(403, 'token passed in is invalid');
  } else if (handleStr.length > 20 || handleStr.length < 3) {
    throw HTTPError(400, 'length is not between 3 to 20 characters');
  }
  for (const user of data.users) {
    if (handleStr === user.handleStr) {
      throw HTTPError(400, 'handle is already used by another user');
    }
  }
  if (handleStr.match(/[^0-9a-z]/i)) {
    throw HTTPError(400, 'handle contains characters that are not alphanumeric');
  }
  user.handleStr = handleStr;
  setData(data);
  return {};
}

export { userProfileV3, usersAllV2, userProfileSetNameV2, userProfileSetHandleV1, userProfileSetEmailV2 };

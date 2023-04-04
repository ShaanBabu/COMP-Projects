import { getData } from './dataStore';
import { findUser } from './helper';
import HTTPError from 'http-errors';

/**
 * @description Given a user's first and last name, email address, and password, create a new account
 * for them, logs them in and returns a token, and authUserId.
 * @param {string} email - Users email address
 * @param {string} password - Users password
 * @param {string} nameFirst - Users first name
 * @param {string} nameLast - Users last name
 * @returns {object<{token: string, authUserId: number}>} - success
 * @returns {object<{error: string}>} - user has not provided a valid email address
 * @returns {object<{error: string}>} - email address provided has already been registered
 * @returns {object<{error: string}>} - password provided is less than 6 characters
 * @returns {object<{error: string}>} - nameFirst or nameLast is less than 1 character or greater than 50
 */
function adminUserPermissionChangeV1(token: string, uId: number, permissionId: number): any {
  const data = getData();
  const userAdmin = findUser(token);
  const userTarget = data.users[uId - 1];
  let numGlobalOwner = 0;
  if (userAdmin === undefined) {
    throw HTTPError(403, 'token passed in is invalid');
  }

  if (userAdmin.permissionId !== 1) {
    throw HTTPError(403, 'user is not a global owner');
  }
  if (userTarget === undefined) {
    throw HTTPError(400, 'invalid user id entered');
  }

  if (userTarget.permissionId === 1) {
    for (const user of data.users) {
      if (user.permissionId === 1) {
        numGlobalOwner = numGlobalOwner + 1;
      }
    }
    if (numGlobalOwner === 1) {
      throw HTTPError(400, 'user is the only global owner');
    }
  }
  let validPermId = false;
  if (permissionId === 1 || permissionId === 2) {
    validPermId = true;
  }
  if (validPermId === false) {
    throw HTTPError(400, 'invalid permission id entered');
  }
  if (permissionId === userTarget.permissionId) {
    throw HTTPError(400, 'user already has the requested permission level');
  }
  if (permissionId === 1) {
    userTarget.permissionId = 1;
  }
  if (permissionId === 2) {
    userTarget.permissionId = 2;
  }
  return ({});
}

export { adminUserPermissionChangeV1 };

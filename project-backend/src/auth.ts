import { getData, setData } from './dataStore';
import { authUserId, error } from './interfaces';
import { createHandleStr, createToken, getHashOf, secret } from './helper';
import validator from 'validator';
import HTTPError from 'http-errors';
import nodemailer from 'nodemailer';

const errorMsg = { error: 'error' };

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
function authRegisterV3(email: string, password: string, nameFirst: string, nameLast: string): authUserId | error {
  const data = getData();
  const userId = data.users.length + 1;
  const lowercaseEmail = email.toLocaleLowerCase();
  let handleStr = nameFirst.toLocaleLowerCase() + nameLast.toLocaleLowerCase();

  for (const user of data.users) {
    if (lowercaseEmail === user.email) {
      throw HTTPError(400, 'email address is already being used by another user');
    }
  }
  if (validator.isEmail(lowercaseEmail) === false) {
    throw HTTPError(400, 'email entered is not a valid email');
  } else if (password.length < 6) {
    throw HTTPError(400, 'length of password is less than 6 characters');
  } else if (nameFirst.length < 1 || nameFirst.length > 50) {
    throw HTTPError(400, 'length of nameFirst is not between 1 and 50 characters inclusive');
  } else if (nameLast.length < 1 || nameLast.length > 50) {
    throw HTTPError(400, 'length of nameLast is not between 1 and 50 characters inclusive');
  }

  handleStr = createHandleStr(handleStr);

  let permissionId;
  (userId === 1) ? permissionId = 1 : permissionId = 2;

  const token = createToken();

  data.users.push({
    uId: userId,
    handleStr: handleStr,
    nameFirst: nameFirst,
    nameLast: nameLast,
    email: lowercaseEmail,
    password: getHashOf(password),
    permissionId: permissionId,
    userSessions: [{ token: getHashOf(token + secret) }],
    notifications: [],
    resetTempCode: null,
  });
  setData(data);
  return {
    token: token,
    authUserId: userId,
  };
}

/**
 * @description Creates a user. Given a user's email address, and password, return their authuserId and session token.
 * Logs a user into their account.
 * @param {string} email - Users email address
 * @param {string} password - Users password
 * @returns {object<{token: string, authUserId: number}>} - success
 * @returns {object<{error: string}>} - user has not provided a registered email
 * @returns {object<{error: string}>} - correct email address but incorrect password
 */
function authLoginV3(email: string, password: string): authUserId | error {
  const data = getData();
  let emailCorrect = false;
  let passwordCorrect = false;
  let user;

  for (const userInfo of data.users) {
    if (userInfo.email === email) {
      emailCorrect = true;
      if (userInfo.password === getHashOf(password)) {
        passwordCorrect = true;
        user = userInfo;
      }
    }
  }
  if (emailCorrect === false) {
    throw HTTPError(400, 'Email does not belong to a user');
  } else if (passwordCorrect === false) {
    throw HTTPError(400, 'Incorrect password');
  } else {
    const token = createToken();
    user.userSessions.push({ token: getHashOf(token + secret) });
    return {
      token: token,
      authUserId: user.uId
    };
  }
}

/**
 * @description Invalidates user token
 * @param {string} token - User session
 * @returns {Object<{}>} - success
 */

function authLogoutV2(token: string) {
  const data = getData();
  for (const user of data.users) {
    for (const session of user.userSessions) {
      if (session.token === getHashOf(token + secret)) {
        session.token = '';
      }
    }
  }
  setData(data);
  return ({});
}

function authPasswordResetRequest(email: string) {
  const data = getData();
  const user = data.users.find(user => user.email === email);
  const adminEmail = 'comp1531.aero@gmail.com';
  const adminEmailPass = 'kcaibnqijducmxwf';
  const resetCode = createToken();
  if (user === undefined) {
    return {};
  }
  user.resetTempCode = resetCode;
  setData(data);
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    auth: {
      user: `${adminEmail}`,
      pass: `${adminEmailPass}`,
    }
  });
  transporter.sendMail({
    from: `${adminEmail}`,
    to: `${user.email}`,
    subject: 'Treats: Password Reset Request',
    text: `Please use code ${resetCode}, to reset your password.`
  });
  return {};
}

function authPasswordReset(resetCode: string, newPassword: string) {
  const data = getData();
  let flag = 0;

  for (const user of data.users) {
    if (user.resetTempCode === resetCode) {
      user.password = getHashOf(newPassword);
      resetCode = null;
      flag = 1;
    }
  }
  if (flag === 0) {
    throw HTTPError(400, 'invalid reset code');
  } else if (newPassword.length < 6) {
    throw HTTPError(400, 'password entered is less than 6 characters long');
  }

  setData(data);
  return {};
}

export { authLoginV3, authRegisterV3, authLogoutV2, errorMsg, authPasswordResetRequest, authPasswordReset };

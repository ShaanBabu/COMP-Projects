import { getData } from './dataStore';
import { channel, user, dm } from './interfaces';
import fs from 'fs';
import crypto from 'crypto';

const secret = 'H13A_AERO';
/**
 * @description writes all data in getData() to persistentData.json as a string
 */
function dataPersist () {
  const data = getData();
  fs.writeFileSync('src/persistentData.json', JSON.stringify(data), { flag: 'w' });
}

/**
 * @description A handle is generated that is the concatenation of their casted-to-lowercase alphanumeric (a-z0-9)
 * first name and last name (i.e. make lowercase then remove non-alphanumeric characters). If the concatenation is longer
 * than 20 characters, it is cut off at 20 characters. Once you've concatenated it, if the handle is once again taken,
 * append the concatenated names with the smallest number (starting from 0) that forms a new handle that isn't already taken.
 * The addition of this final number may result in the handle exceeding the 20 character limit (the handle 'abcdefghijklmnopqrst0'
 *  is allowed if the handle 'abcdefghijklmnopqrst' is already taken).
 * @param {string} handleStr - handleStr provided
 * @returns {string<handleStr>} - returns a handleStr based on the requirements to avoid duplicates.
 */
function createHandleStr(handleStr: string) {
  const data = getData();
  const removeCharacters = /[^A-Za-z0-9]/g;
  handleStr = handleStr.replace(removeCharacters, '');

  if (handleStr.length > 20) {
    handleStr = handleStr.slice(0, 19);
  }

  let handleStrExist = 0;
  let handleIncrement = -1;
  for (const user of data.users) {
    if (user.handleStr.includes(handleStr) === true && user.handleStr.length === handleStr.length) {
      handleStrExist = 1;
      handleIncrement++;
    } else if (user.handleStr.includes(handleStr) === true && user.handleStr.length > handleStr.length) {
      handleStrExist = 1;
      handleIncrement = parseInt(user.handleStr.slice(-1)) + 1;
    } else if (user.handleStr.includes(handleStr) === true) {
      handleStrExist = 1;
      handleIncrement++;
    }
  }
  if (handleStrExist === 1) {
    handleStr += handleIncrement;
  }

  return handleStr;
}

/**
 * @description Finds user in data.users based off their token
 * @param {string} token - represents users Id session
 * @returns {object<{user}>} - success
 */
function findUser(token: string) {
  const data = getData();
  for (const user of data.users) {
    for (const session of user.userSessions) {
      if (session.token === getHashOf(token + secret)) {
        return user;
      }
    }
  }
}

function getHashOf(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}
/**
 * @description Finds dm in data.dm based off their dmId
 * @param {number} dmId - represents Id of dm
 * @returns {Object<{dm}>} - success
 */
function findDm(dmId: number) {
  const data = getData();
  for (const dm of data.dms) {
    if (dm.dmId === dmId) {
      return dm;
    }
  }
}

/**
 * @description Finds handle in data.users based off their uId
 * @param {number} uId - represents users Id
 * @returns {string<{user.handleStr}>}  - success
 */
function uIdToHandle(uId: number) {
  const data = getData();
  for (const user of data.users) {
    if (user.uId === uId) {
      return user.handleStr;
    }
  }
}

/**
 * @description Creates a token for user sessions.  Provides a random number and converts it to a string.
 * @returns {string} - success
 */
function createToken (): string {
  return Math.floor((Math.random() * 10000) + 1).toString();
}

/**
 * @description returns a list of all channels with their channelId and channel name.
 * @param {channel} channel - provides all information relating to a channel
 * @returns {Array<{channelId: number, name: string}>} - success
 */
function channelsListFilter (channel: channel) {
  return { channelId: channel.channelId, name: channel.name };
}

/**
 * @param {object} user - provides a user object in data.users
 * @returns returns uId, email, nameFirst, nameLast and handleStr for all users.
 */
function usersListFilter (user: user) {
  if (user.uId > 0) {
    return { uId: user.uId, email: user.email, nameFirst: user.nameFirst, nameLast: user.nameLast, handleStr: user.handleStr };
  }
}
/**
 * @description checks if name is valid
 * @param {string} nameFirst - Users first name
 * @param {string} nameLast - Users last name
 * @returns {number} - returns 1 if name is invalid and 0 if OK.
 */
function nameCheck(nameFirst: string, nameLast: string): number {
  let nameError = 0;
  if (nameFirst.length < 1 || nameLast.length < 1) {
    nameError = 1;
    return nameError;
  } else if (nameFirst.length > 50 || nameLast.length > 50) {
    nameError = 1;
    return nameError;
  }
  return nameError;
}
/**
 * @description finds the next available message Id
 * @param {object} data - provides access to the dataStore so we can access channels and dms array
 * @returns {number<messageId>} - success
 */
function nextMessageId(channels: channel[], dms: dm[]): number {
  let messageId = 1;
  for (const channel of channels) {
    messageId += channel.messages.length;
  }
  for (const dm of dms) {
    messageId += dm.messages.length;
  }
  return messageId;
}
/**
 * @description checks to see if user is listed as a member of a channel or dm
 * @param {array} allMembers - an array of objects which lists users that are member of a channel or dm
 * @param {object} user - object of user, containing all details related to a user
 * @returns {number<userDmMember>} - success
 */
function userMemberCheck(memberList: user[], user: user): number {
  let userIsMember = 0;
  for (const member of memberList) {
    if (user.uId === member.uId) {
      userIsMember = 1;
    }
  }
  return userIsMember;
}

function findMessage(channels: channel[], dms: dm[], messageId: number) {
  let desiredChannelMessage;
  let desiredDmMessage;

  for (const channel of channels) {
    desiredChannelMessage = channel.messages.find(message => message.messageId === messageId);
    if (desiredChannelMessage !== undefined) {
      return channel;
    }
  }
  for (const dm of dms) {
    desiredDmMessage = dm.messages.find(message => message.messageId === messageId);
    if (desiredDmMessage !== undefined) {
      return dm;
    }
  }
  return undefined;
}

function timeNow() {
  return Math.floor((new Date()).getTime() / 1000);
}

export {
  createHandleStr,
  findUser,
  createToken,
  getHashOf,
  secret,
  dataPersist,
  channelsListFilter,
  usersListFilter,
  nameCheck,
  findDm,
  uIdToHandle,
  nextMessageId,
  userMemberCheck,
  findMessage,
  timeNow
};

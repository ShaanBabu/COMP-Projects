import { getData, setData } from './dataStore';
import { findUser, uIdToHandle, findDm, userMemberCheck } from './helper';
import { error, dmId } from './interfaces';
import HTTPError from 'http-errors';

/**
 * @description contains the user(s) that this DM is directed to, and will not include the creator.
 *  The creator is the owner of the DM. name should be automatically generated based on the users that are in this DM.
 *  The name should be an alphabetically-sorted, comma-and-space-separated array of user handles,
 *  e.g. 'ahandle1, bhandle2, chandle3'.
 * @param {string} token - represents users Id session
 * @param {number[]} uIds - an array of userId's for which will be added to the DM.
 * @returns {object<{dmId: number}>}  - success
 * @returns {object<{error: string}>} - returns error on invalid token passed
 * @returns {object<{error: string}>} - returns error on when any uId passed does not refer to a valid user
 * @returns {object<{error: string}>} - returns error when duplicate uId's are passed
 */
function dmCreateV2(token: string, uIds: number[]): dmId | error {
  const data = getData();

  let creatorUserId;

  // Checks if valid creator token
  if (findUser(token) === undefined) {
    throw HTTPError(403, 'token passed in is invalid');
  } else {
    creatorUserId = findUser(token).uId;
  }

  // Checks for duplicate uIds
  const uniqueUids = uIds.filter(function(user, index) {
    return uIds.indexOf(user) === index;
  });
  if (uniqueUids.length !== uIds.length) {
    throw HTTPError(400, 'There are duplicate users invited');
  }
  // Checks if uIds are valid
  for (const userId of uIds) {
    let valid = false;
    if (userId === creatorUserId) {
      throw HTTPError(400, 'The uIds contain an invalid user');
    }
    for (const validUser of data.users) {
      if (userId === validUser.uId) {
        valid = true;
      }
    }
    if (valid === false) {
      throw HTTPError(400, 'The uIds contain an invalid user');
    }
  }

  const dmId = data.dms.length + 1;
  const names = uIds.map((iD) => uIdToHandle(iD));
  names.push(uIdToHandle(creatorUserId));
  names.sort((a, b) => a.localeCompare(b));
  for (let i = 1; i < names.length; i++) {
    names[i] = ' ' + names[i];
  }
  const namesList = names.toString();

  const members = [];
  for (const uId of uIds) {
    members.push({
      uId: uId,
      email: data.users[uId - 1].email,
      nameFirst: data.users[uId - 1].nameFirst,
      nameLast: data.users[uId - 1].nameLast,
      handleStr: data.users[uId - 1].handleStr,
    });
  }
  const user = findUser(token);
  const owner = {
    uId: user.uId,
    email: user.email,
    nameFirst: user.nameFirst,
    nameLast: user.nameLast,
    handleStr: user.handleStr,
  };
  members.push(owner);

  data.dms.push({
    dmId: dmId,
    name: namesList,
    isPublic: false,
    ownerMembers: [owner],
    allMembers: members,
    messages: [],
  });
  setData(data);
  return {
    dmId: dmId
  };
}
/**
 * @description Given a DM with ID dmId that the authorised user is a member of, provide basic details about the DM.
 * @param {string} token - represents users Id session
 * @param {number} dmId - represents dm's Id.
 * @returns {object<{name: string, members: {uId: number, email: string, nameFirst: string, nameLast: string, handleStr: string}[]}>} - success
 * @returns {object<{error: string}>} - error on invalid token passed
 * @returns {object<{error: string}>} - dmId does not refer to a valid DM
 * @returns {object<{error: string}>} - dmId is valid and the authorised user is not a member of the DM
 */
function dmDetailV2 (token: string, dmId: number) {
  const data = getData();
  if (findUser(token) === undefined) {
    throw HTTPError(403, 'token passed in is invalid');
  }

  let validDmId = false;
  for (const dm of data.dms) {
    if (dm.dmId === dmId) {
      validDmId = true;
    }
  }
  if (validDmId === false) {
    throw HTTPError(400, 'The ID does not refer to a valid DM');
  }
  const dm = findDm(dmId);
  const userId = findUser(token).uId;
  let validUser = false;

  for (const member of dm.allMembers) {
    if (userId === member.uId) {
      validUser = true;
    }
  }
  if (validUser === false) {
    throw HTTPError(403, 'The user is not a member of this DM');
  }

  return {
    name: dm.name,
    members: dm.allMembers
  };
}
/**
 * @description Finds all DMs a given user is apart of
 * @param {string} token - represents users Id session
 * @returns {object<{}>} - success
 */
function dmListV2 (token: string) {
  const data = getData();
  if (findUser(token) === undefined) {
    throw HTTPError(403, 'token passed in is invalid');
  }

  const userId = findUser(token).uId;
  const dmList = [];

  for (const dm of data.dms) {
    for (const member of dm.allMembers) {
      if (member.uId === userId) {
        dmList.push({ dmId: dm.dmId, name: dm.name });
      }
    }
  }
  return ({ dms: dmList });
}
/**
 * @description Remove an existing DM, so all members are no longer in the DM. This can only be done by the original creator of the DM.
 * @param {string} token - represents users Id session
 * @param {number} dmId - represents dm's Id.
 * @returns {object<{}>} - success
 * @returns {object<{error: string}>} - error on invalid token passed
 * @returns {object<{error: string}>} - dmId does not refer to a valid DM
 * @returns {object<{error: string}>} - dmId is valid and the authorised user is not the original DM creator
 * @returns {object<{error: string}>} - dmId is valid and the authorised user is no longer in the DM
 */
function dmRemoveV2 (token: string, dmId: number) {
  const data = getData();
  let validDmId = false;
  let dmAccessed;
  const userId = findUser(token).uId;
  if (userId === undefined) {
    throw HTTPError(403, 'token passed in is invalid');
  }

  for (const dm of data.dms) {
    if (dm.dmId === dmId) {
      validDmId = true;
      dmAccessed = dm;
    }
  }
  if (validDmId === false) {
    throw HTTPError(400, 'DM entered is invalid');
  } else if (dmAccessed.ownerMembers === []) {
    throw HTTPError(403, 'Invalid user permissions');
  } else if (userMemberCheck(dmAccessed.allMembers, findUser(token)) === 0) {
    throw HTTPError(403, 'Invalid user permissions');
  } else if (dmAccessed.ownerMembers[0].uId !== userId) {
    throw HTTPError(403, 'Invalid user permissions');
  }
  dmAccessed.allMembers = [];
  setData(data);
  return {};
}
/**
 * @description Given a DM ID, the user is removed as a member of this DM.
 * The creator is allowed to leave and the DM will still exist if this happens.
 * This does not update the name of the DM.
 * @param {string} token - represents users Id session
 * @param {number} dmId - represents dm's Id.
 * @returns {object<{}>} - success
 * @returns {object<{error: string}>} - error on invalid token passed
 * @returns {object<{error: string}>} - dmId does not refer to a valid DM
 * @returns {object<{error: string}>} - dmId is valid and the authorised user is not a member of the DM
 */
function dmLeaveV2(token: string, dmId: number): object | error {
  const data = getData();
  const user = findUser(token);
  const dm = data.dms[dmId - 1];
  if (user === undefined) {
    throw HTTPError(403, 'token passed in is invalid');
  } else if (dm === undefined) {
    throw HTTPError(400, 'dmId does not refer to a valid DM');
  } else if (userMemberCheck(dm.allMembers, user) === 0) {
    throw HTTPError(403, 'dmId is valid and the authorised user is not a member of the DM');
  }
  if (dm.ownerMembers[0].uId === user.uId) {
    dm.ownerMembers.pop();
  }
  const index = dm.allMembers.findIndex(member => {
    return member.uId === user.uId;
  });
  dm.allMembers.splice(index, 1);
  setData(data);
  return {};
}

/**
 * @description Given a DM with ID dmId that the authorised user is a member of, return up to 50 messages
 * between index "start" and "start + 50". Message with index 0 is the most recent message in the DM.
 * This function returns a new index "end" which is the value of "start + 50", or, if this function has
 * returned the least recent messages in the DM, returns -1 in "end" to indicate there are no more messages
 * to load after this return.
 * @param {string} token -  represents users Id session
 * @param {number} dmId - represents dm's Id.
 * @param {number} start - represents index of where messages should start displaying from
 * @returns {object<{messages: {messageId: number, uId: number, message: string, timeSent: number}[], start: number, end: number}>} - success
 * @returns {object<{error: string}>} - error on invalid token passed
 * @returns {object<{error: string}>} - dmId does not refer to a valid DM
 * @returns {object<{error: string}>} - start is greater than the total number of messages in the channel
 * @returns {object<{error: string}>} - dmId is valid and the authorised user is not a member of the DM
 */
function dmMessagesV2(token: string, dmId: number, start: number) {
  const data = getData();
  const user = findUser(token);
  const dm = data.dms[dmId - 1];

  if (user === undefined) {
    throw HTTPError(403, 'token passed in is invalid');
  } else if (dm === undefined) {
    throw HTTPError(400, 'dmId does not refer to a valid DM');
  } else if (start > dm.messages.length) {
    throw HTTPError(400, 'start is greater than the total number of messages in the channel');
  } else if (userMemberCheck(dm.allMembers, user) === 0) {
    throw HTTPError(403, 'dmId is valid and the authorised user is not a member of the DM');
  }

  let end;
  if (dm.messages[start + 50] === undefined) {
    end = -1;
  } else {
    end = start + 50;
  }
  let messages;
  (end === -1) ? messages = dm.messages.slice(start) : messages = dm.messages.slice(start, end);
  return {
    messages: messages.map(message => ({ messageId: message.messageId, uId: message.uId, message: message.message, timeSent: message.timeSent })).reverse(),
    start: start,
    end: end
  };
}

export { dmCreateV2, dmDetailV2, dmListV2, dmRemoveV2, dmLeaveV2, dmMessagesV2 };

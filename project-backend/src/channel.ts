import { getData, setData } from './dataStore';
import { error, channelDetails } from './interfaces';
import { findUser, userMemberCheck } from './helper';
import HTTPError from 'http-errors';

/**
 * @description Given a channel with ID channelId that the authorised user is a member of,
 * return up to 50 messages between index "start" and "start + 50".
 * @param {string} token - represents users Id session
 * @param {number} channelId - represents the channel Id.
 * @param {number} start - index of where messages should be given
 * @returns {object<{ messages: object, start: number, end: number }>} - success
 * @returns {object<{error: string}>} - when the token passed in is invalid
 * @returns {object<{error: string}>} - channelId does not refer to a valid channel
 * @returns {object<{error: string}>} - start is greater than the total number of messages in the channel
 * @returns {object<{error: string}>} - channelId is valid and the authorised user is not a member of the channel
 */
function channelMessagesV3(token: string, channelId: number, start: number) {
  const data = getData();
  let end = -1;
  let channelExists = 0;
  const user = findUser(token);
  let flag = 0;
  if (user === undefined) {
    throw HTTPError(403, 'token passed in is invalid');
  }
  for (const channel of data.channels) {
    if (channel.channelId === channelId) {
      channelExists = 1;
    }
  }
  if (channelExists === 0) {
    throw HTTPError(400, 'channelId does not refer to a valid channel');
  }
  for (const member of data.channels[channelId - 1].allMembers) {
    if (user.uId === member.uId) {
      flag = 1;
    }
  }
  if (flag === 0) {
    throw HTTPError(403, 'authorised user is not a member of the channel');
  }
  for (let i = 0; i < data.channels.length; i++) {
    if (start > data.channels[i].messages.length) {
      throw HTTPError(400, 'start is greater than the total number of messages in channel');
    }
  }
  const messages = data.channels[channelId - 1].messages;
  const messagesReturned = [];

  if (start + 50 > messages.length) {
    end = -1;
    for (let i = start; i < messages.length; i++) {
      messagesReturned.push(messages[i]);
    }
  } else {
    end = start + 50;
    for (let i = start; i < start + 50; i++) {
      messagesReturned.push(messages[i]);
    }
  }
  return { messages: messagesReturned.reverse(), start: start, end: end };
}

/**
 * @description Given a channel with ID channelId that the authorised user is a member of, provide basic details about the channel.
 * @param {string} token - represents users Id session
 * @param {number} channelId - represents the channel Id.
 * @returns {object<{name: string, isPublic: boolean, ownerMembers: array, allMembers: array} []} - success
 * @returns {object<{error: string}>} - when the token passed in is invalid
 * @returns {object<{error: string}>} - channelId does not refer to a valid channel
 * @returns {object<{error: string}>} - channelId is valid and the authorised user is not a member of the channel
 */
function channelDetailsV3(token: string, channelId: number): channelDetails | error {
  const data = getData();
  const user = findUser(token);
  const channel = data.channels[channelId - 1];

  if (user === undefined) {
    throw HTTPError(403, 'token passed in is invalid');
  } else if (channel === undefined) {
    throw HTTPError(400, 'channelId does not refer to a valid channel');
  } else if (userMemberCheck(channel.allMembers, user) === 0) {
    throw HTTPError(403, 'channelId is valid and the authorised user is not a member of the channel');
  }

  return { name: channel.name, isPublic: channel.isPublic, ownerMembers: channel.ownerMembers, allMembers: channel.allMembers };
}

/**
 * @description Given a channelId of a channel that the authorised user can join, adds them to that channel.
 * @param {string} token - represents users Id session
 * @param {number} channelId - represents the channel Id.
 * @returns {object <{error : error}>} - channelId does not refer to a valid channel
 * @returns {object<{error: error}>} - authorised user is already a member of the channel
 * @returns {object<{error: error}>} - channelId refers to a private channel and authorised user is not already a channel member and isn't a global owner
 * @returns {object<{{}}>} - successfully passed
 *
 */
function ChannelJoinV3(token: string, channelId: number): object | Error {
  const data = getData();
  const user = findUser(token);

  if (user === undefined) {
    throw HTTPError(403, 'token passed in is invalid');
  }

  if (data.channels[channelId - 1] === undefined) {
    throw HTTPError(400, 'channelId does not refer to a valid channel');
  }

  for (const member of data.channels[channelId - 1].allMembers) {
    if (user.uId === member.uId) {
      throw HTTPError(400, 'the authorised user is already a member of the channel');
    }
  }

  if (data.channels[channelId - 1].isPublic === false && user.permissionId === 2) {
    throw HTTPError(403, 'channelId refers to a channel that is private and the authorised user is not already a channel member and is not a global owner');
  }

  const userData = {
    uId: user.uId,
    email: user.email,
    nameFirst: user.nameFirst,
    nameLast: user.nameLast,
    handleStr: user.handleStr,
  };

  data.channels[channelId - 1].allMembers.push(userData);
  setData(data);
  return {};
}

/**
 * @description Make user with user id uId an owner of the channel.
 * @param {string} token - represents users Id session
 * @param {number} channelId - represents the channel Id.
 * @param {number} uId - represents the user who is being added as an owner.
 * @returns {object<{}>} - success
 * @returns {object<{error: string}>} - when the token passed in is invalid
 * @returns {object<{error: string}>} - channelId does not refer to a valid channel
 * @returns {object<{error: string}>} - uId does not refer to a valid user
 * @returns {object<{error: string}>} - uId refers to a user who is not a member of the channel
 * @returns {object<{error: string}>} - uId refers to a user who is already an owner of the channel
 * @returns {object<{error: string}>} - channelId is valid and the authorised user does not have owner permissions in the channel
 */
function channelAddOwnerV2(token: string, channelId: number, uId: number): object | Error {
  const data = getData();
  const user = findUser(token);

  const channel = data.channels[channelId - 1];

  if (user === undefined) {
    throw HTTPError(403, 'token passed in is invalid');
  } else if (data.channels[channelId - 1] === undefined) {
    throw HTTPError(400, 'channelId does not refer to a valid channel');
  } else if (data.users[uId - 1] === undefined) {
    throw HTTPError(400, 'uId does not refer to a valid user');
  } else if (userMemberCheck(channel.allMembers, data.users[uId - 1]) === 0) {
    throw HTTPError(400, 'uId refers to a user who is not a member of the channel');
  } else if (userMemberCheck(channel.ownerMembers, data.users[uId - 1]) === 1) {
    throw HTTPError(400, 'uId refers to a user who is already an owner of the channel');
  } else if (userMemberCheck(channel.ownerMembers, user) === 0 && user.permissionId === 2) {
    throw HTTPError(403, 'channelId is valid and the authorised user does not have owner permissions in the channel');
  }

  const newOwner = data.users[uId - 1];
  channel.ownerMembers.push({
    uId: uId,
    email: newOwner.email,
    nameFirst: newOwner.nameFirst,
    nameLast: newOwner.nameLast,
    handleStr: newOwner.handleStr
  });
  return {};
}

/**
 * @description Invites a user with ID uId to join a channel with ID channelId.
 * Once invited, the user is added to the channel immediately.
 * In both public and private channels, all members are able to invite users.
 * @param {string} token - represents users Id session
 * @param {number} channelId - represents the channel Id.
 * @param {number} uId  - represents userId of person being invited
 * @returns {object<{}>} - success
 * @returns {object<{error: string}>} - when the token passed in is invalid
 * @returns {object<{error: string}>} - channelId does not refer to a valid channel
 * @returns {object<{error: string}>} - uId does not refer to a valid user
 * @returns {object<{error: string}>} - uId refers to a user who is already a member of the channel
 * @returns {object<{error: string}>} - channelId is valid and the authorised user is not a member of the channel
 */

function channelInviteV2(token: string, channelId: number, uId: number) {
  const data = getData();
  const checkUser = findUser(token);
  const channel = data.channels[channelId - 1];

  if (checkUser === undefined) {
    throw HTTPError(403, 'token passed in is invalid');
  }

  if (data.channels[channelId - 1] === undefined) {
    throw HTTPError(400, 'incorrect channelId');
  } else if (data.users[uId - 1] === undefined) {
    throw HTTPError(400, 'uId does not refer to a valid user');
  } else if (userMemberCheck(channel.allMembers, data.users[uId - 1]) === 1) {
    throw HTTPError(400, 'uId refers to a user who is already a member of channel');
  } else if (userMemberCheck(channel.allMembers, checkUser) === 0) {
    throw HTTPError(403, 'not a member of channel');
  }

  const userInfo = {
    uId: uId,
    nameFirst: data.users[uId - 1].nameFirst,
    nameLast: data.users[uId - 1].nameLast,
    email: data.users[uId - 1].email,
    handleStr: data.users[uId - 1].handleStr,
  };

  channel.allMembers.push(userInfo);
  setData(data);

  return {};
}

/**
 * @description Given a channel with ID channelId that the authorised user is a member of, remove them as a member of the channel.
 * Their messages should remain in the channel. If the only channel owner leaves, the channel will remain.
 * @param {string} token - represents users Id session
 * @param {number} channelId - represents the channel Id.
 * @returns {object<{}>} - success
 * @returns {object<{error: string}>} - when the token passed in is invalid
 * @returns {object<{error: string}>} - channelId does not refer to a valid channel
 * @returns {object<{error: string}>} - channelId is valid and the authorised user is not a member of the channel
 */
function channelLeaveV2(token: string, channelId: number): object | error {
  const data = getData();
  const user = findUser(token);
  const channel = data.channels[channelId - 1];

  if (user === undefined) {
    throw HTTPError(403, 'token passed in is invalid');
  } else if (channel === undefined) {
    throw HTTPError(400, 'channelId does not refer to a valid channel');
  } else if (channel.standUp.starterUserId === user.uId) {
    throw HTTPError(400, 'the authorised user is the starter of an active standup in the channel');
  } else if (userMemberCheck(channel.allMembers, user) === 0) {
    throw HTTPError(403, 'channelId is valid and the authorised user is not a member of the channel');
  }
  const ownerIndex = channel.ownerMembers.findIndex(owner => owner.uId === user.uId);
  channel.ownerMembers.splice(ownerIndex, 1);
  const memberIndex = channel.allMembers.findIndex(member => member.uId === user.uId);
  channel.allMembers.splice(memberIndex, 1);
  setData(data);
  return {};
}

/**
 * @description Remove user with user id uId as an owner of the channel.
 * @param {string} token - represents users Id session
 * @param {number} channelId - represents the channel Id.
 * @param {number} uId - represents the user who is being removed as an owner.
 * @returns {object<{}>} - success
 * @returns {object<{error: string}>} - when the token passed in is invalid
 * @returns {object<{error: string}>} - channelId does not refer to a valid channel
 * @returns {object<{error: string}>} - uId does not refer to a valid user
 * @returns {object<{error: string}>} - uId refers to a user who is not an owner of the channel
 * @returns {object<{error: string}>} - uId refers to a user who is currently the only owner of the channel
 * @returns {object<{error: string}>} - channelId is valid and the authorised user does not have owner permissions in the channel
 */
function channelRemoveOwnerV2 (token: string, channelId: number, uId: number) {
  const data = getData();
  const authUserId = findUser(token);
  const channel = data.channels[channelId - 1];
  const ownerToRemove = data.users[uId - 1];

  if (authUserId === undefined) {
    throw HTTPError(403, 'token passed in is invalid');
  } else if (channel === undefined) {
    throw HTTPError(400, 'channelId does not refer to a valid channel');
  } else if (ownerToRemove === undefined) {
    throw HTTPError(400, 'uId does not refer to a valid user');
  } else if (userMemberCheck(channel.ownerMembers, ownerToRemove) === 0) {
    throw HTTPError(400, 'uId refers to a user who is not an owner of the channel');
  } else if (channel.ownerMembers.length === 1) {
    throw HTTPError(400, 'uId refers to a user who is currently the only owner of the channel');
  } else if (authUserId.permissionId === 2 && userMemberCheck(channel.ownerMembers, authUserId) === 0) {
    throw HTTPError(403, 'channelId is valid and the authorised user does not have owner permissions in the channel');
  }
  const ownerIndex = channel.ownerMembers.findIndex(owner => owner.uId === ownerToRemove.uId);
  channel.ownerMembers.splice(ownerIndex, 1);
  setData(data);
  return {};
}

export { channelMessagesV3, channelInviteV2, channelDetailsV3, ChannelJoinV3, channelLeaveV2, channelAddOwnerV2, channelRemoveOwnerV2 };

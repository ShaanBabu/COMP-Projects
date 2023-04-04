import { getData, setData } from './dataStore';
import { findUser, userMemberCheck, nextMessageId, findMessage, timeNow } from './helper';
import { error, messageId } from './interfaces';
import HTTPError from 'http-errors';
let allStandUpMsgs = [] as string[];

/**
 * @description Send a message from the authorised user to the channel specified by channelId. Note: Each message should have its own unique ID,
 * i.e. no messages should share an ID with another message, even if that other message is in a different channel.
 * @param {string} token - represents users Id session
 * @param {number} channelId - represents the channelId, the user is sending a message in
 * @param {string} message - the message the user is sending
 * @returns {object<{messageId: number}>} - success
 * @returns {object<{error: string}>} - invalid token given
 * @returns {object<{error: string}>} - invalid channelId given
 * @returns {object<{error: string}>} - invalid message passed due to length of message
 */
function messageSendV2 (token: string, channelId: number, message: string): messageId | error {
  const data = getData();
  const user = findUser(token);
  const channel = data.channels[channelId - 1];

  if (user === undefined) {
    throw HTTPError(403, 'token passed in is invalid');
  } else if (channel === undefined) {
    throw HTTPError(400, 'channelId does not refer to a valid channel');
  } else if (message.length < 1 || message.length > 1000) {
    throw HTTPError(400, 'length of message is less than 1 or over 1000 characters');
  } else if (userMemberCheck(channel.allMembers, user) === 0) {
    throw HTTPError(403, 'channelId is valid and the authorised user is not a member of the channel');
  }
  const messageId = nextMessageId(data.channels, data.dms);
  allStandUpMsgs = [];
  channel.messages.push({
    messageId: messageId,
    uId: user.uId,
    message: message,
    timeSent: timeNow(),
    reacts: [],
    isPinned: false,
  });

  setData(data);
  return { messageId: messageId };
}
/**
 * @description Send a message from authorisedUser to the DM specified by dmId. Note: Each message should have it's own unique ID,
 * i.e. no messages should share an ID with another message, even if that other message is in a different channel or DM.
 * @param {string} token - represents users Id session
 * @param {number} dmId - represents the channelId, the user is sending a message in
 * @param {string} message - the message the user is sending
 * @returns {<object{messageId: number}>} - Id of the message sent
 * @returns {object<{error: string}>} - dmId does not refer to a valid DM
 * @returns {object<{error: string}>} - length of message is less than 1 or over 1000 characters
 * @returns {object<{error: string}>} - dmId is valid and the authorised user is not a member of the DM
 * @returns {object<{error: string}>} - invalid token given
 */
function messageSendDmV2 (token: string, dmId: number, message: string) {
  const data = getData();
  const user = findUser(token);
  if (user === undefined) {
    throw HTTPError(403, 'token passed in is invalid');
  } else if (data.dms[dmId - 1] === undefined) {
    throw HTTPError(400, 'dmId does not refer to a valid DM');
  } else if (message.length < 1 || message.length > 1000) {
    throw HTTPError(400, 'length of message is less than 1 or over 1000 characters');
  } else if (userMemberCheck(data.dms[dmId - 1].allMembers, user) === 0) {
    throw HTTPError(403, 'dmId is valid and the authorised user is not a member of the DM');
  }

  const messageId = nextMessageId(data.channels, data.dms);
  data.dms[dmId - 1].messages.push({
    messageId: messageId,
    uId: user.uId,
    message: message,
    timeSent: Math.floor((new Date()).getTime() / 1000),
    reacts: [],
    isPinned: false,
  });
  setData(data);

  return { messageId: messageId };
}
/**
 * @description Given a message, update its text with new text. If the new message is an empty string, the message is deleted.
 * @param {string} token - represents users Id session
 * @param {number} messageId - represents message Id
 * @param {string} message - editted message
 * @returns {object<{}>} - success
 * @returns {object<{error: string}>} - invalid token given
 * @returns {object<{error: string}>} - length of message is over 1000 characters
 * @returns {object<{error: string}>} - messageId does not refer to a valid message within a channel/DM that the authorised user has joined
 * @returns {object<{error: string}>} - If the authorised user does not have owner permissions, and the message was not sent by them
 */
function messageEditV2 (token: string, messageId: number, message: string) {
  const data = getData();
  const user = findUser(token);
  const channelOrDmMsgLocated = findMessage(data.channels, data.dms, messageId);

  if (user === undefined) {
    throw HTTPError(403, 'token passed in is invalid');
  } else if (message.length > 1000) {
    throw HTTPError(400, 'length of message is over 1000 characters');
  } else if (channelOrDmMsgLocated === undefined || userMemberCheck(channelOrDmMsgLocated.allMembers, user) === 0) {
    throw HTTPError(400, 'messageId does not refer to a valid message within a channel/DM that the authorised user has joined');
  }

  const messageToBeEdited = channelOrDmMsgLocated.messages.find(message => message.messageId === messageId);

  if (user.permissionId !== 1 && messageToBeEdited.uId !== user.uId && userMemberCheck(channelOrDmMsgLocated.ownerMembers, user) === 0) {
    throw HTTPError(403, 'If the authorised user does not have owner permissions, and the message was not sent by them');
  }

  (message === '') ? messageRemoveV2(token, messageId) : messageToBeEdited.message = message;
  setData(data);

  return {};
}

/**
 * @description Given a messageId for a message, this message is removed from the channel/DM
 * @param {string} token - represents users Id session
 * @param {number} messageId - represents message Id
 * @returns {object<{}>} - success
 * @returns {object<{error: string}>} - invalid token given
 * @returns {object<{error: string}>} - messageId does not refer to a valid message within a channel/DM that the authorised user has joined
 * @returns {object<{error: string}>} - the message was not sent by the authorised user making this request & the authorised user does not have owner permissions in the channel/DM
 */
function messageRemoveV2(token: string, messageId: number) {
  const data = getData();
  const user = findUser(token);
  const channelOrDmMsgLocated = findMessage(data.channels, data.dms, messageId);

  if (user === undefined) {
    throw HTTPError(403, 'token passed in is invalid');
  } else if (channelOrDmMsgLocated === undefined || userMemberCheck(channelOrDmMsgLocated.allMembers, user) === 0) {
    throw HTTPError(400, 'messageId does not refer to a valid message within a channel/DM that the authorised user has joined');
  }

  const messageToBeRemoved = channelOrDmMsgLocated.messages.find(message => message.messageId === messageId);
  const indexOfMessage = channelOrDmMsgLocated.messages.findIndex(message => (message.messageId === messageId));

  if (user.permissionId !== 1 && messageToBeRemoved.uId !== user.uId && userMemberCheck(channelOrDmMsgLocated.ownerMembers, user) === 0) {
    throw HTTPError(403, 'If the authorised user does not have owner permissions, and the message was not sent by them');
  }

  channelOrDmMsgLocated.messages.splice(indexOfMessage, 1);

  setData(data);

  return {};
}

function messageSendLaterDm (token: string, dmId: number, message: string, timeSent: number) {
  const data = getData();
  const user = findUser(token);
  const dm = data.dms[dmId - 1];

  if (user === undefined) {
    throw HTTPError(403, 'token passed in is invalid');
  } else if (dm === undefined) {
    throw HTTPError(400, 'dmId does not refer to a valid DM');
  } else if (message.length < 1 || message.length > 1000) {
    throw HTTPError(400, 'length of message is less than 1 or over 1000 characters');
  } else if (timeSent < Math.floor((new Date()).getTime() / 1000)) {
    throw HTTPError(400, 'timeSent is a time in the past');
  } else if (userMemberCheck(dm.allMembers, user) === 0) {
    throw HTTPError(403, 'dmId is valid and the authorised user is not a member of the DM they are trying to post to');
  }
  const messageId = nextMessageId(data.channels, data.dms);
  const timeMsgToSend = timeSent - Math.floor((new Date()).getTime() / 1000);
  setTimeout(function () {
    dm.messages.push({
      messageId: messageId,
      uId: user.uId,
      message: message,
      timeSent: timeSent,
      reacts: [],
      isPinned: false,
    });
  }, timeMsgToSend);

  setData(data);

  return { messageId: messageId };
}

function messageSendLater(token: string, channelId: number, message: string, timeSent: number) {
  const data = getData();
  const user = findUser(token);
  const channel = data.channels[channelId - 1];

  if (user === undefined) {
    throw HTTPError(403, 'token passed in is invalid');
  } else if (channel === undefined) {
    throw HTTPError(400, 'channelId does not refer to a valid channel');
  } else if (message.length < 1 || message.length > 1000) {
    throw HTTPError(400, 'length of message is less than 1 or more than 1000 characters');
  } else if (timeSent < Math.floor((new Date()).getTime() / 1000)) {
    throw HTTPError(400, 'timeSent is a time in the past');
  } else if (userMemberCheck(channel.allMembers, user) === 0) {
    throw HTTPError(403, 'channelId is valid and the authorised user is not a member of the channel');
  }
  const messageId = nextMessageId(data.channels, data.dms);
  const timeMsgToSend = timeSent - Math.floor((new Date()).getTime() / 1000);
  setTimeout(function () {
    channel.messages.push({
      messageId: messageId,
      uId: user.uId,
      message: message,
      timeSent: timeSent,
      reacts: [],
      isPinned: false,
    });
  }, timeMsgToSend);

  setData(data);

  return { messageId: messageId };
}

/**
 * @param {string} token - represents users Id session
 * @param {number} channelId - represents the channel Id.
 * @returns {object<{isActive: boolean, timeFinish: number}>} - success
 * @returns {object<{error: string}>} - token passed in is invalid
 * @returns {object<{error: string}>} - channelId does not refer to a valid channel
 * @returns {object<{error: string}>} - channelId is valid and the authorised user is not a member of the channel
 */
function standUpActive(token: string, channelId: number) {
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

  return { isActive: channel.standUp.isActive, timeFinish: channel.standUp.timeFinish };
}

function standUpStart(token: string, channelId: number, length: number) {
  const data = getData();
  const user = findUser(token);
  const channel = data.channels[channelId - 1];

  if (user === undefined) {
    throw HTTPError(403, 'token passed in is invalid');
  } else if (channel === undefined) {
    throw HTTPError(400, 'channelId does not refer to a valid channel');
  } else if (length < 0) {
    throw HTTPError(400, 'length is a negative integer');
  } else if (channel.standUp.isActive === true) {
    throw HTTPError(400, 'an active standUp is currently running in the channel');
  } else if (userMemberCheck(channel.allMembers, user) === 0) {
    throw HTTPError(403, 'channelId is valid and the authorised user is not a member of the channel');
  }

  channel.standUp.isActive = true;
  channel.standUp.timeFinish = timeNow() + length;
  channel.standUp.starterUserId = user.uId;

  setTimeout(function() {
    if (allStandUpMsgs.length !== 0) {
      const standUpMsg = allStandUpMsgs.join('\n');
      messageSendV2(token, channelId, standUpMsg);
    }
    channel.standUp.isActive = false;
    channel.standUp.timeFinish = null;
    channel.standUp.starterUserId = null;
    setData(data);
  }, length * 1000);

  setData(data);
  return { timeFinish: channel.standUp.timeFinish };
}

function standUpSend(token: string, channelId: number, message:string) {
  const data = getData();
  const user = findUser(token);
  const channel = data.channels[channelId - 1];

  if (user === undefined) {
    throw HTTPError(403, 'token passed in is invalid');
  } else if (channel === undefined) {
    throw HTTPError(400, 'channelId does not refer to a valid channel');
  } else if (message.length > 1000) {
    throw HTTPError(400, 'length of message is over 1000 characters');
  } else if (channel.standUp.isActive === false) {
    throw HTTPError(400, 'an active standup is not currently running in the channel');
  } else if (userMemberCheck(channel.allMembers, user) === 0) {
    throw HTTPError(403, 'channelId is valid and the authorised user is not a member of the channel');
  }

  allStandUpMsgs.push(`${user.handleStr}: ${message}`);

  setData(data);
  return {};
}

function messageReact(token: string, messageId: number, reactId: number) {
  const data = getData();
  const user = findUser(token);
  const channelOrDmMsgLocated = findMessage(data.channels, data.dms, messageId);

  if (user === undefined) {
    throw HTTPError(403, 'token passed in is invalid');
  } else if (channelOrDmMsgLocated === undefined || userMemberCheck(channelOrDmMsgLocated.allMembers, user) === 0) {
    throw HTTPError(400, 'messageId does not refer to a valid message within a channel/DM that the authorised user has joined');
  }

  if (reactId !== 1) {
    throw HTTPError(400, 'reactId is invalid');
  }

  const messageToReact = channelOrDmMsgLocated.messages.find(message => message.messageId === messageId);
  let reactFound = false;

  for (const react of messageToReact.reacts) {
    if (react.reactId === reactId) {
      reactFound = true;
      if (react.isThisUserReacted) {
        throw HTTPError(400, 'message already contains a react');
      } else {
        react.isThisUserReacted = true;
        react.uIds.push({ uId: user.uId });
      }
    }
  }
  if (!reactFound) {
    messageToReact.reacts.push({
      reactId: reactId,
      uIds: [{ uId: user.uId }],
      isThisUserReacted: true,
    });
  }
  setData(data);

  return {};
}

function messagePin(token: string, messageId: number) {
  const data = getData();
  const user = findUser(token);
  const channelOrDmMsgLocated = findMessage(data.channels, data.dms, messageId);

  if (user === undefined) {
    throw HTTPError(403, 'token passed in is invalid');
  } else if (channelOrDmMsgLocated === undefined || userMemberCheck(channelOrDmMsgLocated.allMembers, user) === 0) {
    throw HTTPError(400, 'messageId does not refer to a valid message within a channel/DM that the authorised user has joined');
  }

  const messageToBePinned = channelOrDmMsgLocated.messages.find(message => message.messageId === messageId);

  if (messageToBePinned.isPinned === true) {
    throw HTTPError(400, 'Message is already pinned');
  }

  if (user.permissionId !== 1 && userMemberCheck(channelOrDmMsgLocated.ownerMembers, user) === 0) {
    throw HTTPError(403, 'The authorised user does not have owner permissions, and the message was not sent by them');
  }

  messageToBePinned.isPinned = true;

  setData(data);

  return {};
}

function messageUnpin(token: string, messageId: number) {
  const data = getData();
  const user = findUser(token);
  const channelOrDmMsgLocated = findMessage(data.channels, data.dms, messageId);

  if (user === undefined) {
    throw HTTPError(403, 'token passed in is invalid');
  } else if (channelOrDmMsgLocated === undefined || userMemberCheck(channelOrDmMsgLocated.allMembers, user) === 0) {
    throw HTTPError(400, 'messageId does not refer to a valid message within a channel/DM that the authorised user has joined');
  }

  const messageToBeUnpinned = channelOrDmMsgLocated.messages.find(message => message.messageId === messageId);

  if (messageToBeUnpinned.isPinned === false) {
    throw HTTPError(400, 'Message is already unpinned');
  }

  if (user.permissionId !== 1 && userMemberCheck(channelOrDmMsgLocated.ownerMembers, user) === 0) {
    throw HTTPError(403, 'The authorised user does not have owner permissions, and the message was not sent by them');
  }

  messageToBeUnpinned.isPinned = false;

  setData(data);

  return {};
}

function messageUnreact (token: string, messageId: number, reactId: number) {
  const data = getData();
  const user = findUser(token);
  const channelOrDmMsgLocated = findMessage(data.channels, data.dms, messageId);

  if (user === undefined) {
    throw HTTPError(403, 'token passed in is invalid');
  } else if (channelOrDmMsgLocated === undefined || userMemberCheck(channelOrDmMsgLocated.allMembers, user) === 0) {
    throw HTTPError(400, 'messageId does not refer to a valid message within a channel/DM that the authorised user has joined');
  }

  if (reactId !== 1) {
    throw HTTPError(400, 'reactId is invalid');
  }

  const messageToReact = channelOrDmMsgLocated.messages.find(message => message.messageId === messageId);

  let reactFound = false;

  for (const react of messageToReact.reacts) {
    if (react.reactId === reactId) {
      reactFound = true;
      if (!react.isThisUserReacted) {
        throw HTTPError(400, 'message does not contains a react');
      } else {
        react.isThisUserReacted = false;
        react.uIds.push({ uId: user.uId });
      }
    }
  }
  if (!reactFound) {
    messageToReact.reacts.push({
      reactId: reactId,
      uIds: [{ uId: user.uId }],
      isThisUserReacted: false,
    });
  }
  setData(data);

  return {};
}

export { messageSendV2, messageSendDmV2, messageEditV2, messageRemoveV2, messageSendLaterDm, messageSendLater, standUpActive, standUpSend, standUpStart, messageReact, messagePin, messageUnpin, messageUnreact };

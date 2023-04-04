import { getData, setData } from './dataStore';
import { findUser, channelsListFilter } from './helper';
import { error, channelId, channelList } from './interfaces';
import HTTPError from 'http-errors';

/**
 * @description Creates a channel. Creates a new channel with the given name that is either a public or private channel.
 * The user who created it automatically joins the channel.
 * @param {string} token - represents users Id session
 * @param {string} name - name of the channel
 * @param {boolean} isPublic - determines if the channel will be public or private
 * @returns {object<{channelId: number}>} - success
 * @returns {object<{error: string}>} - invalid channel name, channel name must 1-20 characters
 * @returns {object<{error: string}>} - when the token passed in is invalid
 */
function channelsCreateV3(token: string, name: string, isPublic: boolean): channelId | error {
  const data = getData();
  const user = findUser(token);

  if (user === undefined) {
    throw HTTPError(403, 'token passed in is invalid');
  } else if (name.length < 1 || name.length > 20) {
    throw HTTPError(400, 'length of name is less than 1 or more than 20 characters');
  }
  const channelId = data.channels.length + 1;

  data.channels.push({
    channelId: channelId,
    name: name,
    isPublic: isPublic,
    ownerMembers: [{
      uId: user.uId,
      email: user.email,
      nameFirst: user.nameFirst,
      nameLast: user.nameLast,
      handleStr: user.handleStr,
    }],
    allMembers: [{
      uId: user.uId,
      email: user.email,
      nameFirst: user.nameFirst,
      nameLast: user.nameLast,
      handleStr: user.handleStr,
    }],
    messages: [],
    standUp: {
      isActive: false,
      timeFinish: null,
      starterUserId: null,
    }
  });
  setData(data);
  return {
    channelId: channelId,
  };
}

/**
 * @description Provide an array of all channels, including private channels, (and their associated details)
 * @param {string} token - represents users Id session
 * @returns {object<{channels: Array{channelId: number, name: string}}>}
 * @returns {object<{error: string}>} - Invalid token passed
 */
function channelsListallV3(token: string): channelList | error {
  const data = getData();
  return (findUser(token) === undefined) ? (function() { throw HTTPError(403, 'token passed in is invalid'); }()) : { channels: data.channels.map(channelsListFilter) };
}

function channelsListV3(token: string): channelList | error {
  const data = getData();
  if (findUser(token) === undefined) {
    throw HTTPError(403, 'token passed in is invalid');
  }

  const userId = findUser(token).uId;
  const channelList = [];

  for (const channel of data.channels) {
    for (const member of channel.allMembers) {
      if (member.uId === userId) {
        channelList.push({ channelId: channel.channelId, name: channel.name });
      }
    }
  }
  return ({ channels: channelList });
}

export { channelsCreateV3, channelsListallV3, channelsListV3 };

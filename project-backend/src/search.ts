import { getData } from './dataStore';
import { findUser } from './helper';
import HTTPError from 'http-errors';

function search(token: string, queryStr: string) {
  const data = getData();
  const storedMessage = [];
  const user = findUser(token);

  if (user === undefined) {
    throw HTTPError(403, 'token passed in is invalid');
  }
  if (queryStr.length < 1 || queryStr.length > 1000) {
    throw HTTPError(400, 'length is less than 1 or over 1000 characters');
  }

  for (const channel of data.channels) {
    for (const message of channel.messages) {
      if (queryStr === message.message) {
        storedMessage.push({
          messageId: message.messageId,
          uId: message.uId,
          message: message.message,
          timeSent: message.timeSent,
          reacts: message.reacts,
          isPinned: message.isPinned,
        });
      }
    }
  }
  return { messages: storedMessage };
}

export { search };

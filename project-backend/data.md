```javascript
// TODO: insert your data structure that contains users + channels info here
// You may also add a short description explaining your design

// More properties are likely to be added in the future.

let data = {
  // User: An array of users.
  // The user object will have general identification details for a single person/user such as: email, password, first name, last name and userID. 
  users: [
      {
      uId: 1,
      handleStr: 'bobross',
      nameFirst: 'Bob',
      nameLast: 'Ross',
      email: 'bob.ross@gmail.com',
      password: 'password',
      permissionId: 1,
      userSessions: [
          {token: '153'};
      ],
      notifications: 
      {
        channelId: number, 
        dmId: number,
        notificationMessage: string
      }[],
      }
  ],
  //Channels: An array of users.
  // The channel object will have the general information for a single channel. These include: the authorisor user ID, the channel ID, the name of the channel, a flag to determine its publicity and more.
  channels: [
    {
    channelId: 1,
    name: 'Channel',
    isPublic: true,
    ownerMembers:[{
        uId: authUserId,
        email: 'bob.ross@gmail.com',
        nameFirst: 'Bob',
        nameLast: 'Ross',
        handleStr: 'bobross',
    }],
    allMembers: [{
        uId: authUserId,
        email: 'bob.ross@gmail.com',
        nameFirst: 'Bob',
        nameLast: 'Ross',
        handleStr: 'bobross',
    },
    {
        uId: 2,
        email: 'sean.ross@gmail.com',
        nameFirst: 'Sean',
        nameLast: 'Ross',
        handleStr: 'seanross',
    }],
    messages: [
        {
          messageId: 1
          uId: 1
          message: 'string'
          timeSent: *integer (unix timestamp)*
          reacts: [{
              reactId: number;
              uIds: number[];
              isThisUserReacted: boolean;
            }],
          isPinned: false,
        }
      ],
    }
  ],
  dms: [
    {
      dmId: number;
      name: String[];
      ownerMembers: [{
        uId: number;
        email: string;
        nameFirst: string;
        nameLast: string;
        handleStr: string;
      }],
      messages?: {
        messageId?: number;
        uId?: number;
        message?: string;
        timeSent?: number;
        }[];
        allMembers: {
          uId: number;
          email: string;
          nameFirst: string;
          nameLast: string;
          handleStr: string;
        }[];      
    }      
  ];
}


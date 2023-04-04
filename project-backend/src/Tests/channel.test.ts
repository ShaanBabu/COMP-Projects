import { http403ErrorGET, http400ErrorGET, http400ErrorPOST, http403ErrorPOST, http200SuccessPOST, authLogoutPost, authRegisterPost, errorMsg, channelDetailsV2Get, channelsCreateV2Post, channelMessagesGet, channelJoinV2Post, channelRemoveOwnerV1Post, channelInvitePost, channelLeaveV1Post, clearV1Delete, messageSendV1Post, channelAddOwnerV1Post} from './helperTest';
import { authUserId, channelId } from '../interfaces';

let user: authUserId;
let channel: channelId;

beforeEach(() => {
  clearV1Delete('clear/v1');
  user = authRegisterPost('auth/register/v3', {
    email: 'johnsmith@gmail.com',
    password: '123456',
    nameFirst: 'John',
    nameLast: 'Smith',
  });
  channel = channelsCreateV2Post('channels/create/v3',{name: 'channel1', isPublic: true}, user.token);
});

describe('channelMessagesV2 function tests', () => {
  test('Tests if error on invalid token passed', () => {
    authLogoutPost('auth/logout/v2', {}, user.token);
    const query = http403ErrorGET('channel/messages/v3', {channelId: channel.channelId, start:0}, user.token);
    expect(query).toEqual({error: { message: 'token passed in is invalid' }});
  });
  test('Test for all conditions satisfied', () => {
      const message = messageSendV1Post('message/send/v2', {channelId: channel.channelId, message: 'hello'}, user.token)
      expect(channelMessagesGet('channel/messages/v3', {channelId: channel.channelId, start:0}, user.token)).toEqual({ messages: [{ messageId: message.messageId, uId: 1, message: 'hello', timeSent: expect.any(Number), reacts: expect.any(Array), isPinned: expect.any(Boolean)}], start: 0, end: -1 });
  });
  test('Test with invalid start count', () => {  
    const query = http400ErrorGET('channel/messages/v3', {channelId: channel.channelId, start:1 }, user.token);
    expect(query).toEqual({error: {message: 'start is greater than the total number of messages in channel'}});
  });
  test('Test when user is not part of channel', () => {
    const secondUser = authRegisterPost('auth/register/v3', {
      email: 'adam@gmail.com',
      password: '1234561',
      nameFirst: 'Adam',
      nameLast: 'Smith',
    })
    const channel = channelsCreateV2Post('channels/create/v3',{name: 'channel1', isPublic: true}, user.token);
    expect(http403ErrorGET('channel/messages/v3', {channelId: channel.channelId, start:0 }, secondUser.token)).toEqual({error: {message: 'authorised user is not a member of the channel'}});
  });
  test('Test with invalid channelId', () => {
    const message = messageSendV1Post('message/send/v2', {channelId: channel.channelId, message: 'hello'}, user.token)
    expect(http400ErrorGET('channel/messages/v3', {channelId: channel.channelId+1, start:0}, user.token)).toEqual({error: {message: 'channelId does not refer to a valid channel'}});
  });
  test('Test when end is not -1', () => { 
    for (let i = 0; i < 51; i++) {
      messageSendV1Post('message/send/v2', {channelId: channel.channelId, message: 'hello'}, user.token)
    }
    const message = channelMessagesGet('channel/messages/v3', {channelId: channel.channelId, start:0}, user.token);
    expect(message).toEqual({ messages: expect.arrayContaining([{ messageId: expect.any(Number), uId: expect.any(Number), message: 'hello', timeSent: expect.any(Number), reacts: expect.any(Array), isPinned: expect.any(Boolean)}]), start: 0, end: 50 });
  });
});


describe('channelInviteV2 HTTP tests', () => {
  // already a member of the channel (has valid channelId)
  test('Tests when member is already part of channel', () => {
    const query = http400ErrorPOST('channel/invite/v2', {channelId: channel.channelId, uId: user.authUserId}, user.token);
    expect (query).toEqual({error: { message:'uId refers to a user who is already a member of channel'}});     
  })
  // if channelId is incorrect (need to check this again -> const Uid)
  test('Tests if channelId is incorrect', () => {
    const secondUser = authRegisterPost('auth/register/v3', {
        email: 'adam@gmail.com',
        password: '123456',
        nameFirst: 'John',
        nameLast: 'Smith',
    })
    const query = http400ErrorPOST('channel/invite/v2', {channelId: channel.channelId + 1, uId: user.authUserId}, secondUser.token);
    expect (query).toEqual({error: { message: 'incorrect channelId' }});     
  })
   test('Tests if user is not part of channel', () => {
    let secondUser = authRegisterPost('auth/register/v3', {
      email: 'adam@gmail.com',
      password: '123456',
      nameFirst: 'John',
      nameLast: 'Smith',
    })
    let user3 = authRegisterPost('auth/register/v3', {
      email: 'userthree@gmail.com',
      password: 'Password6',
      nameFirst: 'user',
      nameLast: 'three',
    });
    const query = http403ErrorPOST('channel/invite/v2', {channelId: channel.channelId, uId: 2}, user3.token);
    expect (query).toEqual({error: { message: 'not a member of channel' }});      
  })
  //if uId is invalid
  test('Tests with invalid uId', () => {
       const query = http400ErrorPOST ('channel/invite/v2', {channelId: channel.channelId, uId: 2}, user.token);
       expect (query).toEqual({error: { message: 'uId does not refer to a valid user' }}); 
       })
       //satisfied channelsinviteV1
  test('Test when all condition is met', () => {
    const secondUser = authRegisterPost('auth/register/v3', {
      email: 'adam@gmail.com',
      password: '123456',
      nameFirst: 'John',
      nameLast: 'Smith',
    })
    const query = channelInvitePost ('channel/invite/v2', {channelId: channel.channelId, uId: secondUser.authUserId}, user.token);
    expect (query).toEqual({});
  });

});


describe('ChannelDetailsV3 tests', () => {
  test('Tests if error on invalid token passed', () => {
    authLogoutPost('auth/logout/v2', {}, user.token);
    const query = http403ErrorGET('channel/details/v3', {channelId: channel.channelId }, user.token);
    expect(query).toEqual({error: { message: 'token passed in is invalid' }});
  });
  test('Tests if error on invalid channelId', () => {
    expect(http400ErrorGET('channel/details/v3', {channelId: 2 }, user.token)).toEqual({error: { message: 'channelId does not refer to a valid channel' }});
  });
  test('Tests if error on user is not a member of the channel', () => {
    let user2 = authRegisterPost('auth/register/v3', {
      email: 'usertwo@gmail.com',
      password: 'Password6',
      nameFirst: 'user',
      nameLast: 'two',
    });
    expect(http403ErrorGET('channel/details/v3', {channelId: channel.channelId }, user2.token)).toEqual({error: { message: 'channelId is valid and the authorised user is not a member of the channel' }});
  });
  test('Tests if successful', () => {
    expect(channelDetailsV2Get('channel/details/v3', {channelId: channel.channelId }, user.token)).toEqual({
      name: 'channel1',
      isPublic: true,
      ownerMembers: [{
          uId: 1,
          email: 'johnsmith@gmail.com',
          nameFirst: 'John',
          nameLast: 'Smith',
          handleStr: 'johnsmith',
      }],
      allMembers: [{
          uId: 1,
          email: 'johnsmith@gmail.com',
          nameFirst: 'John',
          nameLast: 'Smith',
          handleStr: 'johnsmith',
      }],
    });
  })
})

describe('ChannelJoinV3', () => {
  test('Tests if error on invalid token passed', () => {
    authLogoutPost('auth/logout/v2', {}, user.token);
    const query = http403ErrorPOST('channel/join/v3', {channelId: channel.channelId }, user.token);
    expect(query).toEqual({error: { message: 'token passed in is invalid' }});
  });
  test('Tests if error on invalid channelId', () => {
    expect(http400ErrorPOST('channel/join/v3', {channelId: 2 }, user.token)).toEqual({error: { message: 'channelId does not refer to a valid channel' }});
  });
  test('Tests if authorised user is already a member of the channel', () => {
    expect(http400ErrorPOST('channel/join/v3', {channelId: channel.channelId}, user.token)).toStrictEqual({ error: { message: 'the authorised user is already a member of the channel' }});
  })
  test('channelId refers to a channel that is private and the authorised user is not already a channel member and is not a global owner', () => {
    let user2 = authRegisterPost('auth/register/v3', {
      email: 'usertwo@gmail.com',
      password: 'Password6',
      nameFirst: 'user',
      nameLast: 'two',
    });
    let channel = channelsCreateV2Post('channels/create/v3', {name: 'channel1', isPublic: false}, user.token);
    expect(http403ErrorPOST('channel/join/v3', {channelId:channel.channelId}, user2.token)).toStrictEqual({ error: { message: 'channelId refers to a channel that is private and the authorised user is not already a channel member and is not a global owner' }});
  })
  test('Tests if successfully joined', () => {
    let user2 = authRegisterPost('auth/register/v3', {
      email: 'usertwo@gmail.com',
      password: 'Password6',
      nameFirst: 'user',
      nameLast: 'two',
    });
    const query = channelJoinV2Post('channel/join/v3', {channelId: channel.channelId}, user2.token)
    expect(query).toStrictEqual({});
  });
})

describe('ChannelAddOwnerV2', () => {
  
  test('uId does not refer to a valid user', () => {
    authLogoutPost('auth/logout/v2', {}, user.token);
    const query = http403ErrorPOST('channel/addowner/v2', {channelId: channel.channelId, uId: 2,}, user.token);
    expect(query).toEqual({error: { message: 'token passed in is invalid' }});
  })

  test('channelId does not refer to a valid channel', () => {
    let user2 = authRegisterPost('auth/register/v3', {
      email: 'usertwo@gmail.com',
      password: 'Password6',
      nameFirst: 'user',
      nameLast: 'two',
    });
    channelJoinV2Post('channel/join/v3', {channelId: channel.channelId}, user2.token);
    const query = http400ErrorPOST('channel/addowner/v2', {channelId: 2, uId: user2.token}, user.token);
    expect(query).toEqual({error: { message: 'channelId does not refer to a valid channel' }});
  })

  test('uId does not refer to a valid user', () => {
    const query = http400ErrorPOST('channel/addowner/v2', {channelId: channel.channelId, uId: 3}, user.token);
    expect(query).toEqual({error: { message: 'uId does not refer to a valid user' }});
  })

  test('UId refers to a user who is not a member of the channel', () => {
    let user2 = authRegisterPost('auth/register/v3', {
      email: 'usertwo@gmail.com',
      password: 'Password6',
      nameFirst: 'user',
      nameLast: 'two',
    });
    const query = http400ErrorPOST('channel/addowner/v2', {channelId: channel.channelId, uId: user2.authUserId}, user.token);
    expect(query).toEqual({error: { message: 'uId refers to a user who is not a member of the channel' }});
  })

  test('ChannelId is valid and the authorised user does not have owner permissions in the channel', () => {
    let user2 = authRegisterPost('auth/register/v3', {
      email: 'usertwo@gmail.com',
      password: 'Password6',
      nameFirst: 'user',
      nameLast: 'two',
    });
    channelJoinV2Post('channel/join/v3', {channelId: channel.channelId}, user2.token);

    let user3 = authRegisterPost('auth/register/v3', {
      email: 'userthree@gmail.com',
      password: 'Password6',
      nameFirst: 'user',
      nameLast: 'three',
    });
    channelJoinV2Post('channel/join/v3', {channelId: channel.channelId}, user3.token);
    const query = http403ErrorPOST('channel/addowner/v2', {channelId: channel.channelId, uId: user3.authUserId}, user2.token);
    expect(query).toEqual({error: { message: 'channelId is valid and the authorised user does not have owner permissions in the channel' }});
  })

  
  test('Tests if successfully added a user as an owner of the channel', () => {
    let user2 = authRegisterPost('auth/register/v3', {
      email: 'usertwo@gmail.com',
      password: 'Password6',
      nameFirst: 'user',
      nameLast: 'two',
    });
    let query2 = channelJoinV2Post('channel/join/v3', {channelId: channel.channelId}, user2.token);
    const query = channelAddOwnerV1Post ('channel/addowner/v2', {channelId: channel.channelId, uId: user2.authUserId}, user.token);   
    expect(query).toStrictEqual({});
  });
})

describe('channelLeaveV2 HTTP tests', () => {

  test('Test for success of channelLeaveV2', () => {
    const query = channelLeaveV1Post('channel/leave/v2', {channelId: channel.channelId}, user.token);
    expect (query).toEqual({});     
  });

  test('Test for success of channelLeaveV2, via channelDetailsV2', () => {
    let user2 = authRegisterPost('auth/register/v3', {
      email: 'usertwo@gmail.com',
      password: '123456',
      nameFirst: 'User',
      nameLast: 'Two',
    });
    channelJoinV2Post('channel/join/v3', {channelId: channel.channelId}, user2.token)
    channelLeaveV1Post('channel/leave/v2', {channelId: channel.channelId}, user.token)
    const query2 = channelDetailsV2Get('channel/details/v3', {channelId: channel.channelId }, user2.token)
    expect (query2).toEqual({
      name: 'channel1',
      isPublic: true,
      ownerMembers: [],
      allMembers: [{
        uId: 2,
        email: 'usertwo@gmail.com',
        nameFirst: 'User',
        nameLast: 'Two',
        handleStr: 'usertwo',
      }],
    });    
  });

  test('Test for error of channelLeaveV1, invalid token', () => {
    authLogoutPost('auth/logout/v2', {}, user.token);
    const query = http403ErrorPOST('channel/leave/v2', {channelId: channel.channelId}, user.token);
    expect (query).toEqual({error: { message: 'token passed in is invalid' }});     
  });

  test('Test for error of channelLeaveV1, the authorised user is the starter of an active standup in the channel', () => {
    http200SuccessPOST('standup/start/v1', {channelId: channel.channelId, length: 5}, user.token);
    const query = http400ErrorPOST('channel/leave/v2', {channelId: channel.channelId}, user.token);
    expect (query).toEqual({error: { message: 'the authorised user is the starter of an active standup in the channel' }});     
  });

  test('Test for error of channelLeaveV1, channelId does not refer to a valid channel', () => {
    const query = http400ErrorPOST('channel/leave/v2', {channelId: 2}, user.token);
    expect (query).toEqual({error: { message: 'channelId does not refer to a valid channel' }});     
  });

  test('Test for error of channelLeaveV1, channelId is valid and the authorised user is not a member of the channel', () => {
    let user2 = authRegisterPost('auth/register/v3', {
      email: 'usertwo@gmail.com',
      password: '123456',
      nameFirst: 'User',
      nameLast: 'Two',
    });
    const query = http403ErrorPOST('channel/leave/v2', {channelId: channel.channelId}, user2.token);
    expect (query).toEqual({error: { message: 'channelId is valid and the authorised user is not a member of the channel' }});     
  });
});

describe('channelRemoveOwnerV1 HTTP tests', () => {
  test('Test for success of channelRemoveOwnerV1', () => {
    let user2 = authRegisterPost('auth/register/v3', {
      email: 'usertwo@gmail.com',
      password: '123456',
      nameFirst: 'User',
      nameLast: 'Two',
    });
    channelJoinV2Post('channel/join/v3', {channelId: channel.channelId}, user2.token);
    channelAddOwnerV1Post ('channel/addowner/v2', {channelId: channel.channelId, uId: user2.authUserId}, user.token); 
    const query = channelRemoveOwnerV1Post('channel/removeowner/v2', {channelId: channel.channelId, uId: user2.authUserId}, user.token);
    expect (query).toEqual({});     
  });
  test('Test for success of channelRemoveOwnerV1, via channelDetails', () => {
    let user2 = authRegisterPost('auth/register/v3', {
      email: 'usertwo@gmail.com',
      password: '123456',
      nameFirst: 'User',
      nameLast: 'Two',
    });
    channelJoinV2Post('channel/join/v3', {channelId: channel.channelId}, user2.token);
    channelAddOwnerV1Post ('channel/addowner/v2', {channelId: channel.channelId, uId: user2.authUserId}, user.token); 
    channelRemoveOwnerV1Post('channel/removeowner/v2', {channelId: channel.channelId, uId: user2.authUserId}, user.token);
    const query = channelDetailsV2Get('channel/details/v3', {channelId: channel.channelId}, user.token)
    expect(query).toEqual({
      name: 'channel1',
      isPublic: true,
      ownerMembers: [{
          uId: 1,
          email: 'johnsmith@gmail.com',
          nameFirst: 'John',
          nameLast: 'Smith',
          handleStr: 'johnsmith',
      }],
      allMembers: [{
          uId: 1,
          email: 'johnsmith@gmail.com',
          nameFirst: 'John',
          nameLast: 'Smith',
          handleStr: 'johnsmith',
      },
      {
        uId: 2,
        email: 'usertwo@gmail.com',
        nameFirst: 'User',
        nameLast: 'Two',
        handleStr: 'usertwo',
    }],
    });         
  });
  test('Test for error of channelRemoveOwnerV1, invalid token', () => {
    let user2 = authRegisterPost('auth/register/v3', {
      email: 'usertwo@gmail.com',
      password: '123456',
      nameFirst: 'User',
      nameLast: 'Two',
    });
    channelJoinV2Post('channel/join/v3', {channelId: channel.channelId}, user2.token);
    channelAddOwnerV1Post ('channel/addowner/v2', {channelId: channel.channelId, uId: user2.authUserId}, user.token);
    authLogoutPost('auth/logout/v2', {}, user.token); 
    const query = http403ErrorPOST('channel/removeowner/v2', {channelId: channel.channelId, uId: user2.authUserId}, user.token);
    expect (query).toEqual({error: { message: 'token passed in is invalid' }});     
  });
  test('Test for error of channelRemoveOwnerV1, invalid channelId', () => {
    let user2 = authRegisterPost('auth/register/v3', {
      email: 'usertwo@gmail.com',
      password: '123456',
      nameFirst: 'User',
      nameLast: 'Two',
    });
    channelJoinV2Post('channel/join/v3', {channelId: channel.channelId}, user2.token);
    channelAddOwnerV1Post ('channel/addowner/v2', {channelId: channel.channelId, uId: user2.authUserId}, user.token); 
    const query = http400ErrorPOST('channel/removeowner/v2', {channelId: 2, uId: user2.authUserId}, user.token);
    expect (query).toEqual({error: { message: 'channelId does not refer to a valid channel' }});     
  });
  test('Test for error of channelRemoveOwnerV1, invalid uId', () => {
    let user2 = authRegisterPost('auth/register/v3', {
      email: 'usertwo@gmail.com',
      password: '123456',
      nameFirst: 'User',
      nameLast: 'Two',
    });
    channelJoinV2Post('channel/join/v3', {channelId: channel.channelId}, user2.token);
    channelAddOwnerV1Post ('channel/addowner/v2', {channelId: channel.channelId, uId: user2.authUserId}, user.token); 
    const query = http400ErrorPOST('channel/removeowner/v2', {channelId: channel.channelId, uId: 3}, user.token);
    expect (query).toEqual({error: { message: 'uId does not refer to a valid user' }});     
  });
  test('Test for error of channelRemoveOwnerV1, uId refers to a user who is not an owner of the channel', () => {
    let user2 = authRegisterPost('auth/register/v3', {
      email: 'usertwo@gmail.com',
      password: '123456',
      nameFirst: 'User',
      nameLast: 'Two',
    });
    channelJoinV2Post('channel/join/v3', {channelId: channel.channelId}, user2.token);
    const query = http400ErrorPOST('channel/removeowner/v2', {channelId: channel.channelId, uId: user2.authUserId}, user.token);
    expect (query).toEqual({error: { message: 'uId refers to a user who is not an owner of the channel' }});     
  });
  test('Test for error of channelRemoveOwnerV1, uId refers to a user who is currently the only owner of the channel', () => {
    let user2 = authRegisterPost('auth/register/v3', {
      email: 'usertwo@gmail.com',
      password: '123456',
      nameFirst: 'User',
      nameLast: 'Two',
    });
    const channel2 = channelsCreateV2Post('channels/create/v3',{name: 'channel2', isPublic: true}, user2.token);
    channelJoinV2Post('channel/join/v3', {channelId: channel2.channelId}, user.token)
    const query = http400ErrorPOST('channel/removeowner/v2', {channelId: channel2.channelId, uId: user2.authUserId}, user.token);
    expect (query).toEqual({error: { message: 'uId refers to a user who is currently the only owner of the channel' }});     
  });
  test('Test for error of channelRemoveOwnerV1, channelId is valid and the authorised user does not have owner permissions in the channel', () => {
    let user2 = authRegisterPost('auth/register/v3', {
      email: 'usertwo@gmail.com',
      password: '123456',
      nameFirst: 'User',
      nameLast: 'Two',
    });
    let user3 = authRegisterPost('auth/register/v3', {
      email: 'userthree@gmail.com',
      password: '123456',
      nameFirst: 'User',
      nameLast: 'Three',
    });
    const channel2 = channelsCreateV2Post('channels/create/v3',{name: 'channel2', isPublic: true}, user2.token);
    channelJoinV2Post('channel/join/v3', {channelId: channel2.channelId}, user.token);
    channelJoinV2Post('channel/join/v3', {channelId: channel2.channelId}, user3.token);
    channelAddOwnerV1Post ('channel/addowner/v2', {channelId: channel2.channelId, uId: user.authUserId}, user2.token); 
    const query = http403ErrorPOST('channel/removeowner/v2', {channelId: channel2.channelId, uId: user2.authUserId}, user3.token);
    expect (query).toEqual({error: { message: 'channelId is valid and the authorised user does not have owner permissions in the channel' }});     
  });
});
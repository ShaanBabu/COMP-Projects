import { 
  authRegisterPost,
  errorMsg, 
  dmCreatePost, 
  dmDetailsGet, 
  dmListGet,
  clearV1Delete, 
  dmRemoveDelete, 
  dmLeaveV1Post,
  dmMessagesV1Get,
  messageEditV1Put,
  http400ErrorPOST,
  http403ErrorPOST,
  http403ErrorGET,
  http400ErrorGET,
  http400ErrorDELETE,
  http403ErrorDELETE,
  authLogoutPost,
  messageSendDmV1Post } from './helperTest';
import { authUserId, dmId } from '../interfaces';

let user1: authUserId;
let user2: authUserId;
let user3: authUserId;
let user4: authUserId;

beforeEach(()=> {
  clearV1Delete('clear/v1');
  user1 = authRegisterPost('auth/register/v3', {
    email: 'userone@gmail.com',
    password: 'Password6',
    nameFirst: 'User',
    nameLast: 'One',
  }); 
  user2 = authRegisterPost('auth/register/v3', {
    email: 'usertwo@gmail.com',
    password: 'Password6',
    nameFirst: 'User',
    nameLast: 'Two',
  }); 
  user3 = authRegisterPost('auth/register/v3', {
    email: 'userthree@gmail.com',
    password: 'Password6',
    nameFirst: 'User',
    nameLast: 'Three',
  }); 
  user4 = authRegisterPost('auth/register/v3', {
    email: 'userfour@gmail.com',
    password: 'Password6',
    nameFirst: 'User',
    nameLast: 'Four',
  });
});
describe('HTTP tests for dm/create/v2', () => {

  test('Test successful dm/create/v2', () => {   
    const query = dmCreatePost('dm/create/v2', {
      uIds: [user2.authUserId, user3.authUserId, user4.authUserId],
    },
    user1.token);
    expect(query).toEqual({dmId: expect.any(Number)})
  })  

  test('Test dm/create/v2 error when user creator is part of invitees', () => {
    const query = http400ErrorPOST('dm/create/v2', {uIds: [user2.authUserId, user1.authUserId]}, user1.token);
  expect(query).toEqual({error: { message: 'The uIds contain an invalid user' }})
  })

  test('Test dm/create/v2 for error when user invited does not exist', () => {
    const query = http400ErrorPOST('dm/create/v2', {uIds: [5]}, user1.token);
    expect(query).toEqual({error: { message: 'The uIds contain an invalid user' }})
  })

  test('Test dm/create/v2 error when no other users apart from creator exist', () => {
    const query = http400ErrorPOST('dm/create/v2', {uIds: [1, 2]}, user1.token);
    expect(query).toEqual({error: { message: 'The uIds contain an invalid user' }})
  })

  test('Test duplicate invitees', () => {
    const query = http400ErrorPOST('dm/create/v2', {uIds: [user3.authUserId, user3.authUserId, user4.authUserId]}, user1.token);
    expect(query).toEqual({error: { message: 'There are duplicate users invited' }})
  })  

  test('Testing if token passed is invalid', () => {
    authLogoutPost('auth/logout/v2', {}, user1.token);
    const query = http403ErrorPOST('dm/create/v2', {uIds: [user3.authUserId, user3.authUserId, user4.authUserId]}, user1.token);
    expect(query).toEqual({error: { message: 'token passed in is invalid' }}); 
  });
})

describe('HTTP tests for dm/details/v2', () => {
  test('Test succesful dm/details/v2, owner', () => {
    const dmId = dmCreatePost('dm/create/v2', {uIds: [user2.authUserId, user3.authUserId, user4.authUserId]}, user1.token);
    const query = dmDetailsGet('dm/details/v2', {dmId: dmId.dmId}, user1.token); 
    expect(query).toEqual({
      name: expect.any(String),
      members: expect.any(Array)
    })
  })

  test('Test succesful dm/details/v2, member', () => {
    const dmId = dmCreatePost('dm/create/v2', {uIds: [user2.authUserId, user3.authUserId, user4.authUserId]}, user1.token);
    const query = dmDetailsGet('dm/details/v2', {dmId: dmId.dmId}, user2.token);
    expect(query).toEqual({
      name: expect.any(String),
      members: expect.any(Array)
    })
  })
  //unauthorised user (member) 
  test('Test member not part of dm', () => {
    const dmId = dmCreatePost('dm/create/v2', {uIds: [user2.authUserId, user3.authUserId]}, user1.token);
    const query = http403ErrorGET('dm/details/v2', {dmId: dmId.dmId}, user4.token,);
    expect(query).toEqual({error: { message: 'The user is not a member of this DM' }})
  })

  test('Invalid dm Id', () => {
    const dmId = dmCreatePost('dm/create/v2', {uIds: [user2.authUserId, user3.authUserId]}, user1.token);
    const query = http400ErrorGET('dm/details/v2', {dmId: dmId.dmId + 1}, user3.token);
    expect(query).toEqual({error: { message: 'The ID does not refer to a valid DM' }})
  })

  //unauthorised user

  test('Testing if token passed is invalid', () => {
    const dmId = dmCreatePost('dm/create/v2', {uIds: [user2.authUserId, user3.authUserId, user4.authUserId]}, user1.token);
    authLogoutPost('auth/logout/v2', {}, user1.token);
    const query = http403ErrorGET('dm/details/v2', {dmId: dmId.dmId}, user1.token);
    expect(query).toEqual({error: { message: 'token passed in is invalid' }}); 
  });
})

describe('HTTP tests for dm/list/v2', () => {
  test('Test success of dm/list/v2 with 3 dms user is in', () => {
    dmCreatePost('dm/create/v2', {uIds: [user2.authUserId, user3.authUserId]}, user1.token);
    
    dmCreatePost('dm/create/v2', {uIds: [user2.authUserId]}, user1.token);

    dmCreatePost('dm/create/v2', {uIds: [user2.authUserId, user3.authUserId, user4.authUserId]}, user1.token);

    const query = dmListGet('dm/list/v2', {}, user2.token);
    expect(query).toEqual({dms: expect.any(Array)});
  });

  test('Test success of dm/list/v2 with 3 dms user is in, 1 owner dm', () => {
    dmCreatePost('dm/create/v2', {uIds: [user2.authUserId, user3.authUserId]}, user1.token);
    
    dmCreatePost('dm/create/v2', {uIds: [user2.authUserId]}, user1.token);

    dmCreatePost('dm/create/v2', {uIds: [user2.authUserId, user3.authUserId, user4.authUserId]}, user1.token);

    dmCreatePost('dm/create/v2', {uIds: [user3.authUserId, user4.authUserId]}, user2.token);

    const query = dmListGet('dm/list/v2', {}, user2.token);
    expect(query).toEqual({dms: expect.any(Array)});
  });

  test('Test user in 0 of 0 dms', () => {
    const query = dmListGet('dm/list/v2', {}, user2.token);
    expect(query).toEqual({dms: []});
  });

  test('Test user in 0 of 1 dms', () => {
    dmCreatePost('dm/create/v2', {uIds: [user3.authUserId]}, user1.token);
    const query = dmListGet('dm/list/v2', {}, user2.token);
    expect(query).toEqual({dms: [] });
  });
})


describe('HTTP tests for dm/leave/v2', () => {

  test('Test success of dm/leave/v2, member leaves', () => {
    const dmId = dmCreatePost('dm/create/v2', {uIds: [user2.authUserId, user3.authUserId]}, user1.token);
    const query = dmLeaveV1Post('dm/leave/v2', {dmId: dmId.dmId}, user2.token);
    expect(query).toEqual({});
  });

  test('Test success of dm/leave/v2, creator leaves', () => {
    const dmId = dmCreatePost('dm/create/v2', {uIds: [user2.authUserId, user3.authUserId]}, user1.token);
    const query = dmLeaveV1Post('dm/leave/v2', {dmId: dmId.dmId}, user1.token);
    expect(query).toEqual({});
  });

  test('Test error of invalid token passed', () => {
    const dmId = dmCreatePost('dm/create/v2', {uIds: [user2.authUserId, user3.authUserId]}, user1.token);
    authLogoutPost('auth/logout/v2', {}, user1.token);
    const query = http403ErrorPOST('dm/leave/v2', {dmId: dmId.dmId}, user1.token);
    expect(query).toEqual({error: { message: 'token passed in is invalid' }});
  });

  test('Test for error, dmId does not refer to a valid DM', () => {
    const dmId = dmCreatePost('dm/create/v2', {uIds: [user2.authUserId, user3.authUserId]}, user1.token);
    const query = http400ErrorPOST('dm/leave/v2', {dmId: 2}, user1.token);
    expect(query).toEqual({error: { message: 'dmId does not refer to a valid DM' }});
  });

  test('Test for error dmId is valid and the authorised user is not a member of the DM', () => {
    const dmId = dmCreatePost('dm/create/v2', {uIds: [user2.authUserId]}, user1.token);
    const query = http403ErrorPOST('dm/leave/v2', {dmId: dmId.dmId}, user3.token);
    expect(query).toEqual({error: { message: 'dmId is valid and the authorised user is not a member of the DM' }});
  });

  test('Test success of dm/leave/v2, creator leaves', () => {
    const dmId = dmCreatePost('dm/create/v2', {uIds: [user2.authUserId]}, user1.token);
    dmLeaveV1Post('dm/leave/v2', {dmId: dmId.dmId}, user1.token);
    const query = dmDetailsGet('dm/details/v2', {dmId: dmId.dmId}, user2.token);
    expect(query.members).toEqual([{
      uId: user2.authUserId,
      email: 'usertwo@gmail.com',
      nameFirst: 'User',
      nameLast: 'Two',
      handleStr: 'usertwo',
    }]);
  });

  test('Test success of dm/leave/v2, member leaves', () => {
    const dmId = dmCreatePost('dm/create/v2', {uIds: [user2.authUserId]}, user1.token);
    dmLeaveV1Post('dm/leave/v2', {dmId: dmId.dmId}, user2.token);
    const query = dmDetailsGet('dm/details/v2', {dmId: dmId.dmId}, user1.token);
    expect(query.members).toEqual([{
      uId: user1.authUserId,
      email: 'userone@gmail.com',
      nameFirst: 'User',
      nameLast: 'One',
      handleStr: 'userone',
    }]);
  });
});

describe('HTTP tests for dm/remove/v2', () => {

  test('Test succesful dm/remove/v2, 1 active dm', () => {
    const dmId = dmCreatePost('dm/create/v2', {uIds: [user2.authUserId, user3.authUserId, user4.authUserId]}, user1.token);
    const query = dmRemoveDelete('dm/remove/v2', {dmId: dmId.dmId}, user1.token);
    expect(query).toEqual({})
  })

  test('Test succesful dm/remove/v2, 2 active dms', () => {
    const dmId = dmCreatePost('dm/create/v2', {uIds: [user2.authUserId, user3.authUserId, user4.authUserId]}, user1.token);
    dmCreatePost('dm/create/v2', {uIds: [user2.authUserId, user3.authUserId]}, user1.token);
    const query = dmRemoveDelete('dm/remove/v2', {dmId: dmId.dmId}, user1.token);
    expect(query).toEqual({})
  })

  //dmId doesnt exist
  test('Test error when dmId removed does not exist', () => {
    const dmId = dmCreatePost('dm/create/v2', {uIds: [user2.authUserId, user3.authUserId]}, user1.token);
    const query = http400ErrorDELETE('dm/remove/v2', {dmId: dmId + 1}, user1.token);
    expect(query).toEqual({error: { message: 'DM entered is invalid' }})
  })

  //dmid valid but authorised user is not the owner
  test('Test error when user is not owner', () => {
    const dmId = dmCreatePost('dm/create/v2', {uIds: [user2.authUserId, user3.authUserId, user4.authUserId]}, user1.token);
    const query = http403ErrorDELETE('dm/remove/v2', {dmId: dmId.dmId}, user2.token,);
    expect(query).toEqual({error: { message: 'Invalid user permissions' }})
  })

  //dmId id valid but user was never in the dm
  test('Test error when user owner not in the dm', () => {
    const dmId = dmCreatePost('dm/create/v2', {uIds: [user2.authUserId, user3.authUserId, user4.authUserId]}, user1.token);
    let userToken = user1.token
    dmLeaveV1Post('dm/leave/v2', {dmId: dmId.dmId}, user1.token)
    const query = http403ErrorDELETE('dm/remove/v2', {dmId: dmId.dmId}, userToken);
    expect(query).toEqual({error: { message: 'Invalid user permissions' }})
  })
  
})

describe('HTTP tests for dm/messages/v2', () => {
  let dm: dmId;
  beforeEach(()=> {
    dm = dmCreatePost('dm/create/v2', {uIds: [user2.authUserId, user3.authUserId, user4.authUserId]}, user1.token);
  })

  test('Test succesful dm/messages/v2', () => {
    messageSendDmV1Post('message/senddm/v2', {dmId: dm.dmId, message: 'hello'}, user2.token);
    const query = dmMessagesV1Get('dm/messages/v2', {dmId: dm.dmId, start: 0}, user1.token);
    expect(query).toEqual({messages: expect.any(Array), start: 0, end: -1})
  });

  test('Test succesful dm/messages/v2, checks output of end', () => {
    for (let i = 0; i < 51; i++) {
      messageSendDmV1Post('message/senddm/v2', {dmId: dm.dmId, message: 'hello'}, user2.token);
    }
    const query = dmMessagesV1Get('dm/messages/v2', {dmId: dm.dmId, start: 0}, user1.token);
    expect(query).toEqual({messages: expect.arrayContaining([{messageId: 1, uId: user2.authUserId, message: 'hello', timeSent: expect.any(Number)}]), start: 0, end: 50});
  });

  test('Test succesful dm/messages/v2, checks output of end', () => {
    messageSendDmV1Post('message/senddm/v2', {dmId: dm.dmId, message: 'hello'}, user2.token);
    messageSendDmV1Post('message/senddm/v2', {dmId: dm.dmId, message: 'hello'}, user1.token);
    const query = dmMessagesV1Get('dm/messages/v2', {dmId: dm.dmId, start: 0}, user1.token);
    expect(query).toEqual({messages: expect.arrayContaining([{messageId: 1, uId: user2.authUserId, message: 'hello', timeSent: expect.any(Number)}]), start: 0, end: -1});
  });

  test('Test error dm/messages/v2, invalid token', () => {
    authLogoutPost('auth/logout/v2', {}, user1.token);
    const query = http403ErrorGET('dm/messages/v2', {dmId: dm.dmId, start: 0}, user1.token);
    expect(query).toEqual({error: { message: 'token passed in is invalid' }});
  });

  test('Test error dm/messages/v2, dmId is not a valid dm Id', () => {
    messageSendDmV1Post('message/senddm/v2', {dmId: dm.dmId, message: 'hello'}, user2.token);
    const query = http400ErrorGET('dm/messages/v2', {dmId: 2, start: 0}, user1.token);
    expect(query).toEqual({error: { message: 'dmId does not refer to a valid DM' }});
  });
  
  test('Test error dm/messages/v2, start is greater than the total number of messages in the channel', () => {
    const query = http400ErrorGET('dm/messages/v2', {dmId: dm.dmId, start: 1}, user1.token);
    expect(query).toEqual({error: { message: 'start is greater than the total number of messages in the channel' }});
  });

  test('Test error dm/messages/v2, dmId is valid and the authorised user is not a member of the DM', () => {
    const dm2 = dmCreatePost('dm/create/v2', {uIds: [user2.authUserId, user3.authUserId]}, user1.token);
    const query = http403ErrorGET('dm/messages/v2', {dmId: dm2.dmId, start: 0}, user4.token);
    expect(query).toEqual({error: { message: 'dmId is valid and the authorised user is not a member of the DM' }});
  });
});
import { http403ErrorPOST, http400ErrorPOST, http403ErrorGET, authLogoutPost, authRegisterPost, channelsListAllV2Get, channelsListV3Get, channelsCreateV2Post, errorMsg, clearV1Delete, adminPermChangePost } from './helperTest';
import { authUserId, channelId} from '../interfaces';


let user: authUserId;
let user2: authUserId;

beforeEach(() => {
    clearV1Delete('clear/v1');
    user = authRegisterPost('auth/register/v3', {
      email: 'johnsmith@gmail.com',
      password: 'Password6',
      nameFirst: 'John',
      nameLast: 'Smith',
    });
    user2 = authRegisterPost('auth/register/v3', {
      email: 'emmalee@gmail.com',
      password: 'Password7',
      nameFirst: 'Emma',
      nameLast: 'Lee',
    });
});


describe('Admin/userpermission/change/v1 function tests', () => {
    test('Tests successful admin/userpermission/change/v1 from member to owner', () => {
        const query = adminPermChangePost('admin/userpermission/change/v1', {uId: user2.authUserId, permissionId: 1 }, user.token);
        expect(query).toEqual({})
    })
    test('Tests successful admin/userpermission/change/v1 from owner to member', () => {
        adminPermChangePost('admin/userpermission/change/v1', {uId: user2.authUserId, permissionId: 1 }, user.token);
        const query = adminPermChangePost('admin/userpermission/change/v1', {uId: user2.authUserId, permissionId: 2 }, user.token);
        expect(query).toEqual({})
    })
    
    test('Testing if token passed is invalid', () => {
    authLogoutPost('auth/logout/v2', {}, user.token);
    const query = http403ErrorPOST('admin/userpermission/change/v1', {uId: user2.authUserId, permissionId: 2 }, user.token);
    expect(query).toEqual({error: { message: 'token passed in is invalid' }}); 
    });

    test('Tests invalid user id', () => {
        const query = http400ErrorPOST('admin/userpermission/change/v1',{uId: user2.authUserId + 1, permissionId: 1 }, user.token);
        expect(query).toEqual({error: { message: 'invalid user id entered' }}); 
    })
    test('Tests user is the only global owner and user is being demoted to user', () => {
        const query = http400ErrorPOST('admin/userpermission/change/v1',{uId: user.authUserId, permissionId: 2 }, user.token);
        expect(query).toEqual({error: { message: 'user is the only global owner' }}); 
    })
    test('PermissionId is invalid', () => {
        const query = http400ErrorPOST('admin/userpermission/change/v1',{uId: user2.authUserId, permissionId: 3 }, user.token);
        expect(query).toEqual({error: { message: 'invalid permission id entered' }}); 
    })
    test('User is at the permissions level of permissionId', () => {
        const query = http400ErrorPOST('admin/userpermission/change/v1',{uId: user2.authUserId, permissionId: 2 }, user.token);
        expect(query).toEqual({error: { message: 'user already has the requested permission level' }}); 
    })
    test('Authorised user is not a global owner', () => {
        const query = http403ErrorPOST('admin/userpermission/change/v1',{uId: user2.authUserId, permissionId: 1 }, user2.token);
        expect(query).toEqual({error: { message: 'user is not a global owner' }}); 
    })
})
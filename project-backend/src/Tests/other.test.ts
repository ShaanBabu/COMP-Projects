
import { authRegisterPost, clearV1Delete } from './helperTest';

beforeEach(() => {
  clearV1Delete('clear/v1');
});

describe('clear function tests', () => {
  test('Ensures it returns the required {}', () => {
    const query = clearV1Delete('clear/v1');
    expect(query).toEqual({});
  });
  test('Ensures that data only has users and channel arrays and they are empty', () => {
    authRegisterPost('auth/register/v3', {
      email: 'seansmith@gmail.com',
      password: 'Password6',
      nameFirst: 'John',
      nameLast: 'Smith',
    });
    const query = clearV1Delete('clear/v1');
    expect(query).toEqual({});
  })
});

export { clearV1Delete }

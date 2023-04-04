import request from 'sync-request';
import config from '../config.json';
const errorMsg = {error: 'error'};

const OK = 200;
const INPUT_ERROR = 400;
const UNAUTHORISED = 403;
const port = config.port;
const url = config.url;

//TEST HELPER FUNCTIONS
//POST 

const http400ErrorPOST = (path: string, body: object, token?: string) => {
  const res = request(
    'POST',
    `${url}:${port}/${path}`,
    {
      body: JSON.stringify(body),
      headers: {
        'Content-type': 'application/json',
        token: `${token}`,
      }
    }
  );
  const bodyObj = JSON.parse(res.body as string);
  expect(res.statusCode).toBe(INPUT_ERROR);
  expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  return bodyObj;
}
const http403ErrorPOST = (path: string, body: object, token?: string) => {
  const res = request(
    'POST',
    `${url}:${port}/${path}`,
    {
      body: JSON.stringify(body),
      headers: {
        'Content-type': 'application/json',
        token: `${token}`,
      }
    }
  );
  const bodyObj = JSON.parse(res.body as string);
  expect(res.statusCode).toBe(UNAUTHORISED);
  expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  return bodyObj;
}

const http200SuccessPOST = (path: string, body: object, token: string) => {
  const res = request(
    'POST',
    `${url}:${port}/${path}`,
    {
      body: JSON.stringify(body),
      headers: {
        'Content-type': 'application/json',
        token: `${token}`,
      }
    }
  );
  const bodyObj = JSON.parse(String(res.getBody()));
  expect(res.statusCode).toBe(OK);
  return bodyObj;
};
//GET
const http400ErrorGET = (path: string, qs: object, token: string) => {
  const res = request(
    'GET',
    `${url}:${port}/${path}`,
    {
      qs: qs,
      headers: {
        token: `${token}`,
      }
    }
  );
  const bodyObj = JSON.parse(res.body as string);
  expect(res.statusCode).toBe(INPUT_ERROR);
  expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  return bodyObj;
}

const http403ErrorGET = (path: string, qs: object, token: string) => {
  const res = request(
    'GET',
    `${url}:${port}/${path}`,
    {
      qs: qs,
      headers: {
       token: `${token}`,
      }
    }
  );
  const bodyObj = JSON.parse(res.body as string);
  expect(res.statusCode).toBe(UNAUTHORISED);
  expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  return bodyObj;
}

const http200SuccessGET = (path: string, qs: object, token: string) => {
  const res = request(
    'GET',
    `${url}:${port}/${path}`,
    {
      qs: qs,
      headers: {
        token: `${token}`,
      },
    }
  );
  const bodyObj = JSON.parse(String(res.getBody()));
  expect(res.statusCode).toBe(OK);
  return bodyObj;
}

//PUT ERRORS
const http400ErrorPUT = (path: string, qs: object, token: string) => {
  const res = request(
    'PUT',
    `${url}:${port}/${path}`,
    {
      qs: qs,
      headers: {
        token: `${token}`,
      }
    }
  );
  const bodyObj = JSON.parse(res.body as string);
  expect(res.statusCode).toBe(INPUT_ERROR);
  expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  return bodyObj;
};

const http403ErrorPUT = (path: string, qs: object, token: string) => {
  const res = request(
    'PUT',
    `${url}:${port}/${path}`,
    {
      qs: qs,
      headers: {
        token: `${token}`,
      }
    }
  );
  const bodyObj = JSON.parse(res.body as string); 
  expect(res.statusCode).toBe(UNAUTHORISED); 
  expect(bodyObj.error).toStrictEqual({ message: expect.any(String) }); 
  return bodyObj;
};


//DELETE ERRORS 


const http400ErrorDELETE = (path: string, qs: object, token: string) => {
  const res = request(
    'DELETE',
    `${url}:${port}/${path}`,
    {
      qs: qs,
      headers: {
        token: `${token}`,
      }
    }
  );
  const bodyObj = JSON.parse(res.body as string); 
  expect(res.statusCode).toBe(INPUT_ERROR); 
  expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  return bodyObj;
};

const http403ErrorDELETE = (path: string, qs: object, token: string) => {
  const res = request(
    'DELETE',
    `${url}:${port}/${path}`,
    {
      qs: qs,
      headers: {
        token: `${token}`,
      }
    }
  );
  const bodyObj = JSON.parse(res.body as string); 
  expect(res.statusCode).toBe(UNAUTHORISED); 
  expect(bodyObj.error).toStrictEqual({ message: expect.any(String) });
  return bodyObj;
};


//AUTH TEST HELPER FUNCTIONS
const authRegisterPost = (path: string, body: object) => {
  const res = request(
    'POST',
    `${url}:${port}/${path}`,
    {
      body: JSON.stringify(body),
      headers: {
        'Content-type': 'application/json',
      }
    }
  );
  const bodyObj = JSON.parse(String(res.getBody()));
  expect(res.statusCode).toBe(OK);
  return bodyObj;
};

const authLoginPost = (path: string, body: object) => {
  const res = request(
    'POST',
    `${url}:${port}/${path}`,
    {
      body: JSON.stringify(body),
      headers: {
        'Content-type': 'application/json',
      }
    }
  );
  const bodyObj = JSON.parse(String(res.getBody()));
  expect(res.statusCode).toBe(OK);
  return bodyObj;
};

const authLogoutPost = (path: string, body: object, token: string) => {
  const res = request(
    'POST',
    `${url}:${port}/${path}`,
    {
      body: JSON.stringify(body),
      headers: {
        'Content-type': 'application/json',
        token: `${token}`,
      }
    }
  );
  const bodyObj = JSON.parse(String(res.getBody()));
  expect(res.statusCode).toBe(OK);
  return bodyObj;
};

const authPasswordResetRequestPost = (path: string, body: object) => {
  const res = request(
    'POST',
    `${url}:${port}/${path}`,
    {
      body: JSON.stringify(body),
      headers: {
        'Content-type': 'application/json',
      }
    }
  );
  const bodyObj = JSON.parse(String(res.getBody()));
  expect(res.statusCode).toBe(OK);
  return bodyObj;
};

const authPasswordResetPost = (path: string, body: object) => {
  const res = request(
    'POST',
    `${url}:${port}/${path}`,
    {
      body: JSON.stringify(body),
      headers: {
        'Content-type': 'application/json',
      }
    }
  );
  const bodyObj = JSON.parse(String(res.getBody()));
  expect(res.statusCode).toBe(OK);
  return bodyObj;
};

// CHANNEL TEST HELPER FUNCTIONS
const channelDetailsV2Get = (path: string, qs: object, token: string) => {
  const res = request(
    'GET',
    `${url}:${port}/${path}`,
    {
      qs: qs,
      headers: {
        token: `${token}`,
      },
    }
  );
  const bodyObj = JSON.parse(String(res.getBody()));
  expect(res.statusCode).toBe(OK);
  return bodyObj;
};

const channelJoinV2Post = (path: string, body: object, token: string) => {
  const res = request(
    'POST',
    `${url}:${port}/${path}`,
    {
      body: JSON.stringify(body),
      headers: {
        'Content-type': 'application/json',
        token: `${token}`,
      }
    }
  );
  const bodyObj = JSON.parse(String(res.getBody()));
  expect(res.statusCode).toBe(OK);
  return bodyObj;
};

const channelRemoveOwnerV1Post = (path: string, body: object, token: string) => {
  const res = request(
    'POST',
    `${url}:${port}/${path}`,
    {
      body: JSON.stringify(body),
      headers: {
        'Content-type': 'application/json',
        token: `${token}`,
      }
    }
  );
  const bodyObj = JSON.parse(String(res.getBody()));
  expect(res.statusCode).toBe(OK);
  return bodyObj;
};

const channelMessagesGet = (path: string, qs: object, token: string) => {
  const res = request(
    'GET',
    `${url}:${port}/${path}`,
    {
     qs: qs,
     headers: {
      token: `${token}`,
    },
    }
  );
  const bodyObj = JSON.parse(String(res.getBody()));
  expect(res.statusCode).toBe(OK);
  return bodyObj;
};

const channelInvitePost = (path: string, body: object, token: string) => {
  const res = request(
    'POST',
    `${url}:${port}/${path}`,
    {
      body: JSON.stringify(body),
      headers: {
        'Content-type': 'application/json',
        token: `${token}`,
      }
    }
  );
  const bodyObj = JSON.parse(String(res.getBody()));
  expect(res.statusCode).toBe(OK);
  return bodyObj;
};

const channelAddOwnerV1Post = (path: string, body: object, token: string) => {
  const res = request(
    'POST',
    `${url}:${port}/${path}`,
    {
      body: JSON.stringify(body),
      headers: {
        'Content-type': 'application/json',
        token: `${token}`,
      }
    }
  );
  const bodyObj = JSON.parse(String(res.getBody()));
  expect(res.statusCode).toBe(OK);
  return bodyObj;
};

const channelLeaveV1Post = (path: string, body: object, token: string) => {
  const res = request(
    'POST',
    `${url}:${port}/${path}`,
    {
      body: JSON.stringify(body),
      headers: {
        'Content-type': 'application/json',
        token: `${token}`,
      }
    }
  );
  const bodyObj = JSON.parse(String(res.getBody()));
  expect(res.statusCode).toBe(OK);
  return bodyObj;
};

//CHANNELS TEST HELPER FUNCTIONS
const channelsListAllV2Get = (path: string, qs: object, token: string) => {
  const res = request(
    'GET',
    `${url}:${port}/${path}`,
    {
      qs: qs,
      headers: {
        token: `${token}`,
      },
    }
  );
  const bodyObj = JSON.parse(String(res.getBody()));
  expect(res.statusCode).toBe(OK);
  return bodyObj;
};

const channelsListV3Get = (path: string, qs: object, token: string) => {
  const res = request(
    'GET',
    `${url}:${port}/${path}`,
    {
      qs: qs,
      headers: {
        token: `${token}`,
      },
    }
  );
  const bodyObj = JSON.parse(String(res.getBody()));
  expect(res.statusCode).toBe(OK);
  return bodyObj;
};

const channelsCreateV2Post = (path: string, body: object, token: string) => {
  const res = request(
    'POST',
    `${url}:${port}/${path}`,
    {
      body: JSON.stringify(body),
      headers: {
        'Content-type': 'application/json',
        token: `${token}`,
      }
    }
  );
  const bodyObj = JSON.parse(String(res.getBody()));
  expect(res.statusCode).toBe(OK);
  return bodyObj;
};



//DM TEST HELPER FUNCTIONS 

const dmCreatePost = (path: string, body: object, token: string) => {
  const res = request(
    'POST',
    `${url}:${port}/${path}`,
    {
      body: JSON.stringify(body),
      headers: {
        'Content-type': 'application/json',
        token: `${token}`,
      }
    }
  );
  const bodyObj = JSON.parse(String(res.getBody()));
  expect(res.statusCode).toBe(OK);
  return bodyObj;
};

const dmDetailsGet = (path: string, qs: object, token: string) => {
  const res = request(
    'GET',
    `${url}:${port}/${path}`,
    {
      qs: qs,
      headers: {
        token: `${token}`,
      },
    }
  );
  const bodyObj = JSON.parse(String(res.getBody()));
  expect(res.statusCode).toBe(OK);
  return bodyObj;
};

const dmListGet = (path: string, qs: object, token: string) => {
  const res = request(
    'GET',
    `${url}:${port}/${path}`,
    {
      qs: qs,
      headers: {
        token: `${token}`,
      },
    }
  );
  const bodyObj = JSON.parse(String(res.getBody()));
  expect(res.statusCode).toBe(OK);
  return bodyObj;
};

const dmLeaveV1Post = (path: string, body: object, token: string) => {
  const res = request(
    'POST',
    `${url}:${port}/${path}`,
    {
      body: JSON.stringify(body),
      headers: {
        'Content-type': 'application/json',
        token: `${token}`,
      }
    }
  );
  const bodyObj = JSON.parse(String(res.getBody()));
  expect(res.statusCode).toBe(OK);
  return bodyObj;
};

const dmRemoveDelete = (path: string, qs: object, token: string) => {
  const res = request(
    'DELETE',
    `${url}:${port}/${path}`,
    {
      qs: qs,
      headers: {
        token: `${token}`,
      },
      
    }
  );
  const bodyObj = JSON.parse(String(res.getBody()));
  expect(res.statusCode).toBe(OK);
  return bodyObj;
};

const dmMessagesV1Get = (path: string, qs: object, token: string) => {
  const res = request(
    'GET',
    `${url}:${port}/${path}`,
    {
      qs: qs,
      headers: {
        token: `${token}`,
      },
    }
  );
  const bodyObj = JSON.parse(String(res.getBody()));
  expect(res.statusCode).toBe(OK);
  return bodyObj;
};

//USER TEST HELPER FUNCTIONS
const userProfileV3Get = (path: string, qs: object, token: string) => {
  const res = request(
    'GET',
    `${url}:${port}/${path}`,
    {
     qs: qs,
     headers: {
      token: `${token}`,
    },
    }
  );
  const bodyObj = JSON.parse(String(res.getBody()));
  expect(res.statusCode).toBe(OK);
  return bodyObj;
};

const usersAllV1Get = (path: string, qs: object, token: string) => {
  const res = request(
    'GET',
    `${url}:${port}/${path}`,
    {
      qs: qs,
      headers: {
        token: `${token}`,
      },
    }
  );
  const bodyObj = JSON.parse(String(res.getBody()));
  expect(res.statusCode).toBe(OK);
  return bodyObj;
};

const userProfileSetNameV1Put = (path: string, qs: object, token: string) => {
  const res = request(
    'PUT',
    `${url}:${port}/${path}`,
    {
      qs: qs,
      headers: {
        token: `${token}`,
      },
    }
  );
  const bodyObj = JSON.parse(String(res.getBody()));
  expect(res.statusCode).toBe(OK);
  return bodyObj;
};

const userProfileSetEmailV1Put = (path: string, qs: object, token: string) => {
  const res = request(
    'PUT',
    `${url}:${port}/${path}`,
    {
      qs: qs,
      headers: {
        token: `${token}`,
      },
    }
  );
  const bodyObj = JSON.parse(String(res.getBody()));
  expect(res.statusCode).toBe(OK);
  return bodyObj;
};

const userProfileSetHandleV1Put = (path: string, qs: object, token: string) => {
  const res = request(
    'PUT',
    `${url}:${port}/${path}`,
    {
      qs: qs,
      headers: {
        token: `${token}`,
      },
    }
  );
  const bodyObj = JSON.parse(String(res.getBody()));
  expect(res.statusCode).toBe(OK);
  return bodyObj;
};

//MESSAGES TEST HELPER FUNCTIONS
const messageSendV1Post = (path: string, body: object, token: string) => {
  const res = request(
    'POST',
    `${url}:${port}/${path}`,
    {
      body: JSON.stringify(body),
      headers: {
        'Content-type': 'application/json',
        token: `${token}`,
      }
    }
  );
  const bodyObj = JSON.parse(String(res.getBody()));
  expect(res.statusCode).toBe(OK);
  return bodyObj;
};

const messageSendDmV1Post = (path: string, body: object, token: string) => {
  const res = request(
    'POST',
    `${url}:${port}/${path}`,
    {
      body: JSON.stringify(body),
      headers: {
        'Content-type': 'application/json',
        token: `${token}`,
      }
    }
  );
  const bodyObj = JSON.parse(String(res.getBody()));
  expect(res.statusCode).toBe(OK);
  return bodyObj;
};

const messageEditV1Put = (path: string, qs: object, token: string) => {
  const res = request(
    'PUT',
    `${url}:${port}/${path}`,
    {
      qs: qs,
      headers: {
        //'Content-type': 'application/json',
        token: `${token}`,
      }
    }
  );
  const bodyObj = JSON.parse(String(res.getBody()));
  expect(res.statusCode).toBe(OK);
  return bodyObj;
};

const messageRemoveV1Delete = (path: string, qs: object, token: string) => {
  const res = request(
    'DELETE',
    `${url}:${port}/${path}`,
    {
      qs: qs,
      headers: {
        'Content-type': 'application/json',
        token: `${token}`,
      }
    }
  );
  const bodyObj = JSON.parse(String(res.getBody()));
  expect(res.statusCode).toBe(OK);
  return bodyObj;
};

//ADMIN HELPER FUNCTIONS


const adminPermChangePost = (path: string, body: object, token: string) => {
  const res = request(
    'POST',
    `${url}:${port}/${path}`,
    {
      body: JSON.stringify(body),
      headers: {
        'Content-type': 'application/json',
        token: `${token}`,
      }
    }
  );
  const bodyObj = JSON.parse(String(res.getBody()));
  expect(res.statusCode).toBe(OK);
  return bodyObj;
};

const messageReactPOST = (path: string, body: object, token: string) => {
  const res = request(
    'POST',
    `${url}:${port}/${path}`,
    {
      body: JSON.stringify(body),
      headers: {
        'Content-type': 'application/json',
        token: `${token}`,
      }
    }
  );
  const bodyObj = JSON.parse(String(res.getBody()));
  expect(res.statusCode).toBe(OK);
  return bodyObj;
};

const messagePinPOST = (path: string, body: object, token: string) => {
  const res = request(
    'POST',
    `${url}:${port}/${path}`,
    {
      body: JSON.stringify(body),
      headers: {
        'Content-type': 'application/json',
        token: `${token}`,
      }
    }
  );
  const bodyObj = JSON.parse(String(res.getBody()));
  expect(res.statusCode).toBe(OK);
  return bodyObj;
};

const messageUnpinPOST = (path: string, body: object, token: string) => {
  const res = request(
    'POST',
    `${url}:${port}/${path}`,
    {
      body: JSON.stringify(body),
      headers: {
        'Content-type': 'application/json',
        token: `${token}`,
      }
    }
  );
  const bodyObj = JSON.parse(String(res.getBody()));
  expect(res.statusCode).toBe(OK);
  return bodyObj;
};

const messageUnreactPOST = (path: string, body: object, token: string) => {
  const res = request(
    'POST',
    `${url}:${port}/${path}`,
    {
      body: JSON.stringify(body),
      headers: {
        'Content-type': 'application/json',
        token: `${token}`,
      }
    }
  );
  const bodyObj = JSON.parse(String(res.getBody()));
  expect(res.statusCode).toBe(OK);
  return bodyObj;
};

// SEARCH
const searchV1GET = (path: string, qs: object, token: string) => {
  const res = request(
    'GET',
    `${url}:${port}/${path}`,
    {
      qs: qs,
      headers: {
        token: `${token}`,
      },
    }
  );
  const bodyObj = JSON.parse(String(res.getBody()));
  expect(res.statusCode).toBe(OK);
  return bodyObj;
};

//OTHER TEST HELPER FUNCTIONS
const clearV1Delete = (path: string) => {
  const res = request(
    'DELETE',
    `${url}:${port}/${path}`,
  );
  const bodyObj = JSON.parse(String(res.getBody()));
  expect(res.statusCode).toBe(OK);
  return bodyObj;
};

export {
  http403ErrorPOST,
  http400ErrorPOST,
  http200SuccessPOST,
  http403ErrorGET,
  http400ErrorGET,
  http200SuccessGET,
  http403ErrorPUT,
  http400ErrorPUT,
  http400ErrorDELETE,
  http403ErrorDELETE,
  errorMsg,
  authRegisterPost,
  authLoginPost,
  authLogoutPost,
  authPasswordResetRequestPost,
  authPasswordResetPost,
  channelAddOwnerV1Post,
  channelDetailsV2Get,
  channelJoinV2Post,
  channelRemoveOwnerV1Post,
  channelMessagesGet,
  channelInvitePost,
  channelLeaveV1Post,
  channelsListAllV2Get,
  channelsListV3Get,
  channelsCreateV2Post,
  dmCreatePost,
  dmDetailsGet,
  dmListGet,
  dmRemoveDelete,
  dmLeaveV1Post,
  userProfileV3Get,
  dmMessagesV1Get,
  usersAllV1Get,
  userProfileSetNameV1Put,
  userProfileSetEmailV1Put,
  userProfileSetHandleV1Put,
  messageSendV1Post,
  messageSendDmV1Post,
  messageEditV1Put,
  messageRemoveV1Delete,
  adminPermChangePost,
  messageReactPOST,
  messagePinPOST,
  messageUnpinPOST,
  messageUnreactPOST,
  searchV1GET,
  clearV1Delete,
}
export interface authUserId {
  token: string;
  authUserId: number;
}

export interface channelId {
  channelId: number;
}

export interface dmId {
    dmId: number;
}

export interface user {
  uId: number,
  handleStr: string,
  nameFirst: string;
  nameLast: string;
  email: string;
  password?: string;
  permissionId?: number;
  userSessions?: {
    token?: string;
  }[];
  notifications?:
      {
        channelId?: number,
        dmId?: number,
        notificationMessage?: string
      }[],
  resetTempCode?: string;
}

export interface channelList {
  channels: {
    channelId: number;
    name: string;
  }[];

}

export interface channel {
  channelId: number;
  name: string;
  isPublic: boolean;
  ownerMembers: [{
    uId: number;
    email: string;
    nameFirst: string;
    nameLast: string;
    handleStr: string;
  }],
  allMembers: [{
    uId: number;
    email: string;
    nameFirst: string;
    nameLast: string;
    handleStr: string;
  }];
  messages:
    {
      messageId?: number;
      uId?: number;
      message?: string;
      timeSent?: number;
      reacts?:
        {
          reactId?: number;
          uIds?: {uId?: number}[];
          isThisUserReacted?: boolean;
        }[];
      isPinned: boolean;
    }[];
  standUp:
    {
      isActive: boolean;
      timeFinish: number;
      starterUserId: number
    }
}

export interface messageId {
    messageId: number;
}

export interface channelDetails {
  name: string;
  isPublic: boolean;
  ownerMembers: {
    uId: number;
    email: string;
    nameFirst: string;
    nameLast: string;
    handleStr: string;
  }[],
  allMembers: {
    uId: number;
    email: string;
    nameFirst: string;
    nameLast: string;
    handleStr: string;
  }[];
}

export interface dm {
  dmId: number;
  name: string;
  isPublic: boolean;
  ownerMembers: {
    uId: number;
    email: string;
    nameFirst: string;
    nameLast: string;
    handleStr: string;
  }[];
  allMembers?: {
    uId: number;
    email: string;
    nameFirst: string;
    nameLast: string;
    handleStr: string;
  }[];
  messages:
    {
      messageId?: number;
      uId?: number;
      message?: string;
      timeSent?: number;
      reacts?:
        {
          reactId?: number;
          uIds?: {uId?: number}[];
          isThisUserReacted?: boolean;
        }[];
      isPinned?: boolean;
    }[];
}

export interface dataInterface {
  users: user[];
  channels: channel[];
  dms: dm[];
}

export interface error {
  error: string;
}

export interface usersArrayInfo {
  users: {
    uId: number;
    handleStr: string;
    nameFirst: string;
    nameLast: string;
    email: string;
  }[];
}

export interface userInfo {
  user: {
    uId: number;
    handleStr: string;
    nameFirst: string;
    nameLast: string;
    email: string;
  };
}

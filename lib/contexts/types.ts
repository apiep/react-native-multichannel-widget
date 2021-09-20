import QiscusSDK, { Message, Room, User } from 'qiscus-sdk-core';

export type { QiscusSDK, Message, Room, User };
export type IUseCurrentChatRoom = {
  room?: Room;
  messages: Message[];
  sendMessage(message: Message): Promise<Message>;
  deleteMessage(messageUniqueIds: string[]): Promise<Message[]>;
  loadMoreMessages(lastMessageId: number): Promise<Message[]>;
};

export type IUseMultichannelWidget = {};

export type SetupOptions = {
  baseURLMultichannel: string;
  baseURLSdk?: string;
  mqttURLSdk?: string;
  brokerLbUrlSdk?: string;
  uploadUrlSdk?: string;
};

export type AppState = {
  title: string;
  subtitle: string;
  avatar: string;
  progressUploading: string | number;
  attachment: {
    type: string;
    value: string;
    payload: any;
  };
  typingStatus: boolean;
  unReadCount: number;
  roomId: number | null;
  loginChecked: boolean;
  currentUser: User | null;
  loginMessage: string | null;
  replayMessage: object | null;
  messageExtras: object | null;
};


export type InitiateChatOptions = {
  userId: string;
  name: string;
  deviceId: string;
  extras?: Record<string, any>;
  additionalInfo?: Record<string, any>;
  messageExtras?: Record<string, any>;
  channelId?: string;
};

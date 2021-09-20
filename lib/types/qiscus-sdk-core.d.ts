declare module 'qiscus-sdk-core' {
  export interface Room {
    id: number;
    last_comment_id: number;
    last_comment_message: string;
    avatar: string;
    name: string;
    room_type: string;
    participants: Participant[];
    options: string;
    topics: any[];
    comments: Message[];
    count_notif: number;
    unique_id: number;
  }
  export interface Message {
    id: number;
    unique_temp_id: string;
    unique_id: string;
    message: string;
    status: string;
    type: string;
    user_id: string;
    username: string;
    timestamp: string;
    comment_before_id: number;
    is_deleted: boolean;
    is_public_channel: boolean;
    payload: object;
    extras: Record<string, any>;
    room_avatar: string;
    room_id: number;
    room_name: string;
    room_type: string;
    topic_id: string;
    unix_timestamp: number;
    unix_nano_timestamp: number;
  }

  export interface Participant {
    id: number;
    username: string;
    avatar_url: string;
    email: string;
    extras: object;
    last_comment_read_id: number;
    last_comment_received_id: number;
  }

  export interface User {
    avatar_url: string;
    email: string;
    username: string;
    id: number;
    extras: object;
    token: string;
    last_comment_id: number;
    last_sync_event_id: number;
  }

  export interface InitOptions {
    AppId: string;
    options?: {
      loginSuccessCallback?: (user: { user: User }) => void;
      newMessagesCallback?: (messages: Message[]) => void;
      commentDeliveredCallback?: (message: {
        comment: Message;
        userId: string;
      }) => void;
      commentReadCallback?: (message: {
        comment: Message;
        userId: string;
      }) => void;
      commentDeletedCallback?: (data: {
        roomId: string;
        commentUniqueIds: string[];
        isHard: boolean;
        isForEveryone: boolean;
      }) => void;
      typingCallback?: (data: {
        message: string;
        username: string;
        room_id: number;
      }) => void;
      presenceCallback?: (data: string) => void;
      roomClearedCallback?: (data: any) => void;
      onReconnectCallback?: () => void;
    };
  }
  export interface LoadCommentsOptions {
    last_comment_id?: number;
    limit?: number;
    after?: boolean;
  }
  export type Progress = { percent: number; total: number; loaded: number };
  export default class QiscusSDK {
    get AppId(): string;
    get userData(): User | null;
    get selected(): Room | null;

    init(options: InitOptions): Promise<void>;
    setUser(
      userId: string,
      userKey: string,
      displayName?: string,
      avatarUrl?: string,
      extras?: Record<string, any>
    ): Promise<{ user: User }>;
    chatUser(userId: string): Promise<Room>;
    sendComment(
      roomId: number,
      text: string,
      uniqueId?: string,
      type?: string,
      payload?: string,
      extras?: Record<string, any>
    ): Promise<Message>;
    loadComments(
      roomId: number,
      options?: LoadCommentsOptions
    ): Promise<Message[]>;
    clearRoomMessages(
      roomUniqueIds: string[]
    ): Promise<{ results: { rooms: Room[] } }>;
    deleteComment(
      roomId: number,
      messageUniqueIds: string[]
    ): Promise<{ results: { comments: Message[] } }>;
    getTotalUnreadCount(): Promise<number>;
    getRoomById(roomId: number): Promise<Room>;
    getNonce(): Promise<{ expired_at: number; nonce: string }>;
    verifyIdentityToken(identityToken: string): Promise<{ user: User }>;
    setUserWithIdentityToken(userData: { user: User }): void;
    disconnect(): void;
    exitChatRoom(): void;
    registerDeviceToken(token: string): Promise<void>;
    removeDeviceToken(token: string): Promise<void>;
    upload(
      file: File,
      callback: (error?: Error, progress?: Progress, url?: string) => void
    ): Promise<void>;
    publishTyping(isTyping: number): void;

    generateMessage(data: {
      roomId: number;
      text: string;
      extras?: Record<string, any>;
    }): Message;
    generateFileAttachmentMessage(data: {
      roomId: number;
      url: string;
      caption?: string;
      text?: string;
      extras?: Record<string, any>;
      filename?: string;
      size?: number;
    }): Message;
    generateReplyMessage(data: {
      roomId: number;
      text: string;
      repliedMessage: Message;
      extras?: Record<string, any>;
    }): Message;
    generateCustomMessage(data: {
      roomId: number;
      text: string;
      payload: Record<string, any>;
      extras?: Record<string, any>;
    }): Message;
  }
}

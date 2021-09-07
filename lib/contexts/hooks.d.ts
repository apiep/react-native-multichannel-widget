import QiscusSDK from 'qiscus-sdk-core';
import type QiscusSDK, { Message, Room, User } from 'qiscus-sdk-core';

export function useCurrentChatRoom(): UseCurrentChatRoom;

interface UseCurrentChatRoom {
	room: Room;
	messages: Message[];
	sendMessage(message: Message): Promise<Message>;
	loadMoreMessages(lastMessageId?: number): Promise<Message[]>;
	deleteMessage: ReturnType<typeof useDeleteMessage>;
}

export function useQiscus(): QiscusSDK;
export function useCurrentChatRoom(): UseCurrentChatRoom;
export function useCurrentUser(): User;
export function useAppState(): AppState;
export function useOnMessageReceived(cb: (message: Message) => void): void;
export function useOnMessageRead(cb: (message: Message) => void): void;
export function useOnMessageDelivered(cb: (message: Message) => void): void;
export function useGetUnreadCount(): () => Promise<number>;
export function useUpdateRoomInfo(): () => Promise<void>;
export function useInitiateChat(): (InitiateChatOptions) => Promise<User>;
export function useDeleteMessage(): (messageUniqueIds: string[]) => Promise<Message[]>;
export function useEndSession(): () => Promise<void>;
export function useSetup(): (appId: string, options?: SetupOptions) => Promise<void>;
export function useOnLoginSuccess(cb: (userData: { user: User }) => void): void;

export type InitiateChatOptions = {
	userId: string;
	name: string;
	deviceId: string;
	extras?: Record<string, any>;
	additionalInfo?: Record<string, any>;
	messageExtras?: Record<string, any>;
	channelId?: string;
};

interface AppState {
	title: string;
	subtitle: string;
	avatar: string;
	progressUploading: string | number;
	attachment: {
		type: string;
		url: string;
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
}

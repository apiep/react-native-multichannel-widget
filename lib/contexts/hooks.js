import { useRef } from 'react';
import { useAtom } from 'jotai';
import { useAtomValue, useAtomCallback, useUpdateAtom } from 'jotai/utils';
import mitt from 'mitt';

import QiscusSDK from 'qiscus-sdk-core';
import { useEffect } from 'react';
import state, {
	accountAtom,
	appStateAtom,
	avatarAtom,
	loginCheckedAtom,
	messageExtrasAtom,
	messagesAtom,
	messagesListAtom,
	optionsAtom,
	qiscusAtom,
	roomAtom,
	roomIdAtom,
	subtitleAtom,
	typingStatusAtom,
	unreadCountAtom,
} from './state';
import axios from 'axios';

const events = mitt();
const event = {
	messageReceived: 'events::message-received',
	messageRead: 'events::message-read',
	messageDelivered: 'events::message-delivered',
	messageDeleted: 'events::message-deleted',
	onUserPresence: 'events::user-presence',
	onUserTyping: 'events::user-typing',
	onUserLoggedIn: 'events::user-login-success',
};

/** @return {QiscusSDK} */
export function useQiscus() {
	return useAtomValue(qiscusAtom);
}

/** @returns {User} */
export function useCurrentUser() {
	return useAtomValue(accountAtom);
}

/**
 * @returns {{
 *   room: Room,
 *   messages: Message[],
 *   sendMessage: (message: Message) => Promise<Message>,
 *   deleteMessage: (messageUniqueId: string[]) => Promise<Message[]>,
 *   loadMoreMessages: (lastMessageId: number) => Promise<Message[]>,
 * }}
 */
export function useCurrentChatRoom() {
	const room = useAtomValue(roomAtom);
	const messages = useAtomValue(messagesListAtom);

	const sendMessage = useSendMessage();
	const deleteMessage = useDeleteMessage();
	const loadMoreMessages = useLoadMoreMessages();

	return {
		room,
		messages,
		sendMessage,
		deleteMessage,
		loadMoreMessages,
	};
}

export function useMessages() {
	return useAtomValue(messagesAtom);
}

export function useMultichannelWidget() {}

/**
 * @returns {(message: Message) => Promise<Message>}
 */
export function useSendMessage() {
	const qiscus = useQiscus();

	return useAtomCallback(async (get, set, message) => {
		let roomId = get(roomAtom).id;
		let uniqueId = message.unique_id ?? message.unique_temp_id;

		if (message.message == null) {
			throw new Error('Message text can not be empty')
		}

		console.log('@sendMessage', message)
		let m = await qiscus.sendComment(
			roomId ?? message.room_id,
			message.message,
			uniqueId,
			message.type,
			JSON.stringify(message.payload),
			message.extras
		);

		set(messagesAtom, (msg) => ({ ...msg, [m.unique_id]: m }));

		return m;
	});
}

/**
 * @returns {(messageUniqueId: string[]) => Promise<Message[]>}
 */
export function useDeleteMessage() {
	let qiscus = useQiscus();
	return useAtomCallback(async (get, set, messageUniqueIds) => {
		let roomId = get(roomAtom).id;
		let data = await qiscus.deleteComment(roomId, messageUniqueIds);

		set(messagesAtom, (items) => {
			// remove item from items if it's in messageUniqueIds
			let newItems = {};
			for (let key in items) {
				if (!messageUniqueIds.includes(key)) {
					newItems[key] = items[key];
				}
			}

			return newItems;
		});

		return data.results.comments;
	});
}

/**
 * @returns {(lastMessageId: number) => Promise<Message[]>}
 */
export function useLoadMoreMessages() {
	let qiscus = useQiscus();
	return useAtomCallback(async (get, set, lastMessageId) => {
		let room = get(roomAtom);
		if (room == null) return [];

		let messages = await qiscus.loadComments(room.id, {
			last_comment_id: lastMessageId,
			limit: 20,
			after: false,
		});

		// add messages to messagesAtom
		set(messagesAtom, (items) => {
			let newItems = { ...items };
			messages.forEach((m) => (newItems[m.unique_id] = m));
			return newItems;
		});

		return messages;
	});
}

/**
 * @param {(message: Message) => void | undefined} cb
 */
export function useOnMessageReceived(cb) {
	/** @type {(messages: Message[]) => void} */
	let listener = useAtomCallback((get, set, messages) => {
		if (!Array.isArray(messages)) messages = [messages];

		messages = messages.map(m => {
			m.unique_id = m.unique_id ?? m.unique_temp_id;
			return m
		})

		set(messagesAtom, (items) => {
			let newItems = { ...items };
			messages.forEach((m) => (newItems[m.unique_id] = m));

			return newItems;
		});

		if (cb != null) messages.forEach((m) => cb?.(m));
	});

	useEffect(() => {
		events.on(event.messageReceived, listener);
		return () => events.off(event.messageReceived, listener);
	}, [cb, listener]);
}

/**
 * @param {(message: Message) => void | undefined} cb
 */
export function useOnMessageRead(cb) {
	/** @type {(data: {comment: Message, userId: string}) => void} */
	let listener = useAtomCallback((get, set, data) => {
		let comment = data.comment;

		set(messagesAtom, (items) => {
			let newItems = {};
			for (let key in items) {
				newItems[key] = items[key];

				if (newItems[key].status !== 'read' && newItems[key].id < comment.id) {
					newItems[key].status = 'read';
					cb(newItems[key]);
				}
			}

			return newItems;
		});
	});

	useEffect(() => {
		events.on(event.messageRead, listener);
		return () => events.off(event.messageRead, listener);
	}, [cb, listener]);
}

/**
 * @param {(message: Message) => void | undefined} cb
 */
export function useOnMessageDelivered(cb) {
	/** @type {(data: {comment: Message, userId: string}) => void} */
	let listener = useAtomCallback((get, set, data) => {
		let comment = data.comment;

		set(messagesAtom, (items) => {
			let newItems = {};
			for (let key in items) {
				newItems[key] = items[key];

				if (newItems[key].status !== 'read' && newItems[key].status !== 'delivered' && newItems[key].id < comment.id) {
					newItems[key].status = 'delivered';
					cb(newItems[key]);
				}
			}

			return newItems;
		});
	});

	useEffect(() => {
		events.on(event.messageRead, listener);
		return () => events.off(event.messageRead, listener);
	}, [cb, listener]);
}

/**
 * @param {(message: Message) => void | undefined} cb
 */
export function useOnMessageDeleted(cb) {
	/** @type {(data: {roomId: string, commentUniqueIds: string[], isHard: boolean, isForEveryone: boolean}) => void} */
	let listener = useAtomCallback((get, set, data) => {
		let commentUniqueIds = data.commentUniqueIds;

		set(messagesAtom, (items) => {
			let newItems = {};
			for (let key in items) {
				if (!commentUniqueIds.includes(key)) {
					newItems[key] = items[key];
				} else {
					cb(items[key]);
				}
			}

			return newItems;
		});
	});

	useEffect(() => {
		events.on(event.messageDeleted, listener);
		return () => events.off(event.messageDeleted, listener);
	}, [cb, listener]);
}

/**
 * @param {(roomId: number, userId: string, isTyping: boolean) => void | undefined} cb
 */
export function useOnUserTyping(cb) {
	/** @type {(data: {message: string, username: string, room_id: number}) => void} */
	let listener = useAtomCallback((get, set, data) => {
		const room = get(roomAtom);
		let isTyping = data.message === '1';

		cb(data.room_id, data.username, isTyping);

		set(typingStatusAtom, (_) => {
			if (data.room_id === room.id) return isTyping;
			return false;
		});
	});

	useEffect(() => {
		events.on(event.userTyping, listener);
		return () => events.off(event.userTyping, listener);
	}, [cb, listener]);
}

/**
 * @returns {(appId: string, options?: SetupOptions) => Promise<void>}
 */
export function useSetup() {
	let qiscus = useQiscus();
	let roomId = useAtomValue(roomIdAtom);
	let setTyping = useUpdateAtom(typingStatusAtom);

	/** @type {React.MutableRefObject<any>} */
	let typingId = useRef();

	useOnUserTyping((_roomId) => {
		if (typingId.current != null) clearTimeout(typingId.current);
		typingId.current = setTimeout(() => {
			setTyping(false);
		}, 5000);

		if (_roomId === roomId) {
			setTyping(true);
		}
	});
	useOnMessageReceived();
	useOnMessageRead();
	useOnMessageDelivered();

	/** @type {(arg: { appId: string, options: SetupOptions }) => Promise<void>} */
	let cb = useAtomCallback(async (get, set, arg) => {
		let { appId, options } = arg;
		set(optionsAtom, (opts) => ({ ...opts, ...options }));

		await qiscus.init({
			AppId: appId,
			options: {
				newMessagesCallback: (messages) => messages.forEach((m) => events.emit(event.messageReceived, m)),
				commentReadCallback: (message) => events.emit(event.messageRead, message),
				commentDeliveredCallback: (message) => events.emit(event.messageDelivered, message),
				commentDeletedCallback: (message) => events.emit(event.messageDeleted, message),
				typingCallback: (data) => events.emit(event.onUserTyping, data),
				loginSuccessCallback: (data) => events.emit(event.onUserLoggedIn, data),
			},
		});
		// qiscus.debugMode = true
		// qiscus.debugMQTTMode = true
	});

	return (appId, options) => cb({ appId, options });
}

export function useGetUnreadCount() {
	let cb = useAtomCallback(async (get, set, arg) => {
		let unreadCount = await get(qiscusAtom).getTotalUnreadCount();
		set(unreadCountAtom, unreadCount);

		return unreadCount;
	});

	return cb;
}

export function useUpdateRoomInfo() {
	let qiscus = useQiscus();
	let cb = useAtomCallback(async (get, set) => {
		let roomId = get(roomIdAtom);
		let room = await qiscus.getRoomById(roomId);
		let currentUser = get(accountAtom);

		set(roomAtom, (item) => ({ ...item, ...room }));
		set(messagesAtom, (items) => {
			let newItems = { ...items };
			room.comments?.forEach((comment) => {
				newItems[comment.unique_id] = comment;
			});

			return newItems;
		});

		let subtitle = [];
		let avatar = room.avatar;
		room.participants.forEach((participant) => {
			if (participant.email === currentUser.email) {
				subtitle.unshift(`You`);
			} else {
				const type = participant.extras?.type;
				if (type === 'agent') {
					avatar = participant.avatar_url;
				}
				subtitle.push(participant.username);
			}
		});

		set(subtitleAtom, subtitle.join(', '));
		set(avatarAtom, avatar);

		return room;
	});

	return cb;
}

export function useInitiateChat() {
	let qiscus = useQiscus();
	let opts = useAtomValue(optionsAtom);
	let updateRoomInfo = useUpdateRoomInfo();

	/** @type {(arg: InitiateChatOptions) => Promise<User>} */
	let cb = useAtomCallback(async (get, set, arg) => {
		let { nonce } = await qiscus.getNonce();

		let data = {
			app_id: qiscus.AppId,
			user_id: arg.userId,
			name: arg.name,
			sdk_user_extras: arg.extras,
			user_properties: arg.additionalInfo,
			nonce,
		};

		if (arg.channelId != null) data.channelId = arg.channelId;

		/*
    if (options?.userId) userId = options?.userId
    if (options?.name) name = options?.name
    if (options?.deviceId) firebaseDeviceId = options?.deviceId
    if (options?.extras) extras = options?.extras
    if (options?.additionalInfo) additionalInfo = options?.additionalInfo
    if (options?.messageExtras) messageExtras = options?.messageExtras
    if (options?.channelId) channelId = options?.channelId
    */

		let baseUrl = opts.baseURLMultichannel;
		let resp = await axios.post(`${baseUrl}/api/v2/qiscus/initiate_chat`, data).then((r) => r.data.data);

		let { identity_token, customer_room } = resp;
		let roomId = customer_room.room_id;

		let userData = await qiscus.verifyIdentityToken(identity_token);

		qiscus.setUserWithIdentityToken(userData);

		// A hack so we will trully wait for the user to be ready
		await new Promise((resolve) => events.on(event.onUserLoggedIn, resolve));

		if (arg.deviceId != null) {
			await qiscus.registerDeviceToken(arg.deviceId);
		}

		set(roomIdAtom, roomId);
		set(messageExtrasAtom, arg.messageExtras);
		set(loginCheckedAtom, true);
		set(accountAtom, (_) => userData.user);

		await updateRoomInfo();

		return userData.user;
	});

	return cb;
}

export function useEndSession() {
	let qiscus = useQiscus();
	return useAtomCallback((get, set, arg) => {
		// set(appStateAtom, (_) => state)
		qiscus.exitChatRoom();
		// qiscus.disconnect()
	});
}

export function useRemoveNotification() {
	let qiscus = useQiscus();

	/** @type {(deviceId: string) => Promise<void>} */
	let cb = useAtomCallback(async (get, set, arg) => {
		await qiscus.removeDeviceToken(arg);
	});

	return cb;
}

/** @type {(cb: (userData: { user: User }) => void) => void} */
export function useOnLoginSuccess(cb) {
	useEffect(() => {
		events.on(event.onUserLoggedIn, cb);
		return events.off(event.onUserLoggedIn, cb);
	}, [cb]);
}

/** @type {() => AppState} */
export function useAppState() {
	return useAtomValue(appStateAtom);
}

/**
 * @typedef {import('qiscus-sdk-core').User} User
 */
/**
 * @typedef {import('qiscus-sdk-core').Room} Room
 */
/**
 * @typedef {import('qiscus-sdk-core').Message} Message
 */

/**
 * @typedef {object} SetupOptions
 * @property {string} baseURLMultichannel
 * @property {string | undefined} baseURLSdk
 * @property {string | undefined} mqttURLSdk
 * @property {string | undefined} brokerLbUrlSdk
 * @property {string | undefined} uploadUrlSdk
 */

/**
 * @typedef {object} AppStates
 * @property {string} title
 * @property {string} subtitle
 * @property {string} avatar
 * @property {string | number} progressUploading
 * @property {object} attachment
 * @property {string} attachment.type
 * @property {string} attachment.url
 * @property {any} attachment.payload
 * @property {boolean} typingStatus
 * @property {number} unReadCount
 * @property {number | null} roomId
 * @property {boolean} loginChecked
 * @property {User | null} currentUser
 * @property {string | null} loginMessage
 * @property {object | null} replayMessage
 */

/**
 * @typedef {{
 *  title: string,
 *  subtitle: string,
 *  avatar: string,
 *  progressUploading: string | number,
 *  attachment: {
 *    type: string,
 *    url: string,
 *    payload: any,
 *  },
 *  typingStatus: boolean,
 *  unReadCount: number,
 *  roomId: number | null,
 *  loginChecked: boolean,
 *  currentUser: User | null,
 *  loginMessage: string | null,
 *  replayMessage: object | null,
 *  messageExtras: object | null,
 * }} AppState
 */

import axios from 'axios'
import {
  useAtomCallback,
  useAtomValue,
  useResetAtom,
  useUpdateAtom,
} from 'jotai/utils'
import mitt, { Emitter } from 'mitt'
import { MutableRefObject, useEffect, useRef } from 'react'
import {
  accountAtom,
  appStateAtom,
  attachmentAtom,
  avatarAtom,
  loginMessageAtom,
  messageExtrasAtom,
  messagesAtom,
  messagesListAtom,
  optionsAtom,
  progressUploadingAtom,
  qiscusAtom,
  replayMessageAtom,
  roomAtom,
  roomIdAtom,
  subtitleAtom,
  titleAtom,
  typingStatusAtom,
  unreadCountAtom,
} from './state'
import type {
  AppState,
  InitiateChatOptions,
  IUseCurrentChatRoom,
  Message,
  QiscusSDK,
  SetupOptions,
  User,
} from './types'

type Events = {
  'events::message-received': Message
  'events::message-read': { comment: Message; userId: string }
  'events::message-delivered': { comment: Message; userId: string }
  'events::message-deleted': {
    roomId: string
    commentUniqueIds: string[]
    isHard: boolean
    isForEveryone: boolean
  }
  'events::user-presence': string
  'events::user-typing': { message: string; username: string; room_id: number }
  'events::user-login-success': { user: User }
}
const events = mitt<Events>()
const event = {
  messageReceived: 'events::message-received',
  messageRead: 'events::message-read',
  messageDelivered: 'events::message-delivered',
  messageDeleted: 'events::message-deleted',
  onUserPresence: 'events::user-presence',
  onUserTyping: 'events::user-typing',
  onUserLoggedIn: 'events::user-login-success',
} as const

export function useQiscus(): QiscusSDK {
  return useAtomValue(qiscusAtom)
}

export function useCurrentUser(): User | undefined {
  let user = useAtomValue(accountAtom)
  return user
}

export function useCurrentChatRoom(): IUseCurrentChatRoom {
  const room = useAtomValue(roomAtom)
  const messages = useAtomValue(messagesListAtom)

  const sendMessage = useSendMessage()
  const deleteMessage = useDeleteMessage()
  const loadMoreMessages = useLoadMoreMessages()

  return {
    room,
    messages,
    sendMessage,
    deleteMessage,
    loadMoreMessages,
  }
}

export function useMessages(): Record<string, Message> {
  return useAtomValue(messagesAtom)
}

export function useMultichannelWidget() {}

export function useSendMessage(): (message: Message) => Promise<Message> {
  const qiscus = useQiscus()

  return useAtomCallback(async (get, set, message) => {
    let roomId = get(roomAtom)?.id
    let uniqueId = message.unique_id ?? message.unique_temp_id

    if (message.message == null) {
      throw new Error('Message text can not be empty')
    }

    let m = await qiscus.sendComment(
      roomId ?? message.room_id,
      message.message,
      uniqueId,
      message.type,
      JSON.stringify(message.payload),
      message.extras
    )

    set(messagesAtom, (msg) => ({ ...msg, [m.unique_id]: m }))

    return m
  })
}

export function useDeleteMessage(): (
  messageUniqueIds: string[]
) => Promise<Message[]> {
  let qiscus = useQiscus()
  return useAtomCallback(async (get, set, messageUniqueIds) => {
    let roomId = get(roomAtom)!.id
    let data = await qiscus.deleteComment(roomId, messageUniqueIds)

    set(messagesAtom, (items) => {
      // remove item from items if it's in messageUniqueIds
      let newItems = {} as Record<string, Message>
      for (let key in items) {
        if (!messageUniqueIds.includes(key)) {
          newItems[key] = items[key]
        }
      }

      return newItems
    })

    return data.results.comments
  })
}

export function useLoadMoreMessages(): (
  lastMessageId: number
) => Promise<Message[]> {
  let qiscus = useQiscus()
  return useAtomCallback(async (get, set, lastMessageId) => {
    let room = get(roomAtom)
    if (room == null) return []

    let messages = await qiscus.loadComments(room.id, {
      last_comment_id: lastMessageId,
      limit: 20,
      after: false,
    })

    // add messages to messagesAtom
    set(messagesAtom, (items) => {
      messages.forEach((m) => (items[m.unique_id ?? m.unique_temp_id] = m))
      return items
    })

    return messages
  })
}

export function useOnMessageReceived(cb?: (message: Message) => void): void {
  let listener = useAtomCallback((get, set, items: Message | Message[]) => {
    let messages = [items].flat()

    messages = messages.map((m) => {
      m.unique_id = m.unique_id ?? m.unique_temp_id
      return m
    })

    set(messagesAtom, (items) => {
      let newItems = { ...items }
      messages.forEach((m: Message) => (newItems[m.unique_id] = m))

      return newItems
    })

    if (cb != null) messages.forEach((m: Message) => cb?.(m))
  })

  useEffect(() => {
    events.on(event.messageReceived, listener)
    return () => events.off(event.messageReceived, listener)
  }, [cb, listener])
}

export function useOnMessageRead(cb?: (message: Message) => void): void {
  let listener = useAtomCallback(
    (get, set, data: { comment: Message; userId: string }) => {
      let comment = data.comment

      set(messagesAtom, (items) => {
        let newItems = {} as Record<string, Message>
        for (let key in items) {
          newItems[key] = items[key]

          if (
            newItems[key].status !== 'read' &&
            newItems[key].id < comment.id
          ) {
            newItems[key].status = 'read'
            cb?.(newItems[key])
          }
        }

        return newItems
      })
    }
  )

  useEffect(() => {
    events.on(event.messageRead, listener)
    return () => events.off(event.messageRead, listener)
  }, [cb, listener])
}

export function useOnMessageDelivered(cb?: (message: Message) => void): void {
  let listener = useAtomCallback(
    (get, set, data: { comment: Message; userId: string }) => {
      let comment = data.comment

      set(messagesAtom, (items) => {
        let newItems = {} as Record<string, Message>
        for (let key in items) {
          newItems[key] = items[key]

          if (
            newItems[key].status !== 'read' &&
            newItems[key].status !== 'delivered' &&
            newItems[key].id < comment.id
          ) {
            newItems[key].status = 'delivered'
            cb?.(newItems[key])
          }
        }

        return newItems
      })
    }
  )

  useEffect(() => {
    events.on(event.messageRead, listener)
    return () => events.off(event.messageRead, listener)
  }, [cb, listener])
}

export function useOnMessageDeleted(cb?: (message: Message) => void): void {
  type IData = {
    roomId: string
    commentUniqueIds: string[]
    isHard: boolean
    isForEveryone: boolean
  }
  let listener = useAtomCallback((get, set, data: IData) => {
    let commentUniqueIds = data.commentUniqueIds

    set(messagesAtom, (items) => {
      let newItems = {} as Record<string, Message>
      for (let key in items) {
        if (!commentUniqueIds.includes(key)) {
          newItems[key] = items[key]
        } else {
          cb?.(items[key])
        }
      }

      return newItems
    })
  })

  useEffect(() => {
    events.on(event.messageDeleted, listener)
    return () => events.off(event.messageDeleted, listener)
  }, [cb, listener])
}

export function useOnUserTyping(
  cb?: (roomId: number, userId: string, isTyping: boolean) => void
) {
  type IData = {
    message: string
    username: string
    room_id: number
  }
  let listener = useAtomCallback((get, set, data: IData) => {
    const room = get(roomAtom)
    let isTyping = data.message === '1'

    cb?.(data.room_id, data.username, isTyping)

    set(typingStatusAtom, (_) => {
      if (data.room_id === room?.id) return isTyping
      return false
    })
  })

  useEffect(() => {
    events.on(event.onUserTyping, listener)
    return () => events.off(event.onUserTyping, listener)
  }, [cb, listener])
}

export function useSetup(): (
  appId: string,
  options?: SetupOptions
) => Promise<void> {
  let qiscus = useQiscus()
  let roomId = useAtomValue(roomIdAtom)
  let setTyping = useUpdateAtom(typingStatusAtom)

  let typingId: MutableRefObject<any> = useRef()

  useOnUserTyping((_roomId) => {
    if (typingId.current != null) clearTimeout(typingId.current)
    typingId.current = setTimeout(() => {
      setTyping(false)
    }, 5000)

    if (_roomId === roomId) {
      setTyping(true)
    }
  })
  useOnMessageReceived()
  useOnMessageRead()
  useOnMessageDelivered()

  let cb = useAtomCallback(
    async (get, set, arg: { appId: string; options?: SetupOptions }) => {
      let { appId, options } = arg
      set(optionsAtom, (opts) => ({ ...opts, ...options }))

      await qiscus.init({
        AppId: appId,
        options: {
          newMessagesCallback: (messages) =>
            messages.forEach((m) => events.emit('events::message-received', m)),
          commentReadCallback: (message) =>
            events.emit('events::message-read', message),
          commentDeliveredCallback: (message) =>
            events.emit('events::message-delivered', message),
          commentDeletedCallback: (message) =>
            events.emit('events::message-deleted', message),
          typingCallback: (data) => events.emit('events::user-typing', data),
          loginSuccessCallback: (data) =>
            events.emit('events::user-login-success', data),
        },
      })
      // qiscus.debugMode = true
      // qiscus.debugMQTTMode = true
    }
  )

  return (appId, options) => cb({ appId, options })
}

export function useGetUnreadCount() {
  let cb = useAtomCallback(async (get, set) => {
    let qiscus = get(qiscusAtom)
    let unreadCount = await qiscus.getTotalUnreadCount()
    set(unreadCountAtom, unreadCount)

    return unreadCount
  })

  return cb
}

export function useUpdateRoomInfo() {
  let qiscus = useQiscus()
  // let roomId = useAtomValue(roomIdAtom);

  let cb = useAtomCallback(async (get, set) => {
    let roomId = get(roomIdAtom)

    if (roomId == null) return null

    let room = await qiscus.getRoomById(roomId!)
    let currentUser = get(accountAtom)

    set(roomAtom, (item) => ({ ...item, ...room }))
    set(messagesAtom, (items) => {
      let newItems = { ...items }
      room.comments?.forEach((comment) => {
        newItems[comment.unique_id] = comment
      })

      return newItems
    })

    let subtitle: string[] = []
    let avatar = room.avatar
    room.participants.forEach((participant) => {
      if (participant.email === currentUser?.email) {
        subtitle.unshift(`You`)
      } else {
        // @ts-ignore
        const type = participant.extras?.type
        if (type === 'agent') {
          avatar = participant.avatar_url
        }
        subtitle.push(participant.username)
      }
    })

    set(subtitleAtom, subtitle.join(', '))
    set(avatarAtom, avatar)

    return room
  })

  return cb
}

export function useInitiateChat() {
  let qiscus = useQiscus()
  let opts = useAtomValue(optionsAtom)
  let updateRoomInfo = useUpdateRoomInfo()

  let cb = useAtomCallback(async (get, set, arg: InitiateChatOptions) => {
    let { nonce } = await qiscus.getNonce()

    let data = {
      app_id: qiscus.AppId,
      user_id: arg.userId,
      name: arg.name,
      sdk_user_extras: arg.extras,
      user_properties: arg.additionalInfo,
      nonce,
    }

    // @ts-ignore
    if (arg.channelId != null) data.channelId = arg.channelId

    let baseUrl = opts.baseURLMultichannel
    let resp = await axios
      .post(`${baseUrl}/api/v2/qiscus/initiate_chat`, data)
      .then((r) => r.data.data)

    let { identity_token, customer_room } = resp
    let roomId = customer_room.room_id

    let userData = await qiscus.verifyIdentityToken(identity_token)

    qiscus.setUserWithIdentityToken(userData)

    // A hack so we will trully wait for the user to be ready
    await new Promise((resolve) => events.on(event.onUserLoggedIn, resolve))

    if (arg.deviceId != null) {
      await qiscus.registerDeviceToken(arg.deviceId)
    }

    set(roomIdAtom, roomId)
    set(messageExtrasAtom, arg.messageExtras)
    set(accountAtom, (_) => userData.user)

    await updateRoomInfo()

    return userData.user
  })

  return cb
}

export function useEndSession(): () => Promise<void> {
  let qiscus = useQiscus()
  let reset1 = useResetAtom(titleAtom)
  let reset2 = useResetAtom(subtitleAtom)
  let reset3 = useResetAtom(avatarAtom)
  let reset4 = useResetAtom(progressUploadingAtom)
  let reset5 = useResetAtom(attachmentAtom)
  let reset6 = useResetAtom(typingStatusAtom)
  let reset7 = useResetAtom(unreadCountAtom)
  let reset8 = useResetAtom(roomIdAtom)
  let reset10 = useResetAtom(loginMessageAtom)
  let reset11 = useResetAtom(replayMessageAtom)
  let reset12 = useResetAtom(messageExtrasAtom)

  return useAtomCallback(() => {
    reset1()
    reset2()
    reset3()
    reset4()
    reset5()
    reset6()
    reset7()
    reset8()
    reset10()
    reset11()
    reset12()

    qiscus.exitChatRoom()
    // qiscus.disconnect()
  })
}

export function useRemoveNotification(): (deviceId: string) => Promise<void> {
  let qiscus = useQiscus()

  let cb = useAtomCallback(async (get, set, deviceId: string) => {
    await qiscus.removeDeviceToken(deviceId)
  })

  return cb
}

export function useOnLoginSuccess(
  cb?: (userData: { user: User }) => void
): void {
  useEffect(() => {
    if (cb != null) {
      events.on(event.onUserLoggedIn, cb)
      return events.off(event.onUserLoggedIn, cb)
    }

    return () => {}
  }, [cb])
}

export function useAppState(): AppState {
  return useAtomValue(appStateAtom)
}

import { Atom, atom } from 'jotai'
import { atomWithReset } from 'jotai/utils'
import { atomWithImmer } from 'jotai/immer'
import QiscusSDK from 'qiscus-sdk-core'
import en from '../locales/en'
import { AppState, Message, Room, SetupOptions, User } from './types'

const qiscus = new QiscusSDK()
export const qiscusAtom = atom<QiscusSDK>(qiscus)
export const accountAtom = atom<User | undefined>(undefined)
export const roomAtom = atom<Room | undefined>(undefined)
export const messagesAtom = atomWithImmer<Record<string, Message>>({})
export const messagesListAtom = atom((get) => {
  let messages = Object.values(get(messagesAtom))
  messages = messages.slice().sort((m1, m2) => m1.unix_nano_timestamp - m2.unix_nano_timestamp)
  return messages
})

export const optionsAtom = atom<{ appId: string | undefined } & SetupOptions>({
  appId: undefined,
  baseURLMultichannel: 'https://multichannel.qiscus.com',
})

export const titleAtom = atomWithReset(en.title)
export const subtitleAtom = atomWithReset(en.subtitle)
export const avatarAtom = atomWithReset<string | undefined>(undefined)
export const progressUploadingAtom = atomWithReset('')
export const attachmentAtom = atomWithReset({
  type: '',
  value: '',
  payload: '',
})
export const typingStatusAtom = atomWithReset(false)
export const unreadCountAtom = atomWithReset(0)
export const roomIdAtom = atomWithReset(null)
export const loginCheckedAtom = atom((get) => get(accountAtom) != null)
export const currentUserAtom = atom(
  (get) => get(accountAtom),
  // @ts-ignore
  (get, set, value) => set(accountAtom, value)
)
export const loginMessageAtom = atomWithReset(null)
export const replayMessageAtom = atomWithReset({})
export const messageExtrasAtom = atomWithReset<Record<string, any> | undefined>(
  undefined
)
export const appStateAtom = atom(
  (get) =>
    ({
      title: get(titleAtom),
      subtitle: get(subtitleAtom),
      avatar: get(avatarAtom),
      progressUploading: get(progressUploadingAtom),
      attachment: get(attachmentAtom),
      typingStatus: get(typingStatusAtom),
      unReadCount: get(unreadCountAtom),
      roomId: get(roomIdAtom),
      loginChecked: get(loginCheckedAtom),
      currentUser: get(currentUserAtom),
      loginMessage: get(loginMessageAtom),
      replayMessage: get(replayMessageAtom),
      messageExtras: get(messageExtrasAtom),
    } as AppState)
)
export default appStateAtom

import { atom } from 'jotai';
import QiscusSDK from 'qiscus-sdk-core';
import en from '../locales/en';

const qiscus = new QiscusSDK();
export const qiscusAtom = atom(qiscus);
export const accountAtom = atom(null);
export const roomAtom = atom(null);

export const messagesAtom = atom({});
export const messagesListAtom = atom((get) => {
  let messages = Object.values(get(messagesAtom));
  messages.sort((m1, m2) => m1.unix_nano_timestamp - m2.unix_nano_timestamp);
  return messages;
});

export const optionsAtom = atom({
  appId: null,
  baseURLMultichannel: 'https://multichannel.qiscus.com',
});

export const titleAtom = atom(en.title);
export const subtitleAtom = atom(en.subtitle);
export const avatarAtom = atom(null);
export const progressUploadingAtom = atom('');
export const attachmentAtom = atom({ type: '', value: '', payload: '' });
export const typingStatusAtom = atom(false);
export const unreadCountAtom = atom(0);
export const roomIdAtom = atom(null);
export const loginCheckedAtom = atom(false);
export const currentUserAtom = atom(
  (get) => get(accountAtom),
  (get, set, value) => set(accountAtom, value)
);
export const loginMessageAtom = atom(null);
export const replayMessageAtom = atom({});
export const messageExtrasAtom = atom(null);
export const appStateAtom = atom((get) => ({
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
}));
export default appStateAtom;

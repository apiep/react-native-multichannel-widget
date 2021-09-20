import React, { createContext, useCallback, useContext } from 'react'
import { Provider } from 'jotai'
import state from './state'
import { RootSiblingParent } from 'react-native-root-siblings'
import { ActionSheetProvider } from '@expo/react-native-action-sheet'
import {
  useAppState,
  useCurrentUser,
  useEndSession,
  useGetUnreadCount,
  useInitiateChat,
  useOnMessageReceived,
  useQiscus,
  useSetup,
  useUpdateRoomInfo,
} from './hooks'
import i18n from '../services/i18n'

const initialState = { ...state }
const WidgetContext = createContext(initialState);

export const MultichannelWidgetProvider = (props) => {
  const qiscus = useQiscus();
  const state = useAppState();
  const currentUser = useCurrentUser();
  const setup = useSetup();

  const getUnreadCount = useGetUnreadCount();
  const updateRoomInfo = useUpdateRoomInfo();
  const initiateChat = useInitiateChat();
  const endSession = useEndSession();
  const removeNotification = useCallback((deviceId) =>
    qiscus.removeDeviceToken(deviceId)
  );
  useOnMessageReceived(() => getUnreadCount());

  const changeLanguage = (lang) => i18n.changeLanguage(lang);

  const _store = {
    state,
    currentUser,
    setup,
    getUnreadCount,
    initiateChat,
    endSession,
    removeNotification,
    updateRoomInfo,
    changeLanguage,
  };
  const store = React.useMemo(() => _store, [state]);

  return (
    <RootSiblingParent>
      <ActionSheetProvider>
        <Provider>
          <WidgetContext.Provider value={store}>
            {props.children}
          </WidgetContext.Provider>
        </Provider>
      </ActionSheetProvider>
    </RootSiblingParent>
  )
};

export const MultichannelWidgetConsumer = WidgetContext.Consumer;

export const MultichannelWidgetContext = () => {
  const ctx = useContext(WidgetContext);
  if (ctx === undefined) {
    throw Error(
      'MultichannelWidget can only be used within MultichannelWidgetProvider'
    );
  }
  return ctx;
};

export default MultichannelWidgetContext;

import React, { createContext, useContext, useCallback, useEffect } from 'react';
import { Provider } from 'jotai';
import state from './state';
import { RootSiblingParent } from 'react-native-root-siblings';
import * as Qiscus from '../services/qiscus';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import {
	useGetUnreadCount,
	useOnMessageReceived,
	useUpdateRoomInfo,
	useInitiateChat,
	useEndSession,
	useCurrentUser,
	useAppState,
	useSetup,
	useOnLoginSuccess,
	useQiscus,
} from './hooks';

const initialState = { ...state };
const WidgetContext = createContext(initialState);
import i18n from '../services/i18n';

export const MultichannelWidgetProvider = (props) => {
	const qiscus = useQiscus()
	const state = useAppState();
	const currentUser = useCurrentUser();
	const setup = useSetup();

	const getUnreadCount = useGetUnreadCount();
	const updateRoomInfo = useUpdateRoomInfo();
	const initiateChat = useInitiateChat();
	const endSession = useEndSession();
	const removeNotification = useCallback((deviceId) => qiscus.removeDeviceToken(deviceId));
	useOnMessageReceived(() => getUnreadCount());

	useOnLoginSuccess((userData) => {
		console.log('login success', userData);
	});

	const changeLanguage = (lang) => i18n.changeLanguage(lang);

	// useEffect(() => console.log('useEffect@WidgetContext', { state }), [state])

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
				{/* <Provider> */}
					<WidgetContext.Provider value={store}>{props.children}</WidgetContext.Provider>
				{/* </Provider> */}
			</ActionSheetProvider>
		</RootSiblingParent>
	);
};

export const MultichannelWidgetConsumer = WidgetContext.Consumer;

export const MultichannelWidgetContext = () => {
	const ctx = useContext(WidgetContext);
	if (ctx === undefined) {
		throw Error('MultichannelWidget can only be used within MultichannelWidgetProvider');
	}
	return ctx;
};

export default MultichannelWidgetContext;

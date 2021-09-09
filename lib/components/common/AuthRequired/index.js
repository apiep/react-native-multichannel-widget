import { useAtomValue } from 'jotai/utils';
import React from 'react';
import { Text, View } from 'react-native';
import { useCurrentChatRoom, useCurrentUser } from '../../../contexts/hooks';
import { loginCheckedAtom, loginMessageAtom } from '../../../contexts/state';

const AuthRequired = ({ children }) => {
  const currentUser = useCurrentUser();
  const currentRoom = useCurrentChatRoom();
  const loginChecked = useAtomValue(loginCheckedAtom);
  const loginMessage = useAtomValue(loginMessageAtom);

  if (loginChecked && currentUser != null && currentRoom != null) {
    return (
      <View
        style={{
          flex: 1,
        }}
      >
        {children}
      </View>
    );
  }
  if (loginChecked && loginMessage) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ color: '#f12222' }}>Failed preparing chat</Text>
      </View>
    );
  }
  return (
    <View
      style={{
        flex: 1,
      }}
    ></View>
  );
};

export default AuthRequired;

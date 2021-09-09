import React, { useRef } from 'react';
import {
  useAppState,
  useCurrentChatRoom,
  useCurrentUser,
  useMessages,
  useQiscus,
} from '../contexts/hooks';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';

export default function ChatScreen(props) {
  const qiscus = useQiscus();
  const state = useAppState();
  const currentUser = useCurrentUser();
  const { room } = useCurrentChatRoom();
  const messages = useMessages();
  const messageList = useMemo(() => Object.values(messages), [messages]);

  const flatlistRef = useRef();

  return (
    <View>
      <FlatList ref={flatlistRef} data={messageList} renderItem={ChatBubble} />
      <Text>Chat View</Text>
    </View>
  );
}

function ChatBubble(props) {
  return (
    <TouchableOpacity>
      <Text>{props.message}</Text>
    </TouchableOpacity>
  );
}

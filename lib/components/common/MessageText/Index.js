import { Text } from 'react-native';
import React from 'react';
import { MessageType } from '../../../constants/messageType';
import { parseHtmlText } from '../../../utils';
import Hyperlink from 'react-native-hyperlink';
import * as Qiscus from '../../../services/qiscus';
import { CONFIG } from '../../../constants/theme';
import Autolink from 'react-native-autolink';

const MessageText = (props) => {
  const { item } = props;
  const isMyText = item.email === Qiscus.currentUser().email;
  if (item.type !== MessageType.TEXT) return null;
  return (
    <Autolink
      linkStyle={{
        padding: 2,
        fontSize: 16,
        color: isMyText ? CONFIG.colorMyText : CONFIG.colorOpponentText,
      }}
      text={parseHtmlText(item.message)}
    />
  );
};

export default MessageText;

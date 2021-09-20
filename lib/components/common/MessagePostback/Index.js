import { Text } from 'react-native';
import React from 'react';
import { MessageType } from '../../../constants/messageType';
import { parseHtmlText } from '../../../utils';
import Hyperlink from 'react-native-hyperlink';
import Autolink from 'react-native-autolink'
import * as Qiscus from '../../../services/qiscus';
import { CONFIG } from '../../../constants/theme';

const MessagePostback = (props) => {
  const { item } = props;
  const isMyText = item.email === Qiscus.currentUser().email;
  if (item.type !== MessageType.BUTTON_POSTBACK_RESPONSE) return null;
  return (
      <Autolink
        linkStyle={{
          padding: 2,
          color: isMyText ? CONFIG.colorMyText : CONFIG.colorOpponentText,
        }}
        text={parseHtmlText(item.message)}
        url
      />
  );
};

export default MessagePostback;

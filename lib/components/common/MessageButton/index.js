import { Text, View, TouchableOpacity } from 'react-native';
import React from 'react';
import { MessageType } from '../../../constants/messageType';
import { parseHtmlText } from '../../../utils';
import Hyperlink from 'react-native-hyperlink';
import { CONFIG } from '../../../constants/theme';
import BubbleStyle from '../Bubble/styles';
import Autolink from 'react-native-autolink';

const MessageButton = (props) => {
  const { item, btnCallback } = props;
  let { type, payload } = item;
  if (type !== MessageType.BUTTON) return null;
  let { buttons, text } = payload;

  const Description = () => {
    return (
      <Autolink
        linkStyle={[
          {
            backgroundColor: 'white',
            borderRadius: 10,
            paddingTop: 10,
            paddingBottom: 10,
            paddingLeft: 12,
            paddingRight: 15,
          },
        ]}
        text={parseHtmlText(text)}
        url
      />
    );
  };
  const Buttons = () => {
    if (buttons.length === 0) return null;
    return (
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: 'white',
          borderRadius: 10,
          paddingTop: 10,
          paddingBottom: 10,
          paddingLeft: 12,
          paddingRight: 15,
          marginTop: 5,
          flexWrap: 'wrap',
        }}
      >
        {buttons.map((button) => {
          return (
            <TouchableOpacity
              onPress={() => btnCallback(button)}
              style={{
                marginTop: 5,
                borderRadius: 14.5,
                marginRight: 5,
                backgroundColor: CONFIG.backgroundBubbleRight,
              }}
            >
              <Text
                style={{
                  padding: 5,
                  paddingLeft: 10,
                  paddingRight: 10,
                  color: 'white',
                  fontSize: 14,
                }}
              >
                {button.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };
  return (
    <View
      style={[
        BubbleStyle.content,
        {
          padding: 0,
          flex: 1,
        },
      ]}
    >
      <Description />
      <Buttons />
    </View>
  );
};

export default MessageButton;

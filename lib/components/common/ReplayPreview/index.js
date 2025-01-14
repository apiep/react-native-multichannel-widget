import { useAtom } from 'jotai';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { MessageType } from '../../../constants/messageType';
import { COLORS } from '../../../constants/theme';
import { replayMessageAtom } from '../../../contexts/state';
import { isImageFile } from '../../../utils';
import MessageAttachment from '../MessageAttachment/Index';

export default function ReplayPreview() {
  const [item, setItem] = useAtom(replayMessageAtom);
  const { id, message, username } = item;

  if (id == null) return null;

  return (
    <View
      style={{
        backgroundColor: COLORS.greyTextLight,
        marginLeft: 15,
        marginRight: 15,
        borderRadius: 5,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
        }}
      >
        <View
          style={{
            backgroundColor: COLORS.yellow,
            paddingLeft: 2,
            paddingRight: 2,
            marginRight: 5,
            borderBottomLeftRadius: 10,
            borderTopLeftRadius: 10,
          }}
        />
        <View
          style={{
            flexDirection: 'column',
            flex: 1,
            paddingBottom: 5,
          }}
        >
          <Text>{username}</Text>
          {replayItem(item)}
        </View>
      </View>
      <TouchableOpacity
        onPress={() => setItem({})}
        style={{
          position: 'absolute',
          top: 5,
          right: 5,
          zIndex: 1,
        }}
      >
        <Image
          source={require('../../../assets/ic_close_attachment.png')}
          style={{
            backgroundColor: 'white',
            borderRadius: 10,
            height: 15,
            width: 15,
          }}
        />
      </TouchableOpacity>
    </View>
  );
}

const replayItem = (item) => {
  const { message, type, payload } = item;
  if (type == MessageType.ATTACHMENT) {
    const { url, caption } = payload;
    return (
      <View style={{ paddingRight: 10 }}>
        {caption !== '' && (
          <Text numberOfLines={2} style={{ color: COLORS.white }}>
            {caption}
          </Text>
        )}
        {isImageFile(url) ? (
          <Image
            source={{ uri: url }}
            style={{ height: 50, width: 50, borderRadius: 5 }}
          />
        ) : (
          <View style={{ width: 175 }}>
            <MessageAttachment
              hideDownloadButton={true}
              item={item}
              hideCaption={true}
            />
          </View>
        )}
      </View>
    );
  }
  return (
    <Text
      numberOfLines={2}
      style={{
        fontSize: 14,
        marginTop: 5,
        marginRight: 10,
        paddingRight: 10,
        color: 'white',
      }}
    >
      {message}
    </Text>
  );
};

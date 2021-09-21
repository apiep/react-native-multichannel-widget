import * as React from 'react'
import { useMemo } from 'react'
import { View, Image, Text } from 'react-native'
import { useCurrentUser, useCurrentUserAvatar } from '../../contexts/hooks'
import type { Message } from '../../contexts/types'

type MessageItemImageProps = {
  item: Message
  onTap?: () => void
}
export function MessageItemImage(props: MessageItemImageProps) {
  const avatarUrl = useCurrentUserAvatar()
  const payload: Record<string, any> = useMemo(
    () => props.item.payload,
    [props.item]
  )

  return (
    <View>
      <View
        style={{
          flex: 1,
          alignSelf: 'center',
          height: 190,
          width: 250,
          backgroundColor: '#27B199',
          borderRadius: 8,
          marginVertical: 5,
        }}
      >
        <Image
          source={{ uri: payload.url }}
          onError={() => console.log('error loading image', payload.url)}
          style={{
            flex: 1,
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
          }}
        />
        {payload.caption != null && payload.caption.length > 0 && (
          <Text
            style={{
              color: 'white',
              padding: 10,
            }}
          >
            {payload.caption}
          </Text>
        )}
      </View>
      <View>
        <Image source={avatarUrl} />
      </View>
    </View>
  )
}

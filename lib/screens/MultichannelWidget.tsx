import { format, parse } from 'date-fns'
import _ from 'lodash'
import React, { useCallback, useMemo, useState } from 'react'
import {
  Image,
  SectionList,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'
import {
  useCurrentChatRoom,
  useCurrentUser,
  useQiscus
} from '../contexts/hooks'
import { Message, Room } from '../contexts/types'

type MultichannelWidgetProps = {
  onSuccessGetRoom?: (room: Room) => void
  onDownload?: (url: string, filename: string) => void
  renderTickSent?: JSX.Element
  renderTickDelivered?: JSX.Element
  renderTickRead?: JSX.Element
  renderTickPending?: JSX.Element
}

export function MultichannelWidget(props: MultichannelWidgetProps) {
  const qiscus = useQiscus()
  const currentUser = useCurrentUser()
  const { room, messages, sendMessage, loadMoreMessages } = useCurrentChatRoom()

  const lastMessageId = useMemo(() => messages[0]?.id, [messages])
  const onSendMessage = useCallback(
    async (text: string) => {
      if (room != null) {
        let message = qiscus.generateMessage({
          roomId: room.id,
          text,
        })
        await sendMessage(message)
      }
    },
    [room]
  )
  const onLoadMore = useCallback(async () => {
    console.log('@load-more', lastMessageId)
    await loadMoreMessages(lastMessageId)
  }, [lastMessageId])

  return (
    <View
      style={{
        flex: 1,
        display: 'flex',
        backgroundColor: 'black',
        // height: '90%',
      }}
    >
      <MessageList messages={messages ?? []} onLoadMore={onLoadMore} />
      <MessageForm
        onTapAddAttachment={() => console.log('add attachment')}
        onSendMessage={onSendMessage}
      />
    </View>
  )
}

type MessageListProps = {
  messages: Array<Message>
  onLoadMore: () => void
}
function MessageList(props: MessageListProps) {
  let today = useMemo(() => new Date(), [])
  const messages = useMemo(() => {
    let messages = _(props.messages)
      .reverse()
      .groupBy((item) =>
        format(new Date(item.unix_nano_timestamp / 1_000_000), 'yyyy MM dd')
      )
      .map((value, key) => ({ title: key, data: value }))
      .orderBy('title', 'desc')
      .value()

    return messages
  }, [props.messages])

  const renderItem = useCallback((item) => {
    switch (item.type) {
      case 'system_event':
        return <MessageItemSystemEvent item={item} />
      default:
        return <MessageItemText item={item} />
    }
  }, [])

  return (
    <SectionList
      sections={messages}
      keyExtractor={(item, index) => `${index}-${item.unique_id}`}
      renderItem={({ item }) => renderItem(item)}
      renderSectionFooter={({ section }) => (
        <View
          style={{
            backgroundColor: '#FFD97C',
            borderRadius: 8,
            paddingHorizontal: 10,
            paddingVertical: 5,
            alignSelf: 'center',
          }}
        >
          <Text
            style={{
              textAlign: 'center',
              color: '#232323',
            }}
          >
            {format(parse(section.title, 'yyyy MM dd', today), 'dd MMM yyyy')}
          </Text>
        </View>
      )}
      inverted
      onEndReached={() => props.onLoadMore()}
      onEndReachedThreshold={0.1}
      initialNumToRender={10}
      style={{
        flex: 1,
        backgroundColor: 'white',
      }}
    />
  )
}

type MessageFormProps = {
  onTapAddAttachment: () => void
  onSendMessage: (message: string) => void
}
function MessageForm(props: MessageFormProps) {
  const [text, setText] = useState<string>()

  return (
    <View
      style={{
        display: 'flex',
        flexBasis: 66,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',

        backgroundColor: '#FAFAFA',
        borderTopColor: '#E3E3E3',
        borderTopWidth: 1,
        minHeight: 66,
      }}
    >
      <TouchableOpacity
        onPress={props.onTapAddAttachment}
        style={{
          marginHorizontal: 10,
        }}
      >
        <Image source={require('./icons/add-attachment.png')} />
      </TouchableOpacity>
      <View
        style={{
          flex: 1,
          backgroundColor: 'white',
          borderColor: '#E3E3E3',
          borderWidth: 1,
          borderRadius: 8,
          padding: 10,
          // marginHorizontal: 10,
        }}
      >
        <TextInput
          placeholder="Send a message..."
          value={text}
          onChange={(event) => setText(event.nativeEvent.text)}
        />
      </View>
      <TouchableOpacity
        onPress={() => {
          if (text && text.trim().length > 0) {
            props.onSendMessage(text)
            setText('')
          }
        }}
        style={{
          marginHorizontal: 10,
        }}
      >
        <Image source={require('./icons/send-message.png')} />
      </TouchableOpacity>
    </View>
  )
}

type MessageItemTextProps = {
  item: Message
}
function MessageItemText(props: MessageItemTextProps) {
  let currentUser = useCurrentUser()
  let timeSent = useMemo(() => {
    return format(new Date(props.item.timestamp), 'HH.mm')
  }, [props.item])

  return (
    <View
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'flex-end',
        marginHorizontal: 10,
        marginVertical: 5,
      }}
    >
      <View
        style={{
          marginRight: 10,
          alignItems: 'flex-end',
        }}
      >
        <Text
          style={{
            fontSize: 11,
            textAlign: 'right',
            color: '#ADADAD',
          }}
        >
          {timeSent}
        </Text>
        {(props.item.status === 'read' ||
          props.item.status === 'delivered') && (
          <Image
            source={require('./icons/double-tick.png')}
            style={{
              height: 14,
              width: 14,
            }}
          />
        )}
      </View>
      <View
        style={{
          backgroundColor: '#27B199',
          paddingHorizontal: 16,
          paddingVertical: 10,
          borderRadius: 8,
          maxWidth: '60%',
          marginRight: 10,

          flex: 1,
        }}
      >
        <Text>{props.item.timestamp}</Text>
        <Text
          style={{
            color: 'white',
            fontSize: 14,
          }}
        >
          {props.item.message}
        </Text>
      </View>
      <View
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 100,
          borderWidth: 2,
          borderColor: '#27B199',
        }}
      >
        {currentUser && (
          <Image
            style={{
              height: 40,
              width: 40,
              borderRadius: 100,
            }}
            source={{ uri: currentUser.avatar_url }}
          />
        )}
        {currentUser == null && (
          <Image
            style={{
              height: 40,
              width: 40,
              borderRadius: 100,
            }}
            source={require('./icons/default-user-avatar.png')}
          />
        )}
      </View>
    </View>
  )
}

type MessageItemSystemEventProps = {
  item: Message
}
function MessageItemSystemEvent(props: MessageItemSystemEventProps) {
  return (
    <View
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#01416C',
        maxWidth: '75%',
        alignSelf: 'center',
        marginVertical: 5,
      }}
    >
      <Text
        style={{
          color: '#01416C',
          textAlign: 'center',
        }}
      >
        {props.item.message}
      </Text>
    </View>
  )
}

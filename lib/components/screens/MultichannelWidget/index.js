import { useActionSheet } from '@expo/react-native-action-sheet';
import { useAtom } from 'jotai';
import { useAtomValue, useUpdateAtom } from 'jotai/utils';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Keyboard, Linking, Modal, View } from 'react-native';
import Clipboard from '@react-native-community/clipboard';
import ImageViewer from 'react-native-image-zoom-viewer';
import { MessageType } from '../../../constants/messageType';
import {
  useAppState,
  useCurrentChatRoom,
  useCurrentUser,
  useEndSession,
  useGetUnreadCount,
  useQiscus,
  useUpdateRoomInfo,
} from '../../../contexts/hooks';
import {
  attachmentAtom,
  loginMessageAtom,
  messagesAtom,
  progressUploadingAtom,
  replayMessageAtom,
  typingStatusAtom,
} from '../../../contexts/state';
import {
  getMoment as moment,
  isEmpty,
  qiscusLogger,
  qiscusToast,
} from '../../../utils';
import AuthRequired from '../../common/AuthRequired';
import Bubble from '../../common/Bubble';
import InputMessage from '../../common/InputMessage';
import LoadMore from '../../common/LoadMore';
import MessageTyping from '../../common/MessageTyping';
import ScreenWrapper from '../../common/ScreenWrapper';

export default function MultichannelWidget(props) {
  const {
    onSuccessGetRoom,
    onTyping,
    onPressSendAttachment,
    onDownload,
    renderSendAttachment,
    sendAttachment,
    renderSendMessage,
    filterMessage,
    placeholder,
  } = props;

  const qiscus = useQiscus();
  const state = useAppState();
  const {
    room,
    deleteMessage,
    sendMessage: _sendMessage,
    loadMoreMessages,
  } = useCurrentChatRoom();
  const [messages, setMessages] = useAtom(messagesAtom);
  const currentUser = useCurrentUser();
  const updateRoomInfo = useUpdateRoomInfo();
  const getUnreadCount = useGetUnreadCount();
  const endSession = useEndSession();
  const attachment = useAtomValue(attachmentAtom);
  const roomId = useMemo(() => room?.id, [room]);
  const isLogin = useMemo(
    () => roomId !== 0 && roomId !== null && currentUser != null,
    [roomId, currentUser]
  );

  const setProgressUploading = useUpdateAtom(progressUploadingAtom);
  const setTyping = useUpdateAtom(typingStatusAtom);
  const setLoginMessage = useUpdateAtom(loginMessageAtom);
  const setAttachment = useUpdateAtom(attachmentAtom);
  const setReplayMessage = useUpdateAtom(replayMessageAtom);

  const flatListRef = React.useRef(null);
  let [uploadUrl, setUploadUrl] = useState('');
  const { showActionSheetWithOptions } = useActionSheet();
  const [message, setMessage] = useState('');
  const [visibleImageModal, setVisibleImageModal] = useState(false);
  const [imageModal, setImageModal] = useState([
    {
      url: '',
    },
  ]);

  useEffect(() => {
    if (isLogin) {
      updateRoomInfo();
    }
    return () => {
      getUnreadCount();
      setProgressUploading('');
      resetPayloadAndMessage();
      setUploadUrl('');
      setTyping(false);
      setLoginMessage(null);
      endSession();
    };
  }, [isLogin, currentUser]);

  const getMessage = () => {
    let data = Object.values(messages);
    //reverse and filter message
    if (filterMessage && typeof filterMessage === 'function') {
      return data.length > 0 ? data.reverse().filter(filterMessage) : [];
    } else {
      return data.length > 0 ? data.reverse() : [];
    }
  };
  const onOpenActionMessage = (item) => {
    if (
      item.type !== MessageType.TEXT &&
      item.type !== MessageType.REPLY &&
      item.type !== MessageType.ATTACHMENT
    ) {
      return;
    }
    const labelCopy = 'Copy';
    const labelReplay = 'Reply';
    const labelDelete = 'Delete';
    const labelCancel = 'Cancel';

    const options = [labelCopy, labelReplay, /* labelDelete, */ labelCancel];

    // if currentUser.email === item.email add labelDelete to index 2 of options
    if (currentUser.email === item.email) {
      options.splice(2, 0, labelDelete);
    }

    const cancelButtonIndex = options.indexOf(labelCancel);
    const destructiveButtonIndex = options.indexOf(labelDelete);

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        destructiveButtonIndex,
      },
      (buttonIndex) => {
        switch (buttonIndex) {
          case options.indexOf(labelCopy):
            Clipboard.setString(item.message);
            break;
          case options.indexOf(labelDelete):
            deleteMessage(item);
            break;
          case options.indexOf(labelReplay):
            setAttachment({ type: '', value: '', payload: '' });
            setProgressUploading('');
            setUploadUrl('');
            setReplayMessage(item);
            break;
          default:
            break;
        }
      }
    );
  };

  const renderItem = ({ item, index }) => {
    let beforeMessage = messages[item.comment_before_id];
    let afterMessage = getMessage()[index - 1];
    return (
      <Bubble
        openActionMessage={onOpenActionMessage}
        onPressImage={(image, file_name) => {
          setImageModal(image);
          setVisibleImageModal(true);
        }}
        index={index}
        item={item}
        beforeItem={beforeMessage}
        afterItem={afterMessage}
        scrollDown={scrollDown}
        btnCallback={btnCallback}
        {...props}
      />
    );
  };

  const sendMessage = useCallback(async () => {
    const { payload, type } = attachment;
    const isReply = !!state.replayMessage?.id;

    let newMessage = message.length > 0 ? message.toString().trim() : message;

    if (isEmpty(newMessage) && type !== MessageType.IMAGE) return;

    let comment = isReply
      ? qiscus.generateReplyMessage({
          roomId,
          text: newMessage,
          repliedMessage: state.replayMessage,
        })
      : qiscus.generateMessage({
          roomId,
          text: newMessage,
        });

    Keyboard.dismiss();

    if (type === MessageType.IMAGE) {
      comment.payload = {
        ...payload,
        caption: newMessage,
      };
      comment.type = MessageType.ATTACHMENT;
      qiscus.generateFileAttachmentMessage({
        roomId,
        url: uploadUrl,
        size: 0,
        caption: newMessage,
      });
    }

    if (state.messageExtras) comment.extras = state.messageExtras;

    _sendMessage(comment);
    setAttachment((item) => ({ ...item, type: '', value: '' }));

    if (!isEmpty(newMessage) || type != '') {
      resetPayloadAndMessage();
    }
  }, [message, state, attachment]);

  const _onPressSendAttachment = () => {
    if (!onPressSendAttachment) return null;
    onPressSendAttachment()
      .then((opts) => {
        let sizeInMB = parseFloat((opts.size / (1024 * 1024)).toFixed(2));
        if (isNaN(sizeInMB)) {
          qiscusToast('File size required');
          return;
        }
        if (!(sizeInMB <= 20)) {
          qiscusToast('File size lebih dari 20MB');
          return;
        }
        setAttachment({
          type: MessageType.IMAGE,
          value: opts.uri,
          payload: null,
        });
        const source = {
          uri: opts.uri,
          name: opts.name,
          type: opts.type,
          caption: message,
        };
        setUploadUrl(source.uri);
        qiscus.upload(source, (error, progress, fileUrl) => {
          if (error != null) {
            setAttachment({ type: null, value: null, payload: null });
            // qiscusToast('error while upload attachment');
            // qiscusLogger(error, 'error while upload');
            console.log(
              'error uploading image',
              JSON.stringify(error, null, 2)
            );
            setUploadUrl('');
            return;
          }
          if (fileUrl != null) {
            setProgressUploading(-1);
            let payload = {
              caption: message,
              file_name: opts.name,
              file_type: opts.type,
              size: opts.size,
              url: fileUrl,
            };

            setAttachment({
              type: MessageType.IMAGE,
              value: opts.uri,
              payload,
            });
            setUploadUrl('');
          }

          if (progress && fileUrl == null) {
            if (progress.percent < 100 && source.uri === uploadUrl)
              setProgressUploading(progress.percent);
          }
        });
      })
      .catch((e) => {
        qiscusLogger(e, 'upload_attachment');
      });
  };

  const resetPayloadAndMessage = () => {
    if (
      state.progressUploading === 100 ||
      state.progressUploading === -1 ||
      state.progressUploading === ''
    ) {
      setAttachment({ type: '', value: '', payload: '' });
    }
    setProgressUploading('');
    setReplayMessage({});
    setMessage('');
  };

  const scrollDown = () => {
    flatListRef?.current?.scrollToOffset({ animated: true, offset: 0 });
  };
  const sendMessagePostBack = useCallback(
    (postback_text, payload) => {
      let unixTime = moment().unix();
      let comment = qiscus.generateMessage({
        roomId,
        text: postback_text,
      });
      comment.type = MessageType.BUTTON_POSTBACK_RESPONSE;
      comment.payload = payload;
      comment.unique_id = comment.unique_temp_id = unixTime.toString();

      sendMessage(comment);
    },
    [roomId, qiscus, sendMessage]
  );

  const btnCallback = useCallback(({ type, postback_text, payload, label }) => {
    const { url } = payload;

    if (type === 'link') {
      Linking.openURL(url);
    }
    if (type === 'postback') {
      scrollDown();
      sendMessagePostBack(
        !isEmpty(postback_text) ? postback_text : label,
        payload
      );
    }
  }, []);

  const showLoadMore = useMemo(() => {
    let arrayId = Object.keys(messages);
    if (arrayId.length <= 20) return false;
    return messages[arrayId[0]]?.comment_before_id !== 0;
  }, [messages]);

  return (
    <View
      style={{
        flex: 1,
      }}
    >
      <ScreenWrapper>
        <AuthRequired>
          <FlatList
            ref={flatListRef}
            inverted
            keyExtractor={(item, index) => index.toString()}
            data={getMessage()}
            renderItem={renderItem}
            ListFooterComponent={
              showLoadMore && <LoadMore onPress={() => loadMoreMessages()} />
            }
            ListHeaderComponent={state.typingStatus && <MessageTyping />}
            onEndReached={() => loadMoreMessages()}
            onEndReachedThreshold={0.5}
          />
        </AuthRequired>
        <InputMessage
          renderSendAttachment={renderSendAttachment}
          sendAttachment={sendAttachment}
          renderSendMessage={renderSendMessage}
          message={message}
          placeholder={placeholder}
          onPress={sendMessage}
          onChangeText={(text) => {
            if (onTyping) onTyping(text);
            setMessage(text);
          }}
          onCloseAttachmentPreview={() => {
            setUploadUrl('');
            setAttachment({ type: '', value: '', payload: '' });
            setProgressUploading('');
          }}
          onPressSendAttachment={() => {
            _onPressSendAttachment();
          }}
        />
      </ScreenWrapper>

      <Modal
        visible={visibleImageModal}
        onRequestClose={() => {
          setVisibleImageModal(false);
        }}
        transparent={true}
      >
        <ImageViewer
          imageUrls={imageModal}
          onSwipeDown={() => setVisibleImageModal(false)}
          enableSwipeDown={true}
          onSave={(url) => {
            if (onDownload) onDownload(url);
          }}
          menuContext={{
            saveToLocal: 'Download Image',
            cancel: 'Cancel',
          }}
        />
      </Modal>
    </View>
  );
}

import {
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import SendMessage from '../SendMessage';
import AttachmentButton from '../AttachmentButton';
import ImagePreview from '../ImagePreview';
import { MessageType } from '../../../constants/messageType';
import ProductPreview from '../ProductPreview';
import styles from './styles';
import debounce from 'lodash.debounce';
import ReplayPreview from '../ReplayPreview';
import { isEmpty } from '../../../utils';
import { useTranslation } from 'react-i18next';
import {
  useCurrentChatRoom,
  useCurrentUser,
  useQiscus,
} from '../../../contexts/hooks';
import { useAtomValue } from 'jotai/utils';
import {
  attachmentAtom,
  loginCheckedAtom,
  replayMessageAtom,
} from '../../../contexts/state';

const InputMessage = (props) => {
  const {
    message,
    onChangeText,
    onPress,
    onPressSendAttachment,
    renderSendAttachment,
    renderSendMessage,
  } = props;

  const { t } = useTranslation();

  const qiscus = useQiscus();
  const currentUser = useCurrentUser();
  const currentRoom = useCurrentChatRoom();
  const attachment = useAtomValue(attachmentAtom);
  const replayMessage = useAtomValue(replayMessageAtom);
  const loginChecked = useAtomValue(loginCheckedAtom);
  const username = useMemo(() => currentUser?.username, [currentUser]);
  const enableInput = useMemo(
    () => loginChecked && username != null && currentRoom != null,
    [loginChecked, username, currentRoom]
  );
  const disableButton = useMemo(
    () =>
      !enableInput ||
      (isEmpty(message) &&
        Object.entries(attachment?.payload ?? {}).length === 0),
    [enableInput, message, attachment]
  );
  const placeholder = useMemo(() => {
    if (!enableInput) return t('placeholderDisable');
    return isEmpty(props.placeholder) ? t('placeholder') : props.placeholder;
  }, [enableInput, props.placeholder]);
  const inputElementRef = useRef(null);

  useEffect(() => {
    if (inputElementRef?.current) {
      inputElementRef.current.setNativeProps({
        style: styles.placeHolder,
      });
    }
  }, [inputElementRef]);

  const sendTyping = useCallback(
    debounce(() => {
      qiscus.publishTyping(1);
    }, 1000),
    [qiscus]
  );

  return (
    <View>
      <View style={styles.container} />
      {attachment.type === MessageType.IMAGE && <ImagePreview {...props} />}
      {attachment.type === MessageType.PRODUCT && <ProductPreview {...props} />}
      <ReplayPreview {...props} />
      <View style={styles.containerInput}>
        <View style={styles.borderInput}>
          {!replayMessage?.id && (
            <TouchableOpacity
              disabled={!enableInput}
              style={styles.buttonAttachment}
              onPress={() => {
                if (onPressSendAttachment) onPressSendAttachment();
              }}
            >
              {renderSendAttachment ? (
                renderSendAttachment
              ) : (
                <AttachmentButton disabled={!enableInput} />
              )}
            </TouchableOpacity>
          )}
          {Platform.OS === 'android' ? (
            <ScrollView>
              <TextInput
                ref={inputElementRef}
                editable={enableInput}
                style={styles.textInput}
                value={message}
                onChangeText={(message) => {
                  sendTyping();
                  if (onChangeText) onChangeText(message);
                }}
                placeholder={placeholder}
                multiline={true}
                scrollEnabled={true}
              />
            </ScrollView>
          ) : (
            <TextInput
              ref={inputElementRef}
              editable={enableInput}
              style={styles.textInput}
              value={message}
              onChangeText={(message) => {
                sendTyping();
                if (onChangeText) onChangeText(message);
              }}
              placeholder={placeholder}
              multiline={true}
              scrollEnabled={true}
            />
          )}
        </View>
        {(message !== '' || message !== undefined) && (
          <View>
            <TouchableOpacity
              disabled={disableButton}
              onPress={() => {
                if (onPress) onPress(message);
              }}
            >
              {renderSendMessage ? (
                renderSendMessage
              ) : (
                <SendMessage disabled={disableButton} />
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

export default InputMessage;

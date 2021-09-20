interface IQiscusMultichannelWidgetConstructor {
  new (appId: string): IQiscusMultichannelWidget;
}

interface IQiscusMultichannelWidget {
  setEnableNotification(): Promise<void>;
  setUser(id: string, displayName: string, avatarUrl?: string): Promise<void>;

  setRoomTitle(title: string): void;
  setRomSubtitle(enabled: RoomSubtitleConfig, customSubtitle?: string): void;
  setHideUIEvent(): void;
  setAvatar(enabled: RoomAvatarConfig): void;
  initiateChat(): Promise<void>;

  setNavigationColor(color: string): void;
  setSendContainerColor(color: string): void;
  setFieldChatBorderColor(color: string): void;
  setSendContainerBackgroundColor(color: string): void;
  setNavigationTitleColor(color: string): void;
  setSystemEventTextColor(color: string): void;
  setLeftBubbleColor(color: string): void;
  setRightBubbleColor(color: string): void;
  setLeftBubbleTextColor(color: string): void;
  setRightBubbleTextColor(color: string): void;
  setTimeLabelTextColor(color: string): void;
  setTimeBackgroundColor(color: string): void;
  setBaseColor(color: string): void;
  setEmptyTextColor(color: string): void;
  setEmptyBackgroundColor(color: string): void;
}

type QWidgetOptions = {
  navigationColor?: string
  sendContainerColor?: string
  fieldChatBorderColor?: string
  sendContainerBackgroundColor?: string
  navigationTitleColor?: string
  systemEventTextColor?: string
  leftBubbleColor?: string
  rightBubbleColor?: string
  leftBubbleTextColor?: string
  rightBubbleTextColor?: string
  timeLabelTextColor?: string
  timeBackgroundColor?: string
  baseColor?: string
  emptyTextColor?: string
  emptyBackgroundColor?: string
}

enum RoomAvatarConfig {
  Enabled = 'AvatarConfig.enabled',
  Disabled = 'AvatarConfig.disabled',
}

enum RoomSubtitleConfig {
  Enabled = 'RoomSubtitle.enabled',
  Disabled = 'RoomSubtitle.disabled',
  Editable = 'RoomSubtitle.editable',
}

declare const widget: IQiscusMultichannelWidget
async function main() {
  await widget.initiateChat()
}

type IProps = {
  appId: string,
  options?: QWidgetOptions,
}

export function QiscusMultichannelWidgetProvider(props: IProps) {
}

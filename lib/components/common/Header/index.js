import { useAtomValue } from 'jotai/utils';
import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, Text, View } from 'react-native';
import { useAppState, useCurrentChatRoom, useCurrentUser } from '../../../contexts/hooks';
import { avatarAtom, loginCheckedAtom, subtitleAtom, titleAtom, typingStatusAtom } from '../../../contexts/state';
import en from '../../../locales/en';
import styles from './styles';

export default function Header(props) {
	const { t } = useTranslation();
	const { height, headerRight, headerLeft, style, textColor } = props;

	const _title = useAtomValue(titleAtom);
	const _subtitle = useAtomValue(subtitleAtom);
	const _avatar = useAtomValue(avatarAtom);
	const loginChecked = useAtomValue(loginCheckedAtom);
	const typingStatus = useAtomValue(typingStatusAtom);
	const { room } = useCurrentChatRoom();
	const user = useCurrentUser();

	const title = useMemo(() => {
		if (props.title) return props.title;
		if (_title === en.title) return t('title');

		return _title;
	}, [_title, props.title]);

	const subtitle = useMemo(() => {
		if (props.subtitle) return props.subtitle;
		return _subtitle;
	}, [_subtitle, props.subtitle]);

	const Avatar = useMemo(() => {
		if (!loginChecked) return <Image style={styles.avatar} source={require('../../../assets/chat_connecting.png')} />;
		if (_avatar) return <Image style={styles.avatar} source={{ uri: _avatar }} />;

		return <Image style={styles.avatar} source={require('../../../assets/defaultAvatar.png')} />;
	}, [_avatar]);

	const Content = useMemo(() => {
		if (loginChecked && user != null && room != null)
			return (
				<View style={styles.content}>
					<Text style={[styles.name, textColor && { color: textColor }]} numberOfLines={1}>
						{title}
					</Text>
					<View style={{ flexDirection: 'row' }}>
						{typingStatus ? (
							<Text style={[styles.subtitle, textColor && { color: textColor }]} numberOfLines={1}>
								{t('typing')}
							</Text>
						) : (
							<Text style={[styles.subtitle, textColor && { color: textColor }]} numberOfLines={1}>
								{subtitle}
							</Text>
						)}
					</View>
				</View>
			);

		return (
			<View
				style={[
					styles.content,
					{
						justifyContent: 'center',
					},
				]}
			>
				<Text style={[styles.name, textColor && { color: textColor }]} numberOfLines={1}>
					{t('connecting')}
				</Text>
			</View>
		);
	}, [loginChecked, user, room, subtitle, textColor]);

	return (
		<View
			style={[
				styles.shadow,
				{
					height: height ? height : 56,
					maxHeight: height ? height : 56,
				},
				style && { ...style },
			]}
		>
			<View style={styles.container}>
				{headerLeft && headerLeft}
				<View style={styles.header}>
					{Avatar}
					{Content}
				</View>
				{headerRight && headerRight}
			</View>
		</View>
	);
}

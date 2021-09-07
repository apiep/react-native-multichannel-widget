import {ActivityIndicator, Text, View} from 'react-native';
import React from 'react';
import {atom} from 'jotai';
import {useAtomValue} from 'jotai/utils'
import {attachmentAtom, progressUploadingAtom} from '../../../contexts/state';
import styles from './styles';

const progressAtom = atom((get) => {
	let progressUploading = get(progressUploadingAtom);
	try {
		let progress = progressUploading.toString().split('.');
		return progress[0];
	} catch (_) {
		return progressUploading;
	}
});

function Loading(props) {
	const attachment = useAtomValue(attachmentAtom);
	const progressUploading = useAtomValue(progressUploadingAtom);
	const progress = useAtomValue(progressAtom);

	if (progress === 100 || progressUploading === -1) return null;
	return (
		<View {...props}>
			<ActivityIndicator size="large" color="#475540"/>
			{(progress !== '' && attachment.type !== '') && <View style={styles.container}>
				<Text style={styles.progress}>{progress}%</Text>
			</View>}
		</View>
	);
}

export default Loading;

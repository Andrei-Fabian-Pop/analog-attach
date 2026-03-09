import { memo } from 'react';
import styles from './DeviceInstanceList.module.scss';
import { DeviceInstanceItem } from './DeviceInstanceItem';
import { useDeviceInstanceStore } from '../../store';
import { type AttachedDeviceState } from "extension-protocol";

interface DeviceInstanceListProps {
	deviceInstances: AttachedDeviceState[];
}

function DeviceInstanceListComponent({ deviceInstances }: DeviceInstanceListProps) {
	const EditableDeviceInstance = useDeviceInstanceStore((state) => state.EditableDeviceInstance);

	const editableDeviceUID = EditableDeviceInstance?.deviceUID;

	return (
		<div className={styles.deviceInstanceListContainer}>
			{deviceInstances.map((deviceInstance) => (
				<DeviceInstanceItem
					key={deviceInstance.deviceUID}
					deviceInstance={deviceInstance}
					highlighted={deviceInstance.deviceUID === editableDeviceUID}
				/>
			))}
		</div>
	);
}

export const DeviceInstanceList = memo(DeviceInstanceListComponent);
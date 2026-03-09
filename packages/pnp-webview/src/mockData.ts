/**
 * Mock data for development when VS Code backend is not available.
 * This data is only used when vscodeStore.isConnected is false.
 * When VS Code backend is available, real data from the backend should be used.
 */


import type { Device } from './store/useDeviceStore';
import type { DeviceGroupData } from './store/types';
import type { DeviceConfiguration, DeviceUID } from '../../extension-protocol/src/api-commands/payloads';
import type { AttachedDeviceState, ParentNode } from 'extension-protocol';
import type { EditableDeviceConfiguration } from './store/useDeviceInstanceStore';
import deviceConfigurationJson from './store/output_device_condiguration.json';

/**
 * Mock device instances for development
 */
export const mockDeviceInstances: AttachedDeviceState[] = [
    {
        type: "AttachedDeviceState",
        compatible: 'ad7124-8',
        deviceUID: crypto.randomUUID(),
        name: 'AD7124-8',
        alias: undefined,
        active: true,
        hasErrors: true,
        hasChannels: false,
        parentNode: {
            uuid: crypto.randomUUID(),
            name: 'I2C Bus'
        },
        maxChannels: 8,
        channels: [],
    },
    {
        type: "AttachedDeviceState",
        compatible: 'device-instance-2',
        deviceUID: crypto.randomUUID(),
        name: 'AD7124-8 (1)',
        alias: undefined,
        active: true,
        hasErrors: false,
        hasChannels: false,
        parentNode: {
            uuid: crypto.randomUUID(),
            name: 'I2C Bus'
        },
        maxChannels: 8,
        channels: []
    },
    {
        type: "AttachedDeviceState",
        compatible: 'device-instance-3',
        deviceUID: 'parent-node-spi-1/ad7124-8-2',
        name: 'AD7124-8',
        alias: "Alias 1: Sensor with Some Channels",
        active: false,
        hasErrors: false,
        hasChannels: true,
        parentNode: {
            uuid: crypto.randomUUID(),
            name: 'SPI Bus'
        },
        maxChannels: 8,
        channels: [
            { name: "Channel 1", alias: "Channel_Alias", hasErrors: true },
            { name: "Channel 2", alias: "", hasErrors: true },
            { name: "IN+", alias: "", hasErrors: true },
            { name: "IN-", alias: "", hasErrors: false },
            { name: "IO0", alias: "", hasErrors: false },
            { name: "IO1", alias: "", hasErrors: true },
        ]
    },
    {
        type: "AttachedDeviceState",
        compatible: 'device-instance-4',
        deviceUID: 'parent-node-spi-2/ad7124-8-3',
        name: 'AD7124-8',
        alias: "Alias 1: Sensor with Some Channels",
        active: false,
        hasErrors: false,
        hasChannels: true,
        parentNode: {
            uuid: crypto.randomUUID(),
            name: 'SPI Bus'
        },
        maxChannels: 8,
        channels: [
            { name: "Channel 1", alias: "Channel_Alias", hasErrors: true },
            { name: "Channel 2", alias: "", hasErrors: true },
            { name: "IN+", alias: "", hasErrors: true },
            { name: "IN-", alias: "", hasErrors: false },
            { name: "IO0", alias: "", hasErrors: false },
            { name: "IO1", alias: "", hasErrors: true },
        ]
    },
    {
        type: "AttachedDeviceState",
        compatible: 'device-instance-5',
        deviceUID: 'parent-node-spi-3/ad7124-8-4',
        name: 'AD7124-8',
        alias: "Alias 1: Sensor with Some Channels",
        active: false,
        hasErrors: false,
        hasChannels: true,
        parentNode: {
            uuid: crypto.randomUUID(),
            name: 'SPI Bus'
        },
        maxChannels: 8,
        channels: [
            { name: "Channel 1", alias: "Channel_Alias", hasErrors: true },
            { name: "Channel 2", alias: "", hasErrors: true },
            { name: "IN+", alias: "", hasErrors: true },
            { name: "IN-", alias: "", hasErrors: false },
            { name: "IO0", alias: "", hasErrors: false },
            { name: "IO1", alias: "", hasErrors: true },
        ]
    },
    {
        type: "AttachedDeviceState",
        compatible: 'device-instance-6',
        deviceUID: 'parent-node-spi-4/ad7124-8-5',
        name: 'AD7124-8',
        alias: "Alias 1: Sensor with Some Channels",
        active: false,
        hasErrors: false,
        hasChannels: true,
        parentNode: {
            uuid: crypto.randomUUID(),
            name: 'SPI Bus'
        },
        maxChannels: 8,
        channels: [
            { name: "Channel 1", alias: "Channel_Alias", hasErrors: true },
            { name: "Channel 2", alias: "", hasErrors: true },
            { name: "IN+", alias: "", hasErrors: true },
            { name: "IN-", alias: "", hasErrors: false },
            { name: "IO0", alias: "", hasErrors: false },
            { name: "IO1", alias: "", hasErrors: true },
        ]
    }
];

/**
 * Mock devices for development
 */
export const mockDevices: Device[] = [
    {
        deviceId: "adc0",
        name: "ADC0",
        description: "12-bit ADC Channel 0",
        group: "ADC"
    },
    {
        deviceId: "adc1",
        name: "ADC1",
        description: "12-bit ADC Channel 1",
        group: "ADC"
    },
    {
        deviceId: "adc2",
        name: "ADC2",
        description: "12-bit ADC Channel 2",
        group: "ADC"
    },
    {
        deviceId: "timer0",
        name: "TIMER0",
        description: "General Purpose Timer 0",
        group: undefined
    },
    {
        deviceId: "uart0",
        name: "UART0",
        description: "Universal Async Receiver/Transmitter",
        group: "UART"
    },
    {
        deviceId: "ungrouped1",
        name: "Ungrouped Device 1",
        description: "A device without a group",
        group: undefined
    }
];

/**
 * Get mock device groups grouped by group
 */
export function getMockDeviceGroups(): DeviceGroupData[] {
    const groups = new Map<string | undefined, Device[]>();
    for (const device of mockDevices) {
        const group = device.group;
        if (!groups.has(group)) {
            groups.set(group, []);
        }
        groups.get(group)!.push(device);
    }

    return [...groups.entries()].map(([group, devices]) => ({
        group,
        devices
    }));
}

/**
 * Get mock configuration for a device instance
 */
export function getMockConfiguration(deviceUID: DeviceUID): EditableDeviceConfiguration {
    return {
        deviceUID: deviceUID,
        payload: deviceConfigurationJson.payload.deviceConfiguration as DeviceConfiguration
    };
}

/**
 * Mock parent nodes for development
 */
export const mockParentNodes: ParentNode[] = [
    {
        uuid: crypto.randomUUID(),
        name: "SPI Bus"
    },
    {
        uuid: crypto.randomUUID(),
        name: "I2C Bus"
    },
    {
        uuid: crypto.randomUUID(),
        name: "UART Bus"
    },
    {
        uuid: crypto.randomUUID(),
        name: "GPIO"
    },
    {
        uuid: crypto.randomUUID(),
        name: "Analog Input"
    },
    {
        uuid: crypto.randomUUID(),
        name: "Analog Output"
    }
];

/**
 * Get mock parent node names as string array (for simple display)
 */
export function getMockParentNodeNames(): string[] {
    return mockParentNodes.map(node => node.name);
}

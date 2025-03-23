import "reflect-metadata";
import { Text } from 'react-native';

jest.mock('@react-native-async-storage/async-storage', () =>
    require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

process.env.TEST_DB = 'node';


// should makes font loading work in jest
(global as any).loadedNativeFonts = [];
interface MockedIconType extends React.FC<{ name: string }> {
    loadFont: () => void;
}
jest.mock('react-native-vector-icons/FontAwesome', () => {
    const React = require('react');
    const { Text } = require('react-native');
    const MockedIcon: MockedIconType = ((props: any) =>
        React.createElement(Text, null, props.name)
    ) as MockedIconType;
    MockedIcon.loadFont = () => {};
    return MockedIcon;
});

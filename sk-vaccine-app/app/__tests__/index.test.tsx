import React, { ReactNode } from 'react';
jest.mock("expo-sqlite", () => ({
  openDatabaseSync: jest.fn().mockReturnValue({
    execAsync: jest.fn(),
    getAllAsync: jest.fn(),
    getFirstAsync: jest.fn(),
    runAsync: jest.fn(),
    execSync: jest.fn(),
    getAllSync: jest.fn(),
  } as unknown as SQLite.SQLiteDatabase),
}));
import * as SQLite from 'expo-sqlite';
import { render, fireEvent } from '@testing-library/react-native';

import Index, {CLINIC_BTN_TEXT, BOOKING_BTN_TEXT, RECORDS_BTN_TEXT, VACCINE_BTN_TEXT} from '../index';






import { useNavigation } from 'expo-router';


// mock the logger to test its calls
jest.mock("@/utils/logger", () => ({
  error: jest.fn(),
  info: jest.fn(),
  warning: jest.fn(),
  debug: jest.fn(),
}));


jest.mock('expo-router', () => {
    const React = require('react');
    return {
    __esModule: true,
    // mock for links
    Link: ({
        href,
        children,
      }: {
        href: string;
        children: React.ReactElement;
      }) => {
        // get the mocked navigation
        const { useNavigation } = require('expo-router');
        const navigation = useNavigation();
        
        // clone the child element 
        return React.cloneElement(children, {
          onPress: (...args: any[]) => {
            // onPress from the child
            if (children.props.onPress) {
              children.props.onPress(...args);
            }
            // simulate navigation
            navigation.navigate(href);
          },
        });
      },    useNavigation: jest.fn(),
    };
});
  

jest.mock('expo-router/build/global-state/routing', () => ({
    isReady: jest.fn(() => true),
    navigate: jest.fn(),
    goBack: jest.fn(),
}));



  

const mockNavigation = {
    isReady: jest.fn(() => true),
    setOptions: jest.fn(),
    navigate: jest.fn(),
    goBack: jest.fn()
};


beforeEach(() => {
    jest.clearAllMocks();

    
    // make useNavigation return the mock object
    //useNavigation.mockReturnValue(mockNavigation);


});

describe('Index (home screen)', () => {

    it('renders correctly', () => {

        const { getByText } = render(<Index/>);
        expect(getByText(CLINIC_BTN_TEXT)).toBeTruthy();
        expect(getByText(BOOKING_BTN_TEXT)).toBeTruthy();
        expect(getByText(RECORDS_BTN_TEXT)).toBeTruthy();
        expect(getByText(VACCINE_BTN_TEXT)).toBeTruthy();

        
    });

    it('should navigate to vaccine-info', () => {
        const {getByText} = render(<Index />);
        const vaccineInfoBtn = getByText(VACCINE_BTN_TEXT);
        fireEvent.press(vaccineInfoBtn);
        expect(mockNavigation.navigate).toHaveBeenCalledWith('/vaccine-info');
    });



    it('should navigate to clinic-info and back', () => {
        const {getByText} = render(<Index />);
        const vaccineInfoBtn = getByText(VACCINE_BTN_TEXT);
        fireEvent.press(vaccineInfoBtn);

        expect(mockNavigation.navigate).toHaveBeenCalledWith('/vaccine-info');
    });




});
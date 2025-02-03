import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Index, {TITLE_TEXT, CLINIC_BTN_TEXT, BOOKING_BTN_TEXT, RECORDS_BTN_TEXT, VACCINE_BTN_TEXT} from '..';
import { useNavigation } from 'expo-router';
import { goBack, navigate } from 'expo-router/build/global-state/routing';
import {
    PATH_HOME,
    PATH_VACCINE_INFO,
    CLINIC_INFO,
} from '../../utils/constPaths'

import ChinButton from '../../components/home-btn-chin'
import SquareButton from '../../components/home-btn-square'




jest.mock('expo-router', () => ({
  __esModule: true,
  useNavigation: jest.fn(),
}));

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
    (useNavigation as jest.Mock).mockReturnValue(mockNavigation);

});

describe('Index (home screen)', () => {

    it('renders correctly', () => {

        const { getByText } = render(<Index />);
        expect(getByText(TITLE_TEXT)).toBeTruthy();
        expect(getByText(CLINIC_BTN_TEXT)).toBeTruthy();
        expect(getByText(BOOKING_BTN_TEXT)).toBeTruthy();
        expect(getByText(RECORDS_BTN_TEXT)).toBeTruthy();
        expect(getByText(VACCINE_BTN_TEXT)).toBeTruthy();

        
    });

    it('should navigate to vaccine-info', () => {
        const {getByText} = render(<Index />);
        const vaccineInfoBtn = getByText(PATH_VACCINE_INFO);
        fireEvent.press(vaccineInfoBtn);

        expect(mockNavigation.navigate).toHaveBeenCalledWith('/vaccine-info');
    });



    it('should navigate to clinic-info and back', () => {
        const {getByText} = render(<Index />);
        const vaccineInfoBtn = getByText(CLINIC_INFO);
        fireEvent.press(vaccineInfoBtn);

        expect(mockNavigation.navigate).toHaveBeenCalledWith('/vaccine-info');
    });




});
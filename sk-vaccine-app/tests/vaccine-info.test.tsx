import VaccineInfo from "../app/vaccine-info";
import React from 'react';
import {render, fireEvent, waitFor} from '@testing-library/react-native';

describe('VaccineInfo vaccine_list', () =>{
    it('Should filter out vaccines based on search input', ()=>{
        const{ getByPlaceholderText, getByText} = render(<VaccineInfo />);
        const search_input = getByPlaceholderText( 'Search...');
        fireEvent.changeText(search_input, 'FluShield');
        expect(getByText('FluShield Plus')).toBeTruthy();
        });

    it('Should display the newly added vaccine to list', () =>{
        const initialVaccines = [
            'FluShield Plus',
            'ImmuGuard',
            'Virasafe'
            ];

        const { getByPlaceholderText, getByText, rerender } = render(<VaccineInfo initialVaccines={initialVaccines} />);
        const new_vaccine = 'A_vaccine';
        const search_input = getByPlaceholderText('Search...');
        fireEvent.changeText(search_input, 'A_vaccine');
        rerender(<VaccineInfo initialVaccines = {[...initialVaccines, new_vaccine]} />);
        expect(getByText(new_vaccine)).toBeTruthy();
        });

    it('Should remove vaccine from the list and not display it', () => {
        const {queryByTestId, rerender}= render(<VaccineInfo />);
        const updated_vaccine = [
            'FluShield Plus',
            'ImmuGuard'
            ];
        rerender(<VaccineInfo initialVaccines = {updated_vaccine} />);
        expect(queryByTestId('Safeguard')).toBeNull();
        });
    });
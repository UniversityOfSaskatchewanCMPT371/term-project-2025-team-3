import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import ClinicInfo from '../clinic-info';
import { db } from '../../myorm/decorators';

// Mock the SQLite database and the getAllSync method
jest.mock('../../myorm/decorators', () => ({
  ...jest.requireActual('../../myorm/decorators'),
  db: {
    getAllSync: jest.fn((query: string) => {
      // Check if the query is for table information (PRAGMA table_info)
      if (query.includes('PRAGMA table_info')) {
        return [
          { name: 'id', type: 'INTEGER', notnull: 0, pk: 1 },
          { name: 'name', type: 'TEXT', notnull: 0, pk: 0 },
          { name: 'address', type: 'TEXT', notnull: 0, pk: 0 },
        ];  // Mocked return for table_info query
      }

      // Return a default empty array for all other queries
      return [];
    }),
    execSync: jest.fn(),
  },
}));

describe('ClinicInfo', () => {
  beforeEach(() => {

    db.getAllSync.mockClear();
    db.execSync.mockClear();
  });

  it('renders clinic data correctly', async () => {
    render(<ClinicInfo />);

    // Ensure the clinic data or a specific part of the UI renders correctly
    expect(await screen.findByText('Clinic Data')).toBeTruthy();  // Adjust based on actual UI text
  });

  it('handles search input correctly', async () => {
    render(<ClinicInfo />);

    const searchInput = screen.getByPlaceholderText('Search clinics');
    fireEvent.changeText(searchInput, 'Test Clinic');

    // Verify that the input value matches what was entered
    expect(searchInput.props.value).toBe('Test Clinic');
  });

  it('shows an error message when fetching data fails', async () => {
    // Simulate a failure scenario for db.getAllSync
    db.getAllSync.mockImplementationOnce(() => {
      throw new Error('Database error');
    });

    render(<ClinicInfo />);

    // Wait for the error message to be displayed after data fetch failure
    expect(await screen.findByText('Failed to load clinic data')).toBeTruthy();  // Adjust this text based on actual error message displayed
  });

  it('calls db.getAllSync on mount', async () => {
    render(<ClinicInfo />);

    // Wait for db.getAllSync to be called once the component mounts
    await waitFor(() => {
      expect(db.getAllSync).toHaveBeenCalledWith(
        expect.stringContaining('PRAGMA table_info') // Ensure this matches your query logic
      );
    });
  });

});

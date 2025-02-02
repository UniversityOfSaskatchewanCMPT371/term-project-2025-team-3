import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import OfflineMapWithUserLocation from '../map';

// mock Mapbox
jest.mock('@rnmapbox/maps', () => {
  const actualMapbox = jest.requireActual('@rnmapbox/maps');
  return {
    __esModule: true,
    ...actualMapbox,
    offlineManager: {
      getPacks: jest.fn(),
      deletePack: jest.fn(),
      createPack: jest.fn(),
    },

    // dont render the camera in tests
    // log its props
    Camera: jest.fn((props) => {
      console.log('Camera Props:', props); 
      return null;
    }),

  };
});

// mock expo-location
import * as Location from 'expo-location';
import { Camera } from '@rnmapbox/maps';
import { DEFAULT_LOCATION } from '@/src/utils/map';

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
}));







describe('OfflineMapWithUserLocation', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders default location if permission not granted', async () => {
    // simulate denied permission
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValueOnce({ status: 'denied' });

    // return null position
    (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValueOnce(null);


    // the map will be rendered and try to access the location
    render(<OfflineMapWithUserLocation />);


    // Wait for the effect to run
    await waitFor(() => {
      expect(Location.requestForegroundPermissionsAsync).toHaveBeenCalledTimes(1);
    });
    // because permission was denied it should not try to get current position
    expect(Location.getCurrentPositionAsync).not.toHaveBeenCalled();


    // check if the coordinates are the default ones
    expect(Camera).toHaveBeenCalledWith(
      expect.objectContaining({
        defaultSettings: expect.objectContaining({
          centerCoordinate: [-106.63950601098527, 52.13000521154595],
        }),
      })
    );
  
  });

  it('renders with actual user location if permission is granted', async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValueOnce({ status: 'granted' });
    (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValueOnce({
      coords: { latitude: 40, longitude: -100 },
    });

    render(<OfflineMapWithUserLocation />);

    await waitFor(() => {
      expect(Location.requestForegroundPermissionsAsync).toHaveBeenCalledTimes(1);
    });

    // it should call getCurrentPositionAsync because it was granted
    expect(Location.getCurrentPositionAsync).toHaveBeenCalledTimes(1);




    // check if the coordinates are correct
    expect(Camera).toHaveBeenCalledWith(
      expect.objectContaining({
        defaultSettings: expect.objectContaining({
          centerCoordinate: [-100, 40],
        }),
      })
    );
  });
});

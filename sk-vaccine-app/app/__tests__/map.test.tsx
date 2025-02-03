import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import OfflineMapWithUserLocation from '../map';
import MapboxGL from '@rnmapbox/maps';
import {
  deleteAllOfflinePacks,
  downloadOfflinePack,
  fetchUserLocation,
  getBoundingBox,
  manageOfflineData,
} from '../../src/map';

// mock Mapbox
jest.mock('@rnmapbox/maps', () => {
  // The actual ES Module from rnmapbox/maps
  const actualMapbox = jest.requireActual('@rnmapbox/maps');

  return {
    __esModule: true,
    ...actualMapbox,
    default: {
      ...actualMapbox.default,
      offlineManager: {
        getPacks: jest.fn(),
        deletePack: jest.fn(),
        createPack: jest.fn(),
      },
      Camera: jest.fn((props) => {
        console.log('Camera Props:', props);
        return null;
      }),
    },
  };
});


// mock expo-location
import * as Location from 'expo-location';
import { Camera } from '@rnmapbox/maps';
import { DEFAULT_LOCATION } from '@/src/map';

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
}));

const originalLog = console.log;
const originalError = console.error;

// mock console
beforeAll(() => {
  console.log = jest.fn();
  console.error = jest.fn();
});

// unmock console at the end
afterAll(() => {
  console.log = originalLog;
  console.error = originalError;
});

beforeEach(() => {
  jest.clearAllMocks();
});


describe('deleteAllOfflinePacks', () => {
  it('should retrieve all packs and delete them', async () => {
    // mock the getPacks method to return a list of packs
    (MapboxGL.offlineManager.getPacks as jest.Mock).mockResolvedValueOnce([
      { name: 'Pack1' },
      { name: 'Pack2' },
    ]);

    // mock deletePack
    (MapboxGL.offlineManager.deletePack as jest.Mock).mockResolvedValueOnce(null);

    await deleteAllOfflinePacks();

    expect(MapboxGL.offlineManager.getPacks).toHaveBeenCalledTimes(1);
    expect(MapboxGL.offlineManager.deletePack).toHaveBeenCalledTimes(2);
    expect(MapboxGL.offlineManager.deletePack).toHaveBeenCalledWith('Pack1');
    expect(MapboxGL.offlineManager.deletePack).toHaveBeenCalledWith('Pack2');

  });

  it('should log error if something goes wrong', async () => {
    (MapboxGL.offlineManager.getPacks as jest.Mock).mockRejectedValueOnce(new Error('test error'));

    await deleteAllOfflinePacks();

    expect(console.log).toHaveBeenCalledWith('Error deleting offline packs:', expect.any(Error));
  });
});




describe('downloadOfflinePack', () => {
  it('should create an offline pack successfully', async () => {
    // mock createPack
    (MapboxGL.offlineManager.createPack as jest.Mock).mockResolvedValueOnce(null);

    await downloadOfflinePack([0, 0], 0.27, 0.27, 10, 20);

    expect(MapboxGL.offlineManager.createPack).toHaveBeenCalledTimes(1);
    expect(MapboxGL.offlineManager.createPack).toHaveBeenCalledWith(
      {
        name: 'offlinePack',
        styleURL: 'mapbox://styles/mapbox/streets-v11',
        bounds: [
          [0 - 0.27 / 2, 0 - 0.27 / 2],
          [0 + 0.27 / 2, 0 + 0.27 / 2]
        ],
        minZoom: 10,
        maxZoom: 20
      },
      expect.any(Function), // progressListener
      expect.any(Function)  // errorListener
      
    );

    expect(console.log).toHaveBeenCalledWith('Offline pack created successfully.');
  });

  it('should log error if createPack fails', async () => {
    (MapboxGL.offlineManager.createPack as jest.Mock).mockRejectedValueOnce(new Error('test error'));

    await downloadOfflinePack([0, 0]);

    expect(console.error).toHaveBeenCalledWith('Error creating offline pack:', expect.any(Error));
  });
});



describe('fetchUserLocation', () => {
  it('should return the user location if granted', async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValueOnce({status: 'granted'});
    
    (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValueOnce(
      {
        coords: {
          longitude: 123.45,
          latitude: 54.321
        }
      }
    );

    let result  = await fetchUserLocation();
    
    
    expect(Location.getCurrentPositionAsync).toHaveBeenCalledTimes(1);
    expect(result).toEqual([123.45, 54.321]);
  });

  it('should return null if permission is not granted', async () => {

    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValueOnce({status: 'denied'});
    let result = await fetchUserLocation();

    expect(Location.getCurrentPositionAsync).not.toHaveBeenCalled();
    expect(result).toBeNull();
    expect(console.log).toHaveBeenCalledWith('User does not allow location usage');
  });

  it('should throw error if permission is granted but location is null/invalid', async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValueOnce({ status: 'granted' });
    (Location.getCurrentPositionAsync as jest.Mock).mockRejectedValueOnce(new Error('Location error'));

    await expect(fetchUserLocation()).rejects.toThrow('Got null location even though permission is granted');
  });
});


describe('getBoundingBox', () => {
  it('should return the correct bounding box', () => {
    const position = [100, 50];
    const width = 0.5;
    const height = 1.0;
    const bbox = getBoundingBox(position, width, height);

    // expect the bounding box to be
    //   [ 100 - 0.25, 50 - 0.5 ]
    //   [ 100 + 0.25, 50 + 0.5 ]
 

    expect(bbox).toEqual([
      [99.75, 49.5],
      [100.25, 50.5]
    ]);
  });
});






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

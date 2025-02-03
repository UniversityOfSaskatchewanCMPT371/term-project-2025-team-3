import {
  StyleSheet,
} from 'react-native';
import MapboxGL from '@rnmapbox/maps';
import { Position } from '@rnmapbox/maps/lib/typescript/src/types/Position';
import * as Location from 'expo-location';




export const DEFAULT_LOCATION: Position = [-106.63950601098527, 52.13000521154595];




/**
 * deletes maps stored for offline use by MapboxGL
 */
export const deleteAllOfflinePacks = async () => {
  try {
    const packs = await MapboxGL.offlineManager.getPacks();
    for (const pack of packs) {
      await MapboxGL.offlineManager.deletePack(pack.name);
      console.log(`Deleted offline pack: ${pack.name}`);
    }
  } catch (error) {
    console.log('Error deleting offline packs:', error);
  }
};



/**
 * downloads map area around user
 * @param centerCord the cordinate that the data should be loaded around
 * @param width the width of the box in degrees of longitude
 * @param height the height of the box in degrees of latitude
 * @param minZoom the minimum zoom height to download
 * @param maxZoom the maximum zoom height to download
 */
export async function downloadOfflinePack(
  centerCord: Position, 
  width = 0.27,
  height = 0.27,
  minZoom = 10,
  maxZoom = 20
): Promise<void>{

  const options = {
    name: 'offlinePack',
    styleURL: 'mapbox://styles/mapbox/streets-v11',
    bounds: getBoundingBox(centerCord, width, height),
    minZoom: minZoom,
    maxZoom: maxZoom,
  };

  const progressListener = (_region: any, status: { percentage: number }) => {
    console.log(`Offline download progress: ${status.percentage}%`);
  };

  const errorListener = (_region: any, error: any) => {
    console.error('Offline download error:', error);
  };

  try {
    await MapboxGL.offlineManager.createPack(options, progressListener, errorListener);
    console.log('Offline pack created successfully.');
  } catch (error) {
    console.error('Error creating offline pack:', error);
  }
};

/**
 * gets the user's location from the system
 * @returns the location if it is available, null otherwise
 */
export const fetchUserLocation = async (): Promise<Position | null> => {
  try {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.log('User does not allow location usage');
      return null;
    }
    const location = await Location.getCurrentPositionAsync({});
    return [location.coords.longitude, location.coords.latitude] as Position;

  } catch (error) {
    throw new Error("Got null location even though permission is granted");
  }
};



/**
 * calculates the box around the postion to download
 * @param position the postion the box should be around
 * @param width the width of the box in degrees of longitude
 * @param height the height of the box in degrees of latitude
 * @returns the ne and sw position
 */
export const getBoundingBox = (position: Position, width: number, height: number): [Position, Position] => {
  return [
    [position[0] - width/2, position[1] - height/2],
    [position[0] + width/2, position[1] + height/2],
  ];
};


/**
 * clears the offline data cache and downloads the offline data arround position.
 * @param position location to get offline data for
 */
export const manageOfflineData = async (position: Position) => {
  await deleteAllOfflinePacks();
  await downloadOfflinePack(position);
};






import iLocationData from '@/interfaces/iLocationData';
import { LocationAccessError } from '@/utils/ErrorTypes';
import * as Location from 'expo-location';


/**
 * gets the user's location using the expo-location module
 */
export default class LocationData implements iLocationData {
    
    /**
     * Checks if the user allows the app to access their location.
     * @returns true if enabled, false otherwise
     */
    async isEnabled(): Promise<boolean> {
        return await Location.hasServicesEnabledAsync();
    }


    /**
     * Get the user's last known location.
     * @returns [latitude, longitude]. `latitude` must be from -90 to 90. 
     *  `longitude` must be from -180 to 180.
     * @throws LocationAccessError if it cannot access the user's location.
     */
    async getLocation(): Promise<[number, number]>  {
        let location = await Location.getLastKnownPositionAsync();
        if (location == null) {
            throw new LocationAccessError("Cannot access user's location");
        }

        

        return [location.coords.latitude, location.coords.longitude];
    }


    /**
     * Request access to user location data.
     * @returns true if permission is granted, false otherwise.
     */
    async requestPermission(): Promise<boolean> {
        return (await Location.requestForegroundPermissionsAsync()).granted;
    }




}
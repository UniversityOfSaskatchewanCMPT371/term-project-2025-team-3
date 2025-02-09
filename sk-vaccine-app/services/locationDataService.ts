import iLocationData from '@/interfaces/iLocationData';
import * as Location from 'expo-location';

export class LocationAccessError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "LocationAccessError";
    }
}

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
     * @returns [latitude, longitude].
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
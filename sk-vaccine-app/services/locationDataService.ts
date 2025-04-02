import iLocationData from '@/interfaces/iLocationData';
import { LocationAccessError } from '@/utils/ErrorTypes';
import assert from 'assert';
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

    /**
     * Returns the distance between 2 latitude and longatude coordinates.
     * Modified from:
     * https://stackoverflow.com/questions/27928/calculate-distance-between-two-latitude-longitude-points-haversine-formula
     * @param l1 List with [latitude, longatude]. Latitude must be between -90 and 90 degrees.
     * Longatude must be between must be between -180 and 180 degrees.
     * @param l1 List with [latitude, longatude]. Latitude must be between -90 and 90 degrees.
     * Longatude must be between must be between -180 and 180 degrees.
     * @returns The distance between the 2 points in kilometers.
     */
    compareLocations(l1: [number, number], l2: [number, number]): number {
        assert(l1[0] >= -90 && l1[0] <= 90, "Latitude of `l1` must be between -90 and 90 degrees");
        assert(l1[1] >= -180 && l1[1] <= 180, "Longitude of `l1` must be between -180 and 180 degrees");
        assert(l2[0] >= -90 && l2[0] <= 90, "Latitude of `l2` must be between -90 and 90 degrees");
        assert(l2[1] >= -180 && l2[1] <= 180, "Longitude of `l2` must be between -180 and 180 degrees");


        const R = 6371; // Radius of the earth in km
        const dLat = (l1[0]-l2[0]) * (Math.PI/180);  // Convert distance from degrees to radians
        const dLon = (l1[1]-l2[1]) * (Math.PI/180); 
        const a = 
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(l1[0] * (Math.PI/180)) * Math.cos(l2[0]  * (Math.PI/180)) * 
          Math.sin(dLon/2) * Math.sin(dLon/2)
          ; 
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
        const distance = R * c; // Distance in km

        assert(distance >= 0, "distance should not be negative");
        assert(distance <= 40075 / 2, "distance should not be greater than half the circumference of the earth")
        return distance;
    }
      




}
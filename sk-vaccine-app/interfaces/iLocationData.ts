


/**
 * Interface for retrieving the device's location.
 */
export default interface iLocationData {


    
    /**
     * Checks if the user allows the app to access their location.
     * @returns true if enabled, false otherwise
     */
    isEnabled(): Promise<boolean>;


    /**
     * Get the user's last known location.
     * @returns [latitude, longitude].
     * @throws LocationAccessError if it cannot access the user's location.
     */
    getLocation(): Promise<[number, number]>;



    /**
     * Request access to user location data.
     * @returns true if permission is granted, false otherwise.
     */
    requestPermission(): Promise<boolean>;

    /**
     * Returns the distance between 2 latitude and longatude coordinates.
     * @param l1 List with [latitude, longatude]. Latitude must be between -90 and 90 degrees.
     * Longatude must be between must be between -180 and 180 degrees.
     * @param l1 List with [latitude, longatude]. Latitude must be between -90 and 90 degrees.
     * Longatude must be between must be between -180 and 180 degrees.
     * @returns The distance between the 2 points in kilometers.
     */
    compareLocations(l1: [number, number], l2: [number, number]): number;



}
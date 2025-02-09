


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
}
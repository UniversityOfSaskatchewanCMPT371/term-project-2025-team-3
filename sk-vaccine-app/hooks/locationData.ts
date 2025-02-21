


import iLocationData from "@/interfaces/iLocationData";
import { LocationAccessError } from "@/utils/ErrorTypes";
import { useState, useEffect } from 'react';
import { isEnabled } from "react-native/Libraries/Performance/Systrace";



/**
 * Data about the user's location.
 */
class LocationResponse {
    /** The [Latitude, Longitude of the device */
    location?:[number, number] | null;
    /** If an error occurs it is stored here */
    error?: string | null;
    /** If the location is in the process of loading it is true, otherwise false */
    loading?: boolean;
    /** true if location access is enabled, false otherwise */
    isEnabled?: boolean;

}


/**
 * A hook that gets the location of the user.
 * @param locationService The service used to manage location.
 * @returns Data about the current status of the location.
 */
export default function useLocation(locationService: iLocationData): LocationResponse {
    const [location, setLocation] = useState<[number, number] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [isEnabled, setIsEnabled] = useState<boolean>(false);

    useEffect(() => {
        const fetchLocation = async () => {

            setLoading(true);
            setError(null);

            let enabled = await locationService.isEnabled();

            
            if (enabled || (await locationService.requestPermission())) {
                /* if location permision is granted */
                enabled = true;
                try {
                    const loc = await locationService.getLocation();
                    setLocation(loc);
                } 
                catch (err) {
                    if (err instanceof LocationAccessError) {
                        setError(err.message);
                    } 
                    else if (err instanceof Error) {
                        setError(`uncaught error: ${err.message}`);
                    } 
                    else {
                        setError(`unexpected error: ${err}`);
                    }
                }
            } 
            else {
                setError("location access disabled");
            }

            setIsEnabled(enabled);
            setLoading(false);
        };

        fetchLocation();
    }, []);


    let response =  {
        location: location,
        error: error,
        loading: loading,
        isEnabled: isEnabled
    }
    return response;
    
}
import iClinicData from "@/interfaces/iClinicData";
import iLocationData from "@/interfaces/iLocationData";
import { Clinic, ClinicArray } from "@/services/clinicDataService";
import logger from "@/utils/logger";
import assert from "assert";
import { useEffect, useState, useRef } from "react";

export const JSON_TIMESTAMP_KEY = "time-created"

/**
 * Holds the current state of loading clinic data.
 */
class ClinicResults {
    /** stores loaded clinic data */
    clinicArray: ClinicArray | null;
    /** true if the clinic array is still loading, otherwise false */
    loading: boolean;
    /** true if the remote storage of the clinic data cannot be accessed, false otherwise */
    serverAccessFailed: boolean;
    /** if an error occurs a string representing the error is stored */
    error: string | null;

    /**
     * Stored data related to loading clinic details.
     *
     * @param {Partial<ClinicResults>} data The input data for initializing the object.
     * 
     * @property {ClinicArray | null} [data.clinicArray] The array of clinics. Defaults to `null` if not loaded.
     * @property {boolean} [data.loading] Indicates whether data is currently loading. Defaults to `false`.
     * @property {boolean} [data.serverAccessFailed] Specifies if a server access failure occurred. Defaults to `false`.
     * @property {string | null} [data.error] Holds an error message if an error occurs. Defaults to `null` if no error.
     */
    constructor(data: Partial<ClinicResults>) {
        this.clinicArray = data.clinicArray ?? null;
        this.loading = data.loading ?? false;
        this.serverAccessFailed = data.serverAccessFailed ?? false;
        this.error = data.error ?? null;
    }
}

/**
 * Retrieves clinic data.
 *
 * @param {Object} data The configuration for getting clinic information.
 * @param {iClinicData} data.clinicService The interface to use to access clinic data.
 * @param {string} [data.url] The URL to retrieve the JSON formatted clinic data from. 
 *   If null, only retrieves files stored on device.
 * @param {string} [data.searchValue] Value to search for in the list of clinics. 
 *   If null or an empty string, it gets all of the clinics.
 * @param {string} [data.searchColumn] The column to search for `searchValue` in. 
 *   Ignored unless `searchValue` is set. If null, all columns are searched.
 * @param {Boolean} [data.sortByDistance] If set to `true` then the clinics are sorted 
 * by their distance to the user, `false` by default. If `true` the `locationService` parameter
 * must be set.
 * @param {iLocationData} [data.locationService] This is required if `data.sortByDistance` is `true`.
 * The service provides the users location.
 *
 * @returns {ClinicResults} Object representing the current status of clinic data loading, containing:
 *   @property {ClinicArray | null} `clinicArray`  
 *      The array of loaded clinics, or `null` if not loaded.
 *   @property {boolean} `loading`  
 *      `true` if the clinic data is still loading, otherwise `false`.
 *   @property {boolean} `serverAccessFailed`  
 *      `true` if there was a failure accessing the remote clinic data, otherwise `false`.
 *   @property {string | null} `error`  
 *      An error message if an error occurred, or `null` if no error.
 */
export default function useClinicData(
    data: { clinicService: iClinicData, url?: string, searchValue?: string, searchColumn?: string, sortByDistance?: Boolean, locationService?: iLocationData }
): ClinicResults {
    const { clinicService, url, searchValue, searchColumn, sortByDistance, locationService } = data;
    
    const [clinics, setClinics] = useState<ClinicArray | null>(null);
    const [loading, setLoading] = useState(true);
    const [accessFailed, setAccessFailed] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [reload, setReload] = useState(0); // only used to re render the component


    assert(!(searchColumn && !searchValue), "there should be a search value if their is a search column");
    assert(!sortByDistance || locationService, "is sortByDistance is true, then there must be a locationService");

    // store clinicService in a ref so its reference does not change
    const clinicServiceRef = useRef(clinicService);

    useEffect(() => {
        const fetchResults = async () => {
            let clinicArray: ClinicArray | null = null;
            try {
                

                // if there is no url and local storage is empty fail
                if (!url && loading && await clinicServiceRef.current.isStorageEmpty()) {
                    setError("No clinic data available locally");
                    setLoading(false);
                    return;
                }
                // retrieve from local storage
                if (!(await clinicServiceRef.current.isStorageEmpty())) {
                    if (searchValue && searchColumn) {
                        clinicArray = await clinicServiceRef.current.searchClinics(searchValue, searchColumn);
                    } else if (searchValue) {
                        clinicArray = await clinicServiceRef.current.searchClinics(searchValue);
                    } else {
                        clinicArray = await clinicServiceRef.current.getClinics();
                    }
                }



                // if a url is provided get remote data
                if (url && loading) {
                    try {
                        const response = await fetch(url);
                        if (!response.ok) {
                            setAccessFailed(true);
                            setError(response.statusText);
                        } else {
                            const jsonResponse = await response.json();
                            
                            


                            const remoteClinics = new ClinicArray(
                                jsonResponse.clinics,
                                new Date(jsonResponse[JSON_TIMESTAMP_KEY])
                            );

                            assert(
                                !isNaN(remoteClinics.timeStamp.getTime()), 
                                `time retrieved from server is not a valid time, the time: ${jsonResponse[JSON_TIMESTAMP_KEY]}`
                            );

                            // only store remote clinics if they are more recent
                            if (
                                (await clinicServiceRef.current.isStorageEmpty()) ||
                                remoteClinics.timeStamp > (await clinicServiceRef.current.getTimeStamp())
                            ) {

                                
                                // get clinics based on search values
                                if (searchValue && searchColumn) {
                                    await clinicServiceRef.current.storeClinics(remoteClinics);
                                    clinicArray = await clinicServiceRef.current.searchClinics(searchValue, searchColumn);

                                } else if (searchValue) {
                                    await clinicServiceRef.current.storeClinics(remoteClinics);
                                    clinicArray = await clinicServiceRef.current.searchClinics(searchValue);
                        
                                } else {
                                    // because no search is needed we can display the clinics we got from the server
                                    // without storing them first, this change should make the program much faster, at least I hope it will
                                    // Update: it worked
                                    clinicServiceRef.current.storeClinics(remoteClinics).then( () => {
                                        setReload(reload);
                                    });

                                    clinicArray = remoteClinics;

                                }
                            }
                        }
                    } catch (fetchError) {
                        setAccessFailed(true);
                        setError(String(fetchError));

                        
                    }
                }


                // sort clinics by distance to user if location access is enabled
                if (sortByDistance && clinicArray && await locationService!.requestPermission()) {
                    const location = await locationService!.getLocation();
                    clinicArray!.clinics =  clinicArray!.clinics.sort(
                        (a: Clinic, b: Clinic) => {
                            // make sure undefined cordinates go to the end of the list
                            if ((a.latitude == undefined || a.longitude  == undefined) && (b.latitude  == undefined || b.longitude  == undefined)) {
                                return 0;
                            }
                            else if (a.latitude == undefined || a.longitude  == undefined) {
                                // indicate that `a` is larger than `b`
                                return 1;
                            }
                            else if (b.latitude == undefined || b.longitude  == undefined) {
                                // indicate that `b` is larger than `a`
                                return -1;
                            }
                            else {
                                assert(a.latitude! >= -90 && a.latitude! <= 90, "Latitude of `a` must be between -90 and 90 degrees");
                                assert(a.longitude! >= -180 && a.longitude! <= 180, "Longitude of `a` must be between -180 and 180 degrees");
                                assert(b.latitude! >= -90 && b.latitude! <= 90, "Latitude of `b` must be between -90 and 90 degrees");
                                assert(b.longitude! >= -180 && b.longitude! <= 180, "Longitude of `b` must be between -180 and 180 degrees");
    
    
                                const distA = locationService!.compareLocations(location, [a.latitude!, a.longitude!]);
                                const distB = locationService!.compareLocations(location, [b.latitude!, b.longitude!]);
                                return distA - distB;
                            }



                        }
                    );

                }
                
                setClinics(clinicArray);



            } catch (error) {
                setError(String(error));
            } finally {
                assert(error || clinicArray, "when done loading their should be clinics or an error")
                setLoading(false);
            }
        };

        fetchResults();
    }, [url, searchValue, searchColumn]);

    const response = {
        clinicArray: clinics,
        loading: loading,
        serverAccessFailed: accessFailed,
        error: error,
    } as ClinicResults;

    return response;
}

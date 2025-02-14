import iClinicData, { ClinicArray } from "@/interfaces/iClincData";




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
    /** if an error occures a string representing the error is stored */
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
 * @param {iClinicData} [data.clinicService] The interface to use to access clinic data.
 * @param {string} [data.url] The URL to retrieve the json formatted clinic data from. 
 *   If null only retrieves files stored on device.
 * @param {string} [data.searchValue] Value to search for in the list of clinics. 
 *   If null it gets all of the clinics.
 * @param {number} [data.searchColumn] The column to search for `seachValue` in. 
 *   Ignored unless `searchValue` is set. If null, all columns are searched.
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
    data: {clinicService: iClinicData, url?:string, searchValue?:string, searchColumn?:number}
): ClinicResults {


    return new ClinicResults({});
}
import { ClinicArray } from "@/services/clinicDataService";





/**
 * Manages stored clinics.
 */
export default interface iClinicData {
    /**
     * Replace all clinics stored on device with new ones.
     * @param clinics A list of clinics.
     */
    storeClinics(clinics: ClinicArray): Promise<void>;

    /**
     * Gets a list of all clinics stored on device.
     * @return An object with all the clinic's data, with a timestamp of the last time it was updated
     *      or null if no data is stored.
     * @throws EmptyStorageError If no clinics are stored.
     */
    getClinics(): Promise<ClinicArray>;

    /**
     * Search for clinics that are stored on device.
     * @param input The value to search for.
     * @param column The text column to search in, if left blank all column are searched.
     * @return An array of all of the clinics containing `input`.
     * @throws EmptyStorageError If no clinics are stored.
     * @throws InvalidArgumentError If `column` is not a valid column. 
     *      Use `Clinicdata.getTextColumns()` to get a list of valid columns.
     */
    searchClinics(input:string, column?:string): Promise<ClinicArray>;


    /**
     * Gets the time the clinic data was created
     * @return The time the data was created
     * @throws EmptyStorageError If no clinics are stored.
     */
    getTimeStamp(): Promise<Date>;
    /**
     * Checks if a string is a valid text column name.
     * @param columnName Name of the column to validate
     * @returns `true` if column is valid, `false` otherwise.
     */
    isValidTextColumn(columnName: string): Promise<boolean>;

    /**
     * Gets a list of text column names.
     * @returns A list of text column names.
     */
    getTextColumns(): Promise<string[]>;

    /**
     * Checks if the clinic data storage is empty.
     * @returns `true` no clinics are stored, `false` otherwise.
     */
    isStorageEmpty(): Promise<boolean>;


    /**
     * Deletes all stored clinic data and timestamp
     */
    emptyStorage(): Promise<void>;
}
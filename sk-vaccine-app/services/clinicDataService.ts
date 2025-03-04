import ClinicEntity from "@/myorm/clinic-entity";
import iClinicData from "@/interfaces/iClinicData";
import { EmptyStorageError, InvalidArgumentError } from "@/utils/ErrorTypes";
import AsyncStorage from '@react-native-async-storage/async-storage';
import logger from "@/utils/logger";

export const CLINIC_TIMESTAMP_KEY='clinic-data-timestamp';

/**
 * Stores data about a clinic.
 */
export interface Clinic {
    latitude?: number;
    longitude?: number;
    serviceArea: string;
    name: string;
    address: string;
    contactInfo: string;
    hours: string;
    services: Array<string>;


}




/**
 * Stores a set of clinics
 */
export class ClinicArray {
    clinics: Array<Clinic>;
    timeStamp: Date;

    /**
     * Stores a set of clinics 
     * @param clinics Array of clinic data.
     * @param timeStamp Time clinic data was originally created
     */
    constructor(clinics: Array<Clinic>, timeStamp: Date) {
        this.clinics = clinics;
        this.timeStamp = timeStamp;
    }
}





/** Stores clinic data using SQLite */
export default class ClinicData implements iClinicData {

    /**
     * Replace all clinics stored on device with new ones.
     * @param clinics A list of clinics. All attributes must be defined.
     * @effects stores each clinic as a row in the dabase
     */
    async storeClinics(clinics: ClinicArray): Promise<void> {
        logger.debug("storeClinics called")


        ClinicEntity.clear();
        await AsyncStorage.setItem(CLINIC_TIMESTAMP_KEY, clinics.timeStamp.toISOString());

        for (const clinic of clinics.clinics) {
            const clinicEntity = new ClinicEntity(clinic);
            await clinicEntity.save();
        }

        

    }

    /**
     * Gets a list of all clinics stored on device.
     * @return An object with all the clinic's data, with a timestamp of the last time it was updated
     *      or null if no data is stored.
     * @throws EmptyStorageError If no clinics are stored.
     */
    async getClinics(): Promise<ClinicArray> {
        if (await this.isStorageEmpty()) {
            throw new EmptyStorageError("No clinic data available locally");
        }
        const clinics = await ClinicEntity.find();

        
        return new ClinicArray(clinics, await this.getTimeStamp());
    }

    /**
     * Search for clinics that are stored on device.
     * @param input The value to search for.
     * @param column The text column to search in, if left blank all column are searched.
     *  The column must be a valid text column name in the ClinicData table.
     * @return An array of all of the clinics containing `input`.
     * @throws EmptyStorageError If no clinics are stored.
     * @throws InvalidArgumentError If `column` is not a valid column. 
     *      Use `Clinicdata.getTextColumns()` to get a list of valid columns.
     */
    async searchClinics(input:string, column?:string): Promise<ClinicArray> {
        let clinicArray: Array<Clinic>;

        if (await this.isStorageEmpty()) {
            throw new EmptyStorageError("No clinic data available locally");
        }


        if (column) {
            if (!(await this.isValidTextColumn(column))) {
                const validColumns = await this.getTextColumns();
                throw new InvalidArgumentError(`Invalid column name: ${column}, \n\tValid column names are: ${validColumns.join(', ')}`);
            }
            
            clinicArray = await ClinicEntity.queryObjs(`SELECT * from $table WHERE ${column} LIKE ?`, `%${input}%`);

        }
        else {

            let query = `SELECT * from $table WHERE`;


            const textColumns = await this.getTextColumns();
            
            textColumns.forEach((column, index) => {
                if (index === 0) {
                    query += ` ${column} LIKE ?`;
                }
                else {
                    query += ` OR ${column} LIKE ?`;
                }
            });



            clinicArray = await ClinicEntity.queryObjs(query, ...(textColumns.map(() => `%${input}%`)));
        }

        
        
        return new ClinicArray(
            clinicArray,
            await this.getTimeStamp()
        );

    }


    /**
     * Gets the time the clinic data was created
     * @return The time the data was created
     * @throws EmptyStorageError If no clinics are stored.
     */
    async getTimeStamp(): Promise<Date> {
        const timeStr = await AsyncStorage.getItem(CLINIC_TIMESTAMP_KEY);
        if (timeStr == null) {
            throw new EmptyStorageError("No clinic data available locally");
        }

        return new Date(timeStr);

    }
    /**
     * Checks if a string is a valid text column name.
     * @param columnName Name of the column to validate
     * @returns `true` if column is valid, `false` otherwise.
     */
    async isValidTextColumn(columnName: string): Promise<boolean> {
        const columns = await this.getTextColumns();
        return columns.some(col => col === columnName);
    }

    /**
     * Gets a list of text column names.
     * @returns A list of text column names.
     */
    async getTextColumns(): Promise<string[]> {
        const columns = await ClinicEntity.getColumns();
        return columns.filter(col => {
            const type = col.type;
            return type === "TEXT" || type?.includes("VARCHAR") || type?.includes("CHARACTER");
          }).map(col => col.name!);
    }

    /**
     * Checks if the clinic data storage is empty.
     * @returns `true` no clinics are stored, `false` otherwise.
     */
    async isStorageEmpty(): Promise<boolean> {
        const timeStr = await AsyncStorage.getItem(CLINIC_TIMESTAMP_KEY);
        const count = await ClinicEntity.count();
        
        return timeStr === null || timeStr === '' || count === 0;
    }


    /**
     * Deletes all stored clinic data and timestamp
     * @effects removes all rows in the clinic data table 
     */
    async emptyStorage(): Promise<void> {
        await ClinicEntity.clear();
        await AsyncStorage.removeItem(CLINIC_TIMESTAMP_KEY);
    }


}



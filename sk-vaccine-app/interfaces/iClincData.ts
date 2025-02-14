


/**
 * Stores data about a clinic.
 */
export class Clinic {
    latitude?: number;
    longitude?: number;
    serviceArea: string;
    name: string;
    address: string;
    contactInfo: string;
    hours: string;
    services: Array<string>;

    /**
     * Builds a clinic using a partial object with, specific fields required
     * @param data A partial clinic object with required fields
     */
    constructor(data: Partial<Clinic> & {
        serviceArea: string,
        name: string,
        address: string,
        contactInfo: string,
        hours: string,
        services: Array<string>
    }) {
        this.serviceArea = data.serviceArea;
        this.name = data.name;
        this.address = data.address;
        this.contactInfo = data.contactInfo;
        this.hours = data.hours;
        this.services = data.services;
        this.longitude = data.longitude;
        this.latitude = data.longitude;
    }
}
/**
 * Stores a set of clinics
 */
export class ClinicArray {
    clinics: Array<Clinic>;
    timeStamp: Date;

    /**
     * Builds a clinic.
     * @param data Clinic data object.
     */
    constructor(data: {clinics: Array<Clinic>, timeStamp: Date}) {
        this.clinics = data.clinics;
        this.timeStamp = data.timeStamp;
    }
}


/**
 * Manages stored clinics.
 */
export default interface iClinicData {
    /**
     * Replace all clinics stored on device with new ones.
     * @param clinics A list of clinics.
     */
    storeClinics(clinics: ClinicArray): void;

    /**
     * Gets a list of all clinics stored on device.
     * @return An object with all the clinic's data, with a timestamp of the last time it was updated
     */
    getClinics(): ClinicArray;

    /**
     * Search for clinics that are stored on device.
     * @param input The value to search for.
     * @param field The field to search in, if left blank all fields are searched.
     * @return An array of all of the clinics containing `input`.
     */
    searchClinics(input:string, field?:string): ClinicArray;

}


export type VaccineSheet = {
    vaccineName: string;
    associatedDiseases: string[];
    pdfPath: string;
    /* Whether an update attempt was succesful
       Might be no new version, but check succeeded
    */
    upToDate: boolean,
    /**
     * @field starting: This could be age or grade
     */
    starting: string,
};

export interface Vaccine {
    vaccineName: string;
    productId: number;
    englishFormatId: number;
    frenchFormatId: number;
    englishPDFFilename: string;
    frenchPDFFilename: string;
    starting: string;
    associatedDiseasesEnglish: string[];
    associatedDiseasesFrench: string[];
}

export type VaccineListResponse = {
    version: number,
    vaccines: VaccineInfoJSON[]
}

export type VaccineProduct = {
    productId: number,
    englishFormatId?: number,
    frenchFormatId?: number,
} 

export type VaccineInfoJSON = {
    vaccineName: string,
    productId: number,
    englishFormatId: number,
    frenchFormatId: number,
    starting: string,
    associatedDiseases: {
        english: string[],
        french: string[]
    }
}

export type VaccineUpdate = {
    nameEnglish?: string;
    nameFrench?: string;

    associatedDiseasesEnglish?: string[];
    associatedDiseasesFrench?: string[];
    
    englishPDFPath?: string;
    englishPDFFilename?: String;
    englishPDFLastChecked: string;

    frenchPDFPath?: string;
    frenchPDFFilename?: string;
    frenchPDFLastChecked: string;

    starting: string;
}

export interface iVaccineDataService {

    /**
     * Attempts to fetch all vaccine PDFs
     * @returns a list of paths where the pdfs have been
     * downloaded to.
     * 
     * Note:
     * This is going to be private within the class I think?
     * 
     */
    //fetchPDFs(): string[];

    /**
     * Attempts to update the database with new pdfs and
     * updates any data given.
     * @returns a boolean, whether the update was successful
     */
    updateVaccineData(toUpdate: VaccineUpdate[]): boolean

    /**
     * @async This function is run asynchronously
     * Replaces the 
     * @returns a boolean, whether the update was successful
     */
    updatePDFFiles(uris: string[]): Promise<boolean>;


    getVaccineSheetsSHA(): Promise<Response[]>;


    /**
    * Queries the database for vaccine sheets
    * @param input The value to search for.
    * @param field The field to search in, might be removed might be
    * updated to reflect multiple options
    * @param language The language to query for
    * @return A list of responses from the 
    */
    vaccineQuery(input: string, language: string, field?: string): VaccineSheet[];


}


export interface iVaccineDataController {

    /**
    * Gets a list of all vaccines stored on device.
    * @return a list of vaccine sheets
    */
    getVaccines(): VaccineSheet[];


    /**
    * Makes a request to update the vaccine PDFs
    * @return true if the update was sucessfull, and false if 
    * there was an error
    */
    updateVaccines(): boolean;

    /**
    * Search for vaccine sheets that are stored on device.
    * @param input The value to search for.
    * @param field The field to search in, might be removed might be
    * updated to reflect multiple options
    * @return A list of vaccine sheets filtered by the input
    */
    searchVaccines(input:string, field?:string): VaccineSheet[];



}
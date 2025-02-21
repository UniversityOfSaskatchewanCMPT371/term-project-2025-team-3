

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

export type VaccineListResponse = {
    version: number,
    vaccines: VaccineListJSON[]
}

export type VaccineListJSON = {
    vaccineName: string,
    productID: number,
    starting: string,
    associatedDiseases: {
        english: string[],
        french: string[]
    }
}

export type VaccineUpdate = {
    nameEnglish?: string;
    nameFrench?: string;

    descriptionEnglish?: string;
    descriptionFrench?: string;

    associatedDiseasesEnglish?: string[];
    associatedDiseasesFrench?: string[];
    
    englishPDFPath?: string;
    englishPDFDate?: String;
    englishPDFLastChecked: string;

    frenchPDFPath?: string;
    frenchPDFDate?: string;
    frenchPDFLastChecked: string;

    startingAge?: string;
    startingGrade?: string;
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
     * Replaces the 
     * @returns a boolean, whether the update was successful
     */
    updatePDFFiles(uris: string[]): Promise<boolean>;


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
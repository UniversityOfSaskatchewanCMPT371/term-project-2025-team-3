

export type VaccineSheet = {
    vaccineName: string;
    associatedDiseases: string[];
    pdfsPaths: [
        english: string,
        french: string,
    ];
    /* Whether an update attempt was succesful
       Might be no new version, but check succeeded
    */
    upToDate: boolean,
} & (
    | { startingAge: number; startingGrade?: never }
    | { startingGrade: number; startingAge?: never }
    /* This enforces that one MUST be present but
       ONLY one can be present
    */
);




export default interface iVaccineData {

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
    searchVaccines(input:string, field?:string): VaccineSheet;



}
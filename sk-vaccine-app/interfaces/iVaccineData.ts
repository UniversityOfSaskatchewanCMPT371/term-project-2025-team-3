

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


}
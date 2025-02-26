import { iVaccineDataController, VaccineListResponse, VaccinePDFData, VaccineSheet } from "@/interfaces/iVaccineData";
import VaccineEntity from "@/myorm/vaccine-entity";
import { VaccineDataService } from "@/services/vaccineDataService";
import logger from "@/utils/logger";

class VaccineDataController implements iVaccineDataController {
    private vaccineDataService: VaccineDataService;


    constructor(vaccineDataService: VaccineDataService) {
    this.vaccineDataService = vaccineDataService;
  }

    getVaccines(): VaccineSheet[] {
        throw new Error("Method not implemented.");
    }

    /**
     * Checks the remote vaccine list with a call to a local private functio. 
     * PDFs are also checked to ensure they are up to date. Depending on these
     * checks all are updated
     * 
     * This requires internet connectivity and a check WILL be in place
     * 
     * 
     * @returns 
     *     | true if the update was successful
     *     | false if the update was unsuccesful
     */
    async updateVaccines(): Promise<boolean> {
    try {
        const upToDate = await this.vaccineListUpToDate();
        console.log("vaccineListUpToDate returned:", upToDate); // Log the value of upToDate
        if (!upToDate) {
            console.log("Updating vaccine list..."); // Log that updateVaccineList will be called
            await this.updateVaccineList();
        }

        const pdfsToUpdate = await Promise.all(
            (await this.vaccineDataService.compareExternalPDFs()).map(async (vaccine: VaccinePDFData) => {
                try {
                    if (vaccine.english?.formatId) {
                        await this.vaccineDataService.downloadVaccinePDF(vaccine.productId, vaccine.english.formatId);
                    }
                    if (vaccine.french?.formatId) {
                        await this.vaccineDataService.downloadVaccinePDF(vaccine.productId, vaccine.french.formatId);
                    }
                    if (vaccine.english || vaccine.french) {
                        await this.vaccineDataService.updateLocalPDFFilenames(vaccine.productId, vaccine.english?.filename, vaccine.french?.filename);
                    }
                } catch (error) {
                    logger.error(`Error updating pdfs in updateVaccines`);
                    return false;
                }
            })
        );
        return true; // Return success when all pdfs are updated.
    } catch (error) {
        logger.error(`Error in updateVaccines: ${error.message}`);
        return false;
    }
}


    /**
     * Gets the remote vaccine list, updates the local version and local list
     * 
     * Pre Condiitons:
     *      - The `vaccine` datatable must exist.
     *      - There must be internet connectivity.
     * Post Condiitons:
     *      This modifies the `vaccine` datatable, updating each altered row.
     * 
     */
    private async updateVaccineList() {
        try {
            const vaccineList: VaccineListResponse = await this.vaccineDataService.getVaccineListRemote();
            await this.vaccineDataService.storeVaccineListVersionLocal(vaccineList.version);
            await this.vaccineDataService.storeVaccineListLocal(vaccineList.vaccines);
        } catch (error) {
            logger.error(`Error updating vaccine list: ${error.message}`);
        }
    }

    /**
     * Checks if the local vaccine list is up to date with the remote one.
     * 
     * Pre Conditions:
     *      - There must be interet connectivity
     * 
     * 
     * @returns A promise containing a boolean value. True if the list is
     * up to date, false otherwise
     */
    private async vaccineListUpToDate(): Promise<boolean> {
        const remoteVersion = await this.vaccineDataService.getVaccineListVersionRemote();
        const localVersion = await this.vaccineDataService.getVaccineListVersionLocal();
        return remoteVersion === localVersion;
    }

    /**
     * 
     * Takes in an input string to search by and filter fields
     * 
     * @param input Must be a string
     * @param field Does not need to be present, currently a string, should be
     * a catagory in the future
     * 
     * @returns a list of vaccine sheets to be displayed
     */
    searchVaccines(input: string, field?: string): VaccineSheet[] {
        throw new Error("Method not implemented.");
    }
}

export default VaccineDataController;
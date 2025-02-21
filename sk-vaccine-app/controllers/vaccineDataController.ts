import { iVaccineDataController, VaccineListResponse, VaccinePDFData, VaccineSheet } from "@/interfaces/iVaccineData";
import VaccineEntity from "@/myorm/vaccine-entity";
import { vaccineDataService } from "@/services/vaccineDataService";
import logger from "@/utils/logger";


class VaccineDataContoller implements iVaccineDataController {

    getVaccines(): VaccineSheet[] {
        throw new Error("Method not implemented.");
    }

    /**
     * 
     * @returns 
     *     | true if the update was successful
     *     | false if the update was unsuccesful
     */
    updateVaccines(): boolean {
        
        this.vaccineListUpToDate().then(async (upToDate: boolean) => {
            if (!upToDate) {
                await this.updateVaccineList();
            } 
            const pdfsToUpdate = (await vaccineDataService.compareExternalPDFs()).map(async (vaccine: VaccinePDFData) => {
                try {
                    if (vaccine.english?.formatId) {
                        vaccineDataService.downloadVaccinePDF(vaccine.productId, vaccine.english.formatId);
                        
                    }
                    if (vaccine.french?.formatId) {
                        vaccineDataService.downloadVaccinePDF(vaccine.productId, vaccine.french.formatId);

                    }
                    if (vaccine.english || vaccine.french) {
                        vaccineDataService.updateLocalPDFFilenames(vaccine.productId, vaccine.english?.filename, vaccine.french?.filename);
                    }
                } catch (error) {
                    logger.error(`Error updating pdfs in updateVaccines`);
                    return false;
                }
            })
            await Promise.all(pdfsToUpdate)
        })
        return true;
    }

    private async updateVaccineList() {
        vaccineDataService.getVaccineListRemote().then(async (vaccineList: VaccineListResponse) => {
            await vaccineDataService.storeVaccineListVersionLocal(vaccineList.version);
            await vaccineDataService.storeVaccineListLocal(vaccineList.vaccines)
        }); 
    }

    

    /**
     * Checks if the local vaccine list is up to date with the remote one.
     * This will not work if there is no internet connection
     * @returns A promise containing a boolean value. True if the list is
     * up to date, false otherwise
     */
    private async vaccineListUpToDate(): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            const remoteVersion = await vaccineDataService.getVaccineListVersionRemote();
            const localVersion = await vaccineDataService.getVaccineListVersionLocal();
            resolve(remoteVersion === localVersion)
        })
    }

    searchVaccines(input: string, field?: string): VaccineSheet[] {
        throw new Error("Method not implemented.");
    }


}
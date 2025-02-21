import { iVaccineDataController, VaccineSheet } from "@/interfaces/iVaccineData";
import { vaccineDataService } from "@/services/vaccineDataService";


class VaccineDataContoller implements iVaccineDataController {

    getVaccines(): VaccineSheet[] {
        throw new Error("Method not implemented.");
    }

    updateVaccines(): boolean {
        throw new Error("Method not implemented.");
    }

    /**
     * Checks if the local vaccine list is up to date with the remote one.
     * This will not work if there is no internet connection
     * @returns A promise containing a boolean value. True if the list is
     * up to date, false otherwise
     */
    async vaccineListUpToDate(): Promise<boolean> {
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
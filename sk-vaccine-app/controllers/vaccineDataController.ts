import { iVaccineDataController, VaccineSheet } from "@/interfaces/iVaccineData";
import { VaccineDataService } from "@/services/vaccineDataService";


class VaccineDataContoller implements iVaccineDataController {

    getVaccines(): VaccineSheet[] {
        throw new Error("Method not implemented.");
    }

    updateVaccines(): boolean {
        throw new Error("Method not implemented.");
    }

    searchVaccines(input: string, field?: string): VaccineSheet[] {
        throw new Error("Method not implemented.");
    }


}
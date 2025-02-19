import { iVaccineDataService, VaccineSheet } from "@/interfaces/iVaccineData";

export class VaccineDataService implements iVaccineDataService {
    updateVaccines(): boolean {
        throw new Error("Method not implemented.");
    }
    getVaccines(): VaccineSheet[] {
        throw new Error("Method not implemented.");
    }
    searchVaccines(input: string, field?: string): VaccineSheet {
        throw new Error("Method not implemented.");
    }

}
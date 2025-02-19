import iVaccineData, { VaccineSheet } from "@/interfaces/iVaccineData";

class VaccineData implements iVaccineData {
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
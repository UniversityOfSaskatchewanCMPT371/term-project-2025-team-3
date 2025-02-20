import { iVaccineDataService, VaccineSheet, VaccineUpdate } from "@/interfaces/iVaccineData";

export class VaccineDataService implements iVaccineDataService {
    private fetchPDFs(): string[] {
        throw new Error("Method not implemented.");
    }

    updatePDFs(toUpdate: VaccineUpdate[]): boolean {
        throw new Error("Method not implemented.");
    }

    vaccineQuery(input: string, language: string, field?: string): VaccineSheet[] {
        throw new Error("Method not implemented.");
    }

}
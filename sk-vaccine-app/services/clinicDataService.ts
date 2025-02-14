import iClinicData, { ClinicArray } from "@/interfaces/iClincData";

class ClinicData implements iClinicData {
    storeClinics(clinics: ClinicArray): void {
        throw new Error("Method not implemented.");
    }
    getClinics(): ClinicArray {
        throw new Error("Method not implemented.");
    }
    searchClinics(input: string, field?: string): ClinicArray {
        throw new Error("Method not implemented.");
    }

}
import { iVaccineDataService, VaccineSheet, VaccineUpdate } from "@/interfaces/iVaccineData";
import logger from "@/utils/logger";
import * as FileSystem from "expo-file-system";

export class VaccineDataService implements iVaccineDataService {
    updateVaccineData(toUpdate: VaccineUpdate[]): boolean {
        throw new Error("Method not implemented.");
    }
    private fetchPDFs(): string[] {
        throw new Error("Method not implemented.");
    }

    updatePDFs(toUpdate: string[]): boolean {
        throw new Error("Method not implemented.");
    }

    vaccineQuery(input: string, language: string, field?: string): VaccineSheet[] {
        throw new Error("Method not implemented.");
    }

    private getProductIDs(): number[] {
        const productIDQuery = `SELECT product_id FROM vaccines`
        //TODO: Implememnt query execution, for now returns mock
        const productNumbers: number[] = [11766, 31990] //await executeQuery(productIDQuery);
        return productNumbers;
    }

    async updatePDFFiles(uris: string[]): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

    async getVaccineListJSON() {
        throw new Error("Method not implemented.");
    }

    async getVaccineSheetJSON() {
        const productIDs = this.getProductIDs();

        try {
            const fetchPromises = productIDs.map(async (product) => {
                try {
                const response = await fetch(`https://publications.saskatchewan.ca/api/v1/products/${product}`);
                
                if (!response.ok) {
                    throw new Error(`HTTP error, Status: ${response.status}`);
                }

                const data = await response.json();
                return data; // Return the fetched data for each product
                } catch (error) {
                    logger.error(`Enable to fetch product ${product}\nerror: `, error)
                    return null;
                }
            
            })
            // Wait for all promises to resolve and filter out any null values
            const JSONSheets = await Promise.all(fetchPromises);
        
        // Filter out any null values (in case some fetches failed)
        } catch (error) {
            logger.error("Error in getVaccineSheetJSON:", error);
            return [];
        }
    } 

        
}


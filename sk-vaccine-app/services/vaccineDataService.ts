import { iVaccineDataService, VaccineListJSON, VaccineListResponse, VaccineSheet, VaccineUpdate } from "@/interfaces/iVaccineData";
import logger from "@/utils/logger";
import * as FileSystem from "expo-file-system";
import tempJson from "@/services/__tests__/vaccineListService.data.json";
import AsyncStorage from '@react-native-async-storage/async-storage';

class VaccineDataService implements iVaccineDataService {
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
        const productNumbers: number[] = await VaccineEntity.createQueryBuilder("vaccine_product_ids")
                                                .where(`vaccine_product`)
        //TODO: Implememnt query execution, for now returns mock
        const productNumbers: number[] = [11766, 31990] //await executeQuery(productIDQuery);
        return productNumbers;
    }

    async updatePDFFiles(uris: string[]): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

    /**
     * Gets the remote version of the Vaccine List. This version number is 
     * obtained from the vaccine list JSON endpoint and store in async storage
     * 
     * If the version number is not present in storage a -1 is returned to
     * ensure that it is always less than the new version
     * @returns A promise containing the version number.
     */
    async getVaccineListVersionRemote(): Promise<number> {
        return new Promise((resolve, reject) => {
            try {
                // TODO: Put in an actual fetch wen there is somewhere to fetch from
                //const response = await fetch();
                const response = tempJson;
                resolve(response.version);

            } catch (error) {
                logger.error("Error getting remote vaccine list version\nError", error);
                reject(error);
            }
        })
    }

    /**
     * Stores the version of the Vaccine List. This version number is obtained
     * from the vaccine list JSON endpoint
     * @param version a string representing the version number to set
     */
    async storeVaccineListVersionLocal(version: number) {
        try {
            await AsyncStorage.setItem("vaccine_list_version", version.toString());
          } catch (error) {
            logger.error("Error saving value to AsyncStorage", error);
          }
    }

    /**
     * Gets the local version of the Vaccine List. This version number is 
     * obtained from the vaccine list JSON endpoint and store in async storage
     * 
     * If the version number is not present in storage a -1 is returned to
     * ensure that it is always less than the new version
     * @returns A promise containing the version number. It is type casted as
     * AsyncStorage can only store strings
     */
    async getVaccineListVersionLocal(): Promise<number> {
        return new Promise(async (resolve, reject) => {
            try {
                const version = await AsyncStorage.getItem("vaccine_list_version");
                if (version === null) {
                    resolve(-1);
                } else {
                    resolve(parseInt(version));
                }
              } catch (error) {
                logger.error("Error getting vaccine list version from AsyncStorage\nError", error);
                reject(error)
              }
        })
        
    }

    async getVaccineListJSON(): Promise<VaccineListResponse> {
        return new Promise((resolve, reject) => {
            try {
                // TODO: Don't have the link to request from yet
                //const response = await fetch()
                const response = tempJson;
                /*
                if (!response.ok) {
                    throw new Error(`HTTP error, Status: ${response.status}`);
                }
                const data = await response.json();
                */
               const data = response;
               resolve(data as VaccineListResponse);
            } catch (error) {
                logger.error("Error in getVaccineListJSON:", error)
                reject(error);
            }
        })
        
    }

    async getVaccineSheetJSON(): Promise<Response[]> {
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
            return JSONSheets
        // Filter out any null values (in case some fetches failed)
        } catch (error) {
            logger.error("Error in getVaccineSheetJSON:", error);
            return [];
        }
    } 

        
}

export const vaccineDataService = new VaccineDataService();

